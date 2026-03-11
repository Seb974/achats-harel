#!/usr/bin/env python3
"""
Script to automatically log into Odoo and capture screenshots for user documentation.
Requires: pip install playwright
Then run: playwright install chromium
"""

import asyncio
from playwright.async_api import async_playwright, Page
import os
from pathlib import Path

# Configuration
ODOO_URL = "https://ah-chou1.odoo.com"
EMAIL = "mathieu.loic.hoarau@gmail.com"
PASSWORD = "gbtN0WxuCVjg@g*C"
SCREENSHOTS_DIR = Path(__file__).parent / "images"

# Ensure screenshots directory exists
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)


async def wait_for_page_load(page: Page, timeout: int = 10000):
    """Wait for page to be fully loaded"""
    try:
        await page.wait_for_load_state("networkidle", timeout=timeout)
    except:
        await page.wait_for_load_state("domcontentloaded", timeout=timeout)
    await asyncio.sleep(1)  # Additional wait for animations


async def take_screenshot(page: Page, filename: str, description: str):
    """Take a screenshot and save it"""
    filepath = SCREENSHOTS_DIR / filename
    await page.screenshot(path=str(filepath), full_page=True)
    print(f"✓ {description}")
    print(f"  Saved: {filepath}")
    return filepath


async def go_home(page: Page):
    """Navigate back to Odoo home/app switcher"""
    await page.goto(f"{ODOO_URL}/odoo")
    await wait_for_page_load(page)
    await asyncio.sleep(2)


async def click_app(page: Page, app_name: str, timeout: int = 8000):
    """Click an app from the Odoo home screen"""
    try:
        selectors = [
            f".o_app[data-menu-xmlid*='{app_name.lower()}']",
            f"a.o_app:has-text('{app_name}')",
            f".o_apps .o_app:has-text('{app_name}')",
            f"a[data-section]:has-text('{app_name}')",
            f".o_home_menu a:has-text('{app_name}')",
        ]
        for selector in selectors:
            try:
                element = page.locator(selector).first
                if await element.count() > 0:
                    await element.click(timeout=timeout)
                    await wait_for_page_load(page)
                    await asyncio.sleep(2)
                    return True
            except:
                continue
        
        # Fallback: try any link/element containing the text
        element = page.get_by_text(app_name, exact=False).first
        if element and await element.count() > 0:
            await element.click(timeout=timeout)
            await wait_for_page_load(page)
            await asyncio.sleep(2)
            return True
        
        print(f"⚠ Warning: Could not find app '{app_name}'")
        return False
    except Exception as e:
        print(f"⚠ Warning: Error clicking app '{app_name}': {e}")
        return False


async def click_menu_item(page: Page, menu_text: str, timeout: int = 5000):
    """Click on a sub-menu item by text"""
    try:
        selectors = [
            f"a.o_nav_entry:has-text('{menu_text}')",
            f"button.o_nav_entry:has-text('{menu_text}')",
            f".o_menu_sections a:has-text('{menu_text}')",
            f".o_menu_sections button:has-text('{menu_text}')",
            f"a.dropdown-item:has-text('{menu_text}')",
            f"a:has-text('{menu_text}')",
            f"button:has-text('{menu_text}')",
        ]
        
        for selector in selectors:
            try:
                element = page.locator(selector).first
                if await element.count() > 0:
                    await element.click(timeout=timeout)
                    await wait_for_page_load(page)
                    return True
            except:
                continue
        
        print(f"⚠ Warning: Could not find menu item '{menu_text}'")
        return False
    except Exception as e:
        print(f"⚠ Warning: Error clicking menu '{menu_text}': {e}")
        return False


