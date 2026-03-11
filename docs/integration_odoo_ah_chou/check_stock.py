#!/usr/bin/env python3
"""
Vérification rapide de l'état du stock, lots, réceptions sur ah-chou1.odoo.com
"""

import os
import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

ODOO_URL = "https://ah-chou1.odoo.com"
EMAIL = "mathieu.loic.hoarau@gmail.com"
PASSWORD = "gbtN0WxuCVjg@g*C"

SCREENSHOTS_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "screenshots", "flux_vente"
)


def screenshot(page, name):
    path = os.path.join(SCREENSHOTS_DIR, name)
    page.screenshot(path=path, full_page=True)
    print(f"  ✅ Capture : {name}")


def wait_loading(page, timeout=10000):
    try:
        page.wait_for_load_state("domcontentloaded", timeout=timeout)
    except PlaywrightTimeout:
        pass
    try:
        page.wait_for_selector(".o_loading_indicator", state="hidden", timeout=5000)
    except PlaywrightTimeout:
        pass
    time.sleep(1.5)


def login(page):
    print("🔐 Connexion...")
    page.goto(f"{ODOO_URL}/web/login", wait_until="domcontentloaded", timeout=60000)
    time.sleep(3)
    page.fill("input[name='login']", EMAIL)
    page.fill("input[name='password']", PASSWORD)
    page.click("button[type='submit']")
    wait_loading(page, 15000)
    time.sleep(3)
    print("  ✅ Connecté")


def check(page):
    # 1. Réceptions (Inventaire → Réceptions)
    print("\n📦 1. Réceptions (achats reçus)")
    page.goto(f"{ODOO_URL}/odoo/inventory/receipts", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(3)
    screenshot(page, "check_receptions.png")

    rows = page.locator("tr.o_data_row")
    print(f"  → {rows.count()} réceptions trouvées")
    for i in range(min(rows.count(), 10)):
        text = rows.nth(i).inner_text()
        print(f"    {text.strip()[:120]}")

    # 2. Stock disponible (quants)
    print("\n📊 2. Stock actuel (Inventaire → Rapport → Stock)")
    page.goto(f"{ODOO_URL}/odoo/inventory/products", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(3)
    screenshot(page, "check_produits_stock.png")

    # 3. Lots existants
    print("\n🏷️ 3. Lots / Numéros de série")
    page.goto(f"{ODOO_URL}/odoo/inventory/products/lots", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(3)
    screenshot(page, "check_lots.png")

    rows_lots = page.locator("tr.o_data_row")
    print(f"  → {rows_lots.count()} lots trouvés")
    for i in range(min(rows_lots.count(), 10)):
        text = rows_lots.nth(i).inner_text()
        print(f"    {text.strip()[:120]}")

    # 4. Transferts (tous)
    print("\n🔄 4. Tous les transferts")
    page.goto(f"{ODOO_URL}/odoo/inventory/delivery-orders", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(3)
    screenshot(page, "check_livraisons.png")

    rows_tr = page.locator("tr.o_data_row")
    print(f"  → {rows_tr.count()} livraisons trouvées")
    for i in range(min(rows_tr.count(), 10)):
        text = rows_tr.nth(i).inner_text()
        print(f"    {text.strip()[:120]}")

    # 5. Opérations d'inventaire
    print("\n📋 5. Vue d'ensemble Inventaire")
    page.goto(f"{ODOO_URL}/odoo/inventory", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(3)
    screenshot(page, "check_inventory_overview.png")


def main():
    print("🔍 Vérification stock / réceptions / lots")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, slow_mo=200)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            locale="fr-FR",
        )
        page = context.new_page()
        try:
            login(page)
            check(page)
        except Exception as e:
            print(f"\n❌ Erreur : {e}")
            screenshot(page, "check_erreur.png")
            raise
        finally:
            browser.close()
    print("\n✅ Vérification terminée")


if __name__ == "__main__":
    main()
