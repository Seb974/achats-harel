#!/usr/bin/env python3
"""
Capture automatisée — Scénario 2 : Préparation de commande (Pick)
Depuis la commande S00006 confirmée, naviguer vers le picking et le traiter.
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
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)


def screenshot(page, name, full_page=True):
    path = os.path.join(SCREENSHOTS_DIR, name)
    page.screenshot(path=path, full_page=full_page)
    print(f"  ✅ Capture : {name}")
    return path


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
    print("\n🔐 Connexion à Odoo...")
    page.goto(f"{ODOO_URL}/web/login", wait_until="domcontentloaded", timeout=60000)
    time.sleep(3)
    page.fill("input[name='login']", EMAIL)
    page.fill("input[name='password']", PASSWORD)
    page.click("button[type='submit']")
    wait_loading(page, 15000)
    time.sleep(3)
    print("  ✅ Connecté")


def scenario_2_preparation(page):
    print("\n" + "=" * 60)
    print("📦 SCÉNARIO 2 : Préparation de commande (Pick)")
    print("=" * 60)

    # --- 07 : Accéder à la commande S00006 et cliquer sur Livraison ---
    print("\n📸 07 — Commande S00006 → bouton Livraison")
    page.goto(f"{ODOO_URL}/odoo/sales", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(2)

    # Enlever le filtre "Mes devis" pour voir toutes les commandes
    remove_filter = page.locator(".o_facet_remove, .o_searchview_facet .o_facet_remove")
    if remove_filter.count() > 0:
        remove_filter.first.click()
        wait_loading(page)
        time.sleep(1)

    # Cliquer sur S00006
    s00006 = page.locator("tr:has-text('S00006'), td:has-text('S00006')")
    if s00006.count() > 0:
        s00006.first.click()
        wait_loading(page)
        time.sleep(2)
    else:
        # Navigation directe
        page.goto(f"{ODOO_URL}/odoo/sales", wait_until="domcontentloaded", timeout=60000)
        wait_loading(page)
        time.sleep(2)

    screenshot(page, "07_commande_s00006_livraison.png")

    # --- Cliquer sur le bouton "Livraison" ---
    print("\n📸 08 — Bon de livraison (picking)")
    delivery_btn = page.locator("button:has-text('Livraison'), a:has-text('Livraison'), .oe_stat_button:has-text('Livraison')")
    if delivery_btn.count() > 0:
        delivery_btn.first.click()
        wait_loading(page)
        time.sleep(3)
        screenshot(page, "08_picking_livraison.png")
    else:
        print("  ⚠️  Bouton Livraison non trouvé")
        # Essayer via Inventaire
        page.goto(f"{ODOO_URL}/odoo/inventory", wait_until="domcontentloaded", timeout=60000)
        wait_loading(page)
        time.sleep(2)
        screenshot(page, "08_picking_livraison.png")

    # --- 09 : Vue du bon de livraison / transfert ---
    print("\n📸 09 — Détail du transfert (lignes produits)")
    # Analyser la page actuelle
    page_url = page.url
    print(f"  → URL actuelle : {page_url}")

    # Vérifier si on est sur un picking ou une liste
    picking_form = page.locator(".o_form_view")
    if picking_form.count() > 0:
        # On est sur le formulaire du picking
        screenshot(page, "09_detail_transfert.png")
    else:
        # On est peut-être sur une liste de pickings
        picking_row = page.locator("tr.o_data_row")
        if picking_row.count() > 0:
            picking_row.first.click()
            wait_loading(page)
            time.sleep(2)
            screenshot(page, "09_detail_transfert.png")

    # --- 10 : Voir les opérations détaillées ---
    print("\n📸 10 — Opérations détaillées (lots / quantités)")
    # Chercher l'onglet "Opérations détaillées" ou le bouton pour voir les lots
    detail_tab = page.locator("a:has-text('Opérations détaillées'), button:has-text('Opérations détaillées'), .nav-link:has-text('Opérations détaillées')")
    if detail_tab.count() > 0:
        detail_tab.first.click()
        wait_loading(page)
        time.sleep(2)
        screenshot(page, "10_operations_detaillees.png")
    else:
        # Essayer d'ouvrir via le bouton icône dans une ligne
        detail_icon = page.locator(".o_optional_columns_dropdown, button[name='action_show_details']")
        if detail_icon.count() > 0:
            detail_icon.first.click()
            wait_loading(page)
            time.sleep(2)
            screenshot(page, "10_operations_detaillees.png")
        else:
            print("  ⚠️  Onglet Opérations détaillées non trouvé")
            screenshot(page, "10_operations_detaillees.png")

    # --- 11 : Tenter de valider le picking ---
    print("\n📸 11 — Validation du transfert")
    validate_btn = page.locator("button:has-text('Valider'), button:has-text('Validate')")
    if validate_btn.count() > 0:
        validate_btn.first.click()
        wait_loading(page)
        time.sleep(2)

        # Gérer le dialogue de validation (quantités, lots, etc.)
        modal = page.locator(".modal")
        if modal.count() > 0:
            print("  → Dialogue de validation détecté")
            screenshot(page, "11_dialogue_validation.png")

            # Essayer de cliquer sur "Appliquer" ou "Valider" dans le modal
            apply_btn = page.locator(".modal button:has-text('Appliquer'), .modal button:has-text('Apply'), .modal button.btn-primary:has-text('Valider'), .modal button.btn-primary:has-text('OK')")
            if apply_btn.count() > 0:
                apply_btn.first.click()
                wait_loading(page)
                time.sleep(3)
        else:
            print("  → Pas de dialogue — validation directe")

        screenshot(page, "11_transfert_valide.png")
    else:
        print("  ⚠️  Bouton Valider non trouvé")
        screenshot(page, "11_transfert_valide.png")

    # --- 12 : État final après validation ---
    print("\n📸 12 — État final du picking")
    # Vérifier le statut
    status = page.locator(".o_statusbar_status .o_arrow_button_current, .o_statusbar_status .active")
    if status.count() > 0:
        status_text = status.first.inner_text()
        print(f"  → Statut du picking : {status_text}")

    screenshot(page, "12_picking_final.png")

    print("\n✅ Scénario 2 terminé")
    print(f"   Captures 07-12 dans : {SCREENSHOTS_DIR}")


def main():
    print("🚀 Capture Scénario 2 — Préparation de commande")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, slow_mo=300)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            locale="fr-FR",
        )
        page = context.new_page()

        try:
            login(page)
            scenario_2_preparation(page)
        except Exception as e:
            print(f"\n❌ Erreur : {e}")
            screenshot(page, "erreur_scenario2.png")
            raise
        finally:
            print("\n🔚 Fermeture du navigateur...")
            time.sleep(3)
            browser.close()


if __name__ == "__main__":
    main()
