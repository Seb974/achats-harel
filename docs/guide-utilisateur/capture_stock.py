#!/usr/bin/env python3
import asyncio
from playwright.async_api import async_playwright
from pathlib import Path

ODOO_URL = "https://ah-chou1.odoo.com"
EMAIL = "mathieu.loic.hoarau@gmail.com"
PASSWORD = "gbtN0WxuCVjg@g*C"
SCREENSHOTS_DIR = Path(__file__).parent / "images"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await ctx.new_page()

        # Login
        print("Logging in...")
        await page.goto(f"{ODOO_URL}/web/login")
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(2)
        await page.fill('input[name="login"]', EMAIL)
        await page.fill('input[name="password"]', PASSWORD)
        await page.click('button[type="submit"]')
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(5)

        # Inventory overview (operations: receipts, internal transfers, deliveries)
        print("Navigating to inventory overview...")
        await page.goto(f"{ODOO_URL}/odoo/inventory")
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(4)
        await page.screenshot(path=str(SCREENSHOTS_DIR / "14_odoo_inventory_operations.png"), full_page=True)
        print("  -> 14_odoo_inventory_operations.png")

        # Delivery orders (bons de livraison)
        print("Navigating to delivery orders...")
        await page.goto(f"{ODOO_URL}/odoo/inventory/delivery-orders")
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(4)
        await page.screenshot(path=str(SCREENSHOTS_DIR / "15_odoo_delivery_orders.png"), full_page=True)
        print("  -> 15_odoo_delivery_orders.png")

        # Internal transfers
        print("Navigating to internal transfers...")
        await page.goto(f"{ODOO_URL}/odoo/inventory/internal-transfers")
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(4)
        await page.screenshot(path=str(SCREENSHOTS_DIR / "16_odoo_internal_transfers.png"), full_page=True)
        print("  -> 16_odoo_internal_transfers.png")

        print("\nDone!")
        await asyncio.sleep(2)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