async def main():
    print("Starting Odoo screenshot capture automation...")
    print(f"Screenshots will be saved to: {SCREENSHOTS_DIR}\n")
    
    async with async_playwright() as p:
        # Launch browser (headless=False to see what's happening)
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080}
        )
        page = await context.new_page()
        
        try:
            # Step 1: Navigate to Odoo login page
            print("Step 1: Navigating to Odoo login page...")
            await page.goto(f"{ODOO_URL}/web/login")
            await wait_for_page_load(page)
            
            # Step 2: Fill in login credentials
            print("Step 2: Filling in login credentials...")
            await page.fill('input[name="login"]', EMAIL)
            await page.fill('input[name="password"]', PASSWORD)
            
            # Step 3: Click login button
            print("Step 3: Logging in...")
            await page.click('button[type="submit"]')
            await wait_for_page_load(page, timeout=15000)
            
            # Wait a bit more for dashboard to fully load
            await asyncio.sleep(3)
            
            print("\n=== Capturing Screenshots ===\n")
            
            # SCREENSHOT 1: Main dashboard
            await take_screenshot(
                page,
                "01_odoo_accueil_dashboard.png",
                "Screenshot 1: Main Dashboard/Home Page"
            )
            
            # SCREENSHOT 2-3: Achats (Purchases) — already captured
            # Skip if already done on first run
            
            # SCREENSHOT 4: Inventaire (Inventory/Stock) module
            print("\nNavigating to Inventaire (Inventory)...")
            await go_home(page)
            if await click_app(page, "Inventaire") or await click_app(page, "Stock"):
                await take_screenshot(
                    page,
                    "04_odoo_inventaire_vue.png",
                    "Screenshot 4: Inventory Overview"
                )
                
                # Try to navigate to Produits
                try:
                    if await click_menu_item(page, "Produits"):
                        await take_screenshot(
                            page,
                            "05_odoo_produits_liste.png",
                            "Screenshot 5: Products List"
                        )
                        
                        product = page.locator(".o_data_row").first
                        if await product.count() > 0:
                            await product.click()
                            await wait_for_page_load(page)
                            await asyncio.sleep(1)
                            await take_screenshot(
                                page,
                                "06_odoo_produit_fiche.png",
                                "Screenshot 6: Product Form"
                            )
                except:
                    print("  Note: Could not navigate to Products")
            else:
                print("  Trying direct URL...")
                await page.goto(f"{ODOO_URL}/odoo/inventory")
                await wait_for_page_load(page)
                await asyncio.sleep(2)
                await take_screenshot(
                    page,
                    "04_odoo_inventaire_vue.png",
                    "Screenshot 4: Inventory Overview (via URL)"
                )
            
            # SCREENSHOT 7-9: Ventes (Sales) module
            print("\nNavigating to Ventes (Sales)...")
            await go_home(page)
            if await click_app(page, "Ventes") or await click_app(page, "Sales"):
                await take_screenshot(
                    page,
                    "07_odoo_ventes_vue.png",
                    "Screenshot 7: Sales Module Overview"
                )
                
                try:
                    if await click_menu_item(page, "Commandes"):
                        await take_screenshot(
                            page,
                            "08_odoo_commandes_vente_liste.png",
                            "Screenshot 8: Sales Orders List"
                        )
                except:
                    print("  Note: Could not navigate to Sales Orders")
            else:
                print("  Trying direct URL...")
                await page.goto(f"{ODOO_URL}/odoo/sales")
                await wait_for_page_load(page)
                await asyncio.sleep(2)
                await take_screenshot(
                    page,
                    "07_odoo_ventes_vue.png",
                    "Screenshot 7: Sales Module Overview (via URL)"
                )
            
            # SCREENSHOT 11: Facturation/Comptabilité
            print("\nNavigating to Facturation (Invoicing)...")
            await go_home(page)
            if await click_app(page, "Facturation") or await click_app(page, "Comptabilité") or await click_app(page, "Accounting"):
                await take_screenshot(
                    page,
                    "11_odoo_facturation_vue.png",
                    "Screenshot 11: Invoicing/Accounting Overview"
                )
            else:
                print("  Trying direct URL...")
                await page.goto(f"{ODOO_URL}/odoo/accounting")
                await wait_for_page_load(page)
                await asyncio.sleep(2)
                await take_screenshot(
                    page,
                    "11_odoo_facturation_vue.png",
                    "Screenshot 11: Invoicing/Accounting (via URL)"
                )
            
            print("\n=== Screenshot Capture Complete ===")
            print(f"\nAll screenshots saved to: {SCREENSHOTS_DIR}")
            print("\nClosing browser in 3 seconds...")
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n❌ Error occurred: {e}")
            print("Taking error screenshot...")
            await page.screenshot(path=str(SCREENSHOTS_DIR / "error_screenshot.png"))
            raise
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
