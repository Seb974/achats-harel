#!/usr/bin/env python3
"""
Vérification détaillée : lots en stock, quantités, réceptions terminées
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


def check_detail(page):
    # 1. Lots — enlever le groupement par emplacement pour voir les détails
    print("\n🏷️ 1. Lots détaillés (sans groupement)")
    page.goto(f"{ODOO_URL}/odoo/inventory/products/lots", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(2)

    # Enlever le filtre/groupement "Emplacement"
    facet_remove = page.locator(".o_facet_remove")
    while facet_remove.count() > 0:
        facet_remove.first.click()
        wait_loading(page)
        time.sleep(1)
        facet_remove = page.locator(".o_facet_remove")

    time.sleep(2)
    screenshot(page, "check_lots_detail.png")

    rows = page.locator("tr.o_data_row")
    print(f"  → {rows.count()} lots trouvés")
    for i in range(min(rows.count(), 20)):
        text = rows.nth(i).inner_text()
        print(f"    {text.strip()[:150]}")

    # 2. Stock par produit (quants)
    print("\n📊 2. Stock par produit (Inventaire → Rapport → Historique de stock)")
    page.goto(f"{ODOO_URL}/odoo/inventory/reporting/inventory", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(3)
    screenshot(page, "check_stock_report.png")

    rows2 = page.locator("tr.o_data_row")
    print(f"  → {rows2.count()} lignes dans le rapport")
    for i in range(min(rows2.count(), 15)):
        text = rows2.nth(i).inner_text()
        print(f"    {text.strip()[:150]}")

    # 3. Réception terminée WH/IN/00004 (CORAL EXPORTS)
    print("\n📦 3. Détail réception terminée WH/IN/00004")
    page.goto(f"{ODOO_URL}/odoo/inventory/receipts", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(2)

    # Enlever filtres
    facet_remove2 = page.locator(".o_facet_remove")
    while facet_remove2.count() > 0:
        facet_remove2.first.click()
        wait_loading(page)
        time.sleep(0.5)
        facet_remove2 = page.locator(".o_facet_remove")

    time.sleep(1)

    # Cliquer sur WH/IN/00004 (Terminé)
    row_004 = page.locator("tr:has-text('WH/IN/00004')")
    if row_004.count() > 0:
        row_004.first.click()
        wait_loading(page)
        time.sleep(2)
        screenshot(page, "check_reception_terminee.png")

        # Lire le contenu
        form_text = page.locator(".o_form_view").inner_text()
        print(f"  → Contenu : {form_text[:500]}")
    else:
        print("  ⚠️ WH/IN/00004 non trouvé")

    # 4. Autre réception terminée récente (Asia Food ou Armement)
    print("\n📦 4. Dernière réception terminée")
    page.goto(f"{ODOO_URL}/odoo/inventory/receipts", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(2)

    facet_remove3 = page.locator(".o_facet_remove")
    while facet_remove3.count() > 0:
        facet_remove3.first.click()
        wait_loading(page)
        time.sleep(0.5)
        facet_remove3 = page.locator(".o_facet_remove")

    time.sleep(1)

    row_021 = page.locator("tr:has-text('WH/IN/00021')")
    if row_021.count() > 0:
        row_021.first.click()
        wait_loading(page)
        time.sleep(2)
        screenshot(page, "check_reception_recente.png")

        form_text2 = page.locator(".o_form_view").inner_text()
        print(f"  → Contenu : {form_text2[:500]}")
    else:
        # Essayer la dernière terminée
        row_term = page.locator("tr:has-text('Terminé')")
        if row_term.count() > 0:
            row_term.first.click()
            wait_loading(page)
            time.sleep(2)
            screenshot(page, "check_reception_recente.png")

    # 5. Vérifier le stock des 2 produits de la commande S00006
    print("\n🔍 5. Stock des produits Boulettes et Encornet")
    page.goto(f"{ODOO_URL}/odoo/inventory/products", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(2)

    # Chercher Boulettes
    search = page.locator(".o_searchview_input")
    if search.count() > 0:
        search.first.click()
        search.first.fill("boulette")
        search.first.press("Enter")
        wait_loading(page)
        time.sleep(2)
        screenshot(page, "check_stock_boulettes.png")

        rows_b = page.locator("tr.o_data_row")
        for i in range(min(rows_b.count(), 5)):
            text = rows_b.nth(i).inner_text()
            print(f"    Boulettes: {text.strip()[:150]}")


def main():
    print("🔍 Vérification détaillée stock / lots / réceptions")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, slow_mo=200)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            locale="fr-FR",
        )
        page = context.new_page()
        try:
            login(page)
            check_detail(page)
        except Exception as e:
            print(f"\n❌ Erreur : {e}")
            screenshot(page, "check_erreur.png")
            raise
        finally:
            browser.close()
    print("\n✅ Vérification détaillée terminée")


if __name__ == "__main__":
    main()
