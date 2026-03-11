#!/usr/bin/env python3
"""
Scénario 2 v2 : Nouvelle commande avec produits ayant des lots (0000001)
→ Tête rouge vielle ananas, Vivaneau Maori, Filet Rouge vielle
Puis vérification du flux Pick + Ship (2 étapes)
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


def add_product(page, product_name, qty="1"):
    """Ajoute un produit à la commande."""
    add_btn = page.locator("button:has-text('Ajouter un produit'), a:has-text('Ajouter un produit')")
    if add_btn.count() > 0:
        add_btn.first.click()
    else:
        print(f"  ⚠️  Bouton 'Ajouter un produit' non trouvé")
        return False

    time.sleep(1.5)
    focused = page.evaluate("document.activeElement?.tagName")
    if focused == "INPUT":
        page.keyboard.type(product_name, delay=80)
    else:
        selectors = [
            ".o_selected_row td[name='product_id'] input",
            ".o_selected_row td[name='product_template_id'] input",
            ".o_selected_row .o_field_many2one input",
            "tr.o_selected_row input[type='text']",
        ]
        for sel in selectors:
            loc = page.locator(sel)
            if loc.count() > 0:
                loc.last.click()
                time.sleep(0.5)
                loc.last.fill("")
                loc.last.type(product_name, delay=80)
                break

    time.sleep(2)
    dropdown = page.locator(".o-autocomplete--dropdown-menu .o-autocomplete--dropdown-item, .o_m2o_dropdown_option")
    if dropdown.count() > 0:
        first_text = dropdown.first.inner_text()
        print(f"  → Produit : {first_text[:80]}")
        dropdown.first.click()
        time.sleep(1.5)
    else:
        page.keyboard.press("Enter")
        time.sleep(1.5)

    wait_loading(page)
    time.sleep(1)

    qty_selectors = [
        ".o_selected_row td[name='product_uom_qty'] input",
        ".o_data_row:last-child td[name='product_uom_qty'] input",
        ".o_selected_row input[inputmode='decimal']",
    ]
    for sel in qty_selectors:
        loc = page.locator(sel)
        if loc.count() > 0:
            loc.first.click(click_count=3)
            loc.first.fill(qty)
            loc.first.press("Tab")
            print(f"  → Quantité : {qty}")
            break
    time.sleep(1)
    return True


def run(page):
    print("\n" + "=" * 60)
    print("📋 NOUVELLE COMMANDE avec produits lotés")
    print("=" * 60)

    # --- 1. Créer une commande avec les 3 produits ---
    print("\n📸 Étape 1 — Créer un devis avec les 3 produits lotés")
    page.goto(f"{ODOO_URL}/odoo/sales/new", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(2)

    # Sélectionner un client CHR pour varier
    client_field = page.locator("div[name='partner_id'] input, .o_field_many2one[name='partner_id'] input")
    if client_field.count() > 0:
        client_field.first.click()
        time.sleep(0.5)
        client_field.first.fill("")
        client_field.first.type("restaurant", delay=80)
        time.sleep(2)
        dropdown = page.locator(".o-autocomplete--dropdown-menu .o-autocomplete--dropdown-item")
        if dropdown.count() > 0:
            client_name = dropdown.first.inner_text()
            print(f"  → Client : {client_name}")
            dropdown.first.click()
        else:
            client_field.first.fill("")
            client_field.first.type("ATC", delay=80)
            time.sleep(2)
            dropdown2 = page.locator(".o-autocomplete--dropdown-menu .o-autocomplete--dropdown-item")
            if dropdown2.count() > 0:
                client_name = dropdown2.first.inner_text()
                print(f"  → Client : {client_name}")
                dropdown2.first.click()

        wait_loading(page)
        time.sleep(2)

    # Ajouter les 3 produits avec lots
    add_product(page, "rouge vielle ananas", "20")
    add_product(page, "vivaneau maori", "15")
    add_product(page, "filet rouge vielle", "10")

    # Cliquer hors de la table pour désélectionner
    page.locator("h1").first.click()
    time.sleep(1)

    screenshot(page, "sc2_01_devis_3produits.png")

    # --- 2. Confirmer la commande ---
    print("\n📸 Étape 2 — Confirmer la commande")
    confirm_btn = page.locator("button:has-text('Confirmer'), button:has-text('Confirm')")
    if confirm_btn.count() > 0:
        confirm_btn.first.click()
        wait_loading(page, 15000)
        time.sleep(3)
        ok_btn = page.locator(".modal button:has-text('Ok'), .modal button:has-text('OK'), .modal button.btn-primary")
        if ok_btn.count() > 0:
            ok_btn.first.click()
            wait_loading(page)
            time.sleep(2)

    # Récupérer le numéro de commande
    title = page.locator("h1 .o_field_widget span, h1 span, .oe_title span")
    order_ref = ""
    if title.count() > 0:
        order_ref = title.first.inner_text()
        print(f"  → Commande : {order_ref}")

    screenshot(page, "sc2_02_commande_confirmee.png")

    # --- 3. Voir les boutons de livraison/transfert ---
    print("\n📸 Étape 3 — Identifier les transferts créés (Pick + Ship)")
    # Chercher tous les stat buttons (Livraison, Transfert, etc.)
    stat_buttons = page.locator(".oe_stat_button, button.oe_stat_button")
    print(f"  → {stat_buttons.count()} boutons stat trouvés")
    for i in range(stat_buttons.count()):
        btn_text = stat_buttons.nth(i).inner_text()
        print(f"    [{i}] {btn_text.strip()}")

    screenshot(page, "sc2_03_boutons_transferts.png")

    # --- 4. Cliquer sur le premier transfert (devrait être Pick ou Livraison) ---
    print("\n📸 Étape 4 — Ouvrir le premier transfert")
    delivery_btn = page.locator("button:has-text('Livraison'), button:has-text('Transfert')")
    if delivery_btn.count() > 0:
        delivery_btn.first.click()
        wait_loading(page)
        time.sleep(3)

        # Vérifier si on est sur une liste ou un formulaire
        list_view = page.locator("tr.o_data_row")
        if list_view.count() > 1:
            print(f"  → Liste de {list_view.count()} transferts (Pick + Ship !)")
            screenshot(page, "sc2_04_liste_transferts.png")

            # Ouvrir le premier transfert (Pick)
            list_view.first.click()
            wait_loading(page)
            time.sleep(2)
            screenshot(page, "sc2_05_pick_detail.png")

            # Lire les infos
            form_text = page.evaluate("""() => {
                const fields = {};
                const op = document.querySelector('[name="picking_type_id"]');
                if (op) fields.type = op.textContent.trim();
                const src = document.querySelector('[name="location_id"]');
                if (src) fields.source = src.textContent.trim();
                const dest = document.querySelector('[name="location_dest_id"]');
                if (dest) fields.dest = dest.textContent.trim();
                const state = document.querySelector('.o_statusbar_status .o_arrow_button_current, .o_statusbar_status button[aria-checked=true]');
                if (state) fields.state = state.textContent.trim();
                const ref = document.querySelector('h1 span, h1 .o_field_widget');
                if (ref) fields.ref = ref.textContent.trim();
                return fields;
            }""")
            print(f"  → Transfert : {form_text}")

            # Retour à la liste
            page.go_back()
            wait_loading(page)
            time.sleep(2)

            # Ouvrir le second transfert (Ship)
            list_view2 = page.locator("tr.o_data_row")
            if list_view2.count() > 1:
                list_view2.nth(1).click()
                wait_loading(page)
                time.sleep(2)

                form_text2 = page.evaluate("""() => {
                    const fields = {};
                    const op = document.querySelector('[name="picking_type_id"]');
                    if (op) fields.type = op.textContent.trim();
                    const src = document.querySelector('[name="location_id"]');
                    if (src) fields.source = src.textContent.trim();
                    const dest = document.querySelector('[name="location_dest_id"]');
                    if (dest) fields.dest = dest.textContent.trim();
                    const state = document.querySelector('.o_statusbar_status .o_arrow_button_current, .o_statusbar_status button[aria-checked=true]');
                    if (state) fields.state = state.textContent.trim();
                    const ref = document.querySelector('h1 span, h1 .o_field_widget');
                    if (ref) fields.ref = ref.textContent.trim();
                    return fields;
                }""")
                print(f"  → Transfert : {form_text2}")
                screenshot(page, "sc2_06_ship_detail.png")

        else:
            # Un seul transfert (formulaire direct)
            form_text = page.evaluate("""() => {
                const fields = {};
                const op = document.querySelector('[name="picking_type_id"]');
                if (op) fields.type = op.textContent.trim();
                const src = document.querySelector('[name="location_id"]');
                if (src) fields.source = src.textContent.trim();
                const dest = document.querySelector('[name="location_dest_id"]');
                if (dest) fields.dest = dest.textContent.trim();
                const state = document.querySelector('.o_statusbar_status .o_arrow_button_current, .o_statusbar_status button[aria-checked=true]');
                if (state) fields.state = state.textContent.trim();
                const ref = document.querySelector('h1 span, h1 .o_field_widget');
                if (ref) fields.ref = ref.textContent.trim();
                return fields;
            }""")
            print(f"  → Transfert unique : {form_text}")
            screenshot(page, "sc2_05_transfert_unique.png")

    else:
        print("  ⚠️  Aucun bouton de transfert trouvé")
        screenshot(page, "sc2_04_pas_de_transfert.png")

    # --- 5. Aller voir tous les transferts via Inventaire ---
    print("\n📸 Étape 5 — Vue d'ensemble Inventaire")
    page.goto(f"{ODOO_URL}/odoo/inventory", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(3)
    screenshot(page, "sc2_07_inventaire_overview.png")

    # Lire les compteurs
    overview_text = page.evaluate("""() => {
        const cards = document.querySelectorAll('.o_kanban_record');
        return Array.from(cards).map(c => c.textContent.trim().substring(0, 100));
    }""")
    for t in overview_text:
        print(f"    {t}")

    print(f"\n✅ Scénario 2 v2 terminé — commande {order_ref}")
    print(f"   Captures dans : {SCREENSHOTS_DIR}")


def main():
    print("🚀 Scénario 2 v2 — Commande avec produits lotés")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, slow_mo=300)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            locale="fr-FR",
        )
        page = context.new_page()
        try:
            login(page)
            run(page)
        except Exception as e:
            print(f"\n❌ Erreur : {e}")
            screenshot(page, "sc2_erreur.png")
            raise
        finally:
            print("\n🔚 Fermeture...")
            time.sleep(3)
            browser.close()


if __name__ == "__main__":
    main()
