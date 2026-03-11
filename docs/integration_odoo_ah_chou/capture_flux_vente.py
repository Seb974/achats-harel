#!/usr/bin/env python3
"""
Capture automatisée du flux de vente Odoo — AH CHOU
Scénario 1 : Créer une commande client (devis → commande confirmée)
"""

import os
import time
import sys
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
    print(f"  ✅ Capture sauvegardée : {name}")
    return path


def wait_loading(page, timeout=10000):
    """Attend que les spinners / chargements Odoo disparaissent."""
    try:
        page.wait_for_load_state("domcontentloaded", timeout=timeout)
    except PlaywrightTimeout:
        pass
    # Attendre que le spinner Odoo disparaisse
    try:
        page.wait_for_selector(".o_loading_indicator", state="hidden", timeout=5000)
    except PlaywrightTimeout:
        pass
    time.sleep(1.5)


def login(page):
    """Se connecter à Odoo."""
    print("\n🔐 Connexion à Odoo...")
    page.goto(f"{ODOO_URL}/web/login", wait_until="domcontentloaded", timeout=60000)
    time.sleep(3)

    page.fill("input[name='login']", EMAIL)
    page.fill("input[name='password']", PASSWORD)
    page.click("button[type='submit']")
    wait_loading(page, 15000)
    time.sleep(3)
    print("  ✅ Connecté avec succès")


def add_product(page, product_name, qty="1"):
    """Ajoute un produit à une commande de vente Odoo 18."""
    # Cliquer sur "Ajouter un produit" (button.btn-link dans Odoo 18)
    add_btn = page.locator("button:has-text('Ajouter un produit'), a:has-text('Ajouter un produit'), button:has-text('Add a product'), a:has-text('Add a product')")
    if add_btn.count() > 0:
        add_btn.first.click()
        print(f"  → Clic sur 'Ajouter un produit'")
    else:
        print("  ⚠️  Bouton 'Ajouter un produit' non trouvé")
        return False

    time.sleep(1.5)

    # Après clic, un champ input doit apparaître dans la nouvelle ligne
    # Stratégie : chercher l'input actif ou le dernier input dans le tableau
    focused = page.evaluate("document.activeElement?.tagName")
    print(f"  → Élément actif après clic : {focused}")

    # Essayer de taper directement si un input est déjà focalisé
    if focused == "INPUT":
        page.keyboard.type(product_name, delay=80)
    else:
        # Chercher dans la ligne sélectionnée ou la dernière ligne du tableau
        selectors = [
            ".o_selected_row td[name='product_id'] input",
            ".o_selected_row td[name='product_template_id'] input",
            ".o_selected_row .o_field_many2one input",
            "tr.o_selected_row input[type='text']",
            ".o_data_row:last-child td[name='product_id'] input",
            ".o_data_row:last-child td[name='product_template_id'] input",
            ".o_data_row:last-child .o_field_many2one input",
        ]
        found = False
        for sel in selectors:
            loc = page.locator(sel)
            if loc.count() > 0:
                print(f"  → Trouvé via : {sel} (count={loc.count()})")
                loc.last.click()
                time.sleep(0.5)
                loc.last.fill("")
                loc.last.type(product_name, delay=80)
                found = True
                break

        if not found:
            # Dernier recours : chercher tout input visible dans la zone order_line
            all_inputs = page.evaluate("""() => {
                const inputs = document.querySelectorAll('.o_list_table input[type="text"], .o_list_table .o_input');
                return Array.from(inputs).map((el, i) => ({
                    idx: i,
                    name: el.name || el.getAttribute('name') || '',
                    placeholder: el.placeholder || '',
                    visible: el.offsetParent !== null,
                    value: el.value,
                }));
            }""")
            print(f"  → Debug: inputs dans le tableau : {all_inputs}")
            if all_inputs:
                last_input = page.locator(".o_list_table input[type='text'], .o_list_table .o_input").last
                last_input.click()
                time.sleep(0.5)
                last_input.type(product_name, delay=80)
            else:
                print(f"  ❌ Aucun input trouvé pour le produit")
                return False

    time.sleep(2)

    # Sélectionner dans le dropdown
    dropdown = page.locator(".o-autocomplete--dropdown-menu .o-autocomplete--dropdown-item, .o_m2o_dropdown_option, .ui-autocomplete li")
    if dropdown.count() > 0:
        first_option = dropdown.first.inner_text()
        print(f"  → Sélection dropdown : {first_option}")
        dropdown.first.click()
        time.sleep(1.5)
    else:
        print("  → Pas de dropdown, tentative Enter")
        page.keyboard.press("Enter")
        time.sleep(1.5)

    wait_loading(page)
    time.sleep(1)

    # Modifier la quantité
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
            print(f"  → Quantité mise à {qty}")
            break

    time.sleep(1)
    return True


def scenario_1_commande(page):
    """Scénario 1 : Créer une commande client complète."""

    print("\n" + "=" * 60)
    print("📋 SCÉNARIO 1 : Créer une commande client")
    print("=" * 60)

    # --- Capture 01 : Liste des commandes ---
    print("\n📸 01 — Liste des commandes de vente")
    page.goto(f"{ODOO_URL}/odoo/sales", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(3)
    screenshot(page, "01_liste_commandes.png")

    # --- Capture 02 : Formulaire devis vide ---
    print("\n📸 02 — Nouveau devis (formulaire vide)")
    new_btn = page.locator("button:has-text('Nouveau'), button:has-text('New')")
    if new_btn.count() > 0:
        new_btn.first.click()
    else:
        page.goto(f"{ODOO_URL}/odoo/sales/new", wait_until="domcontentloaded", timeout=60000)
    wait_loading(page)
    time.sleep(2)
    screenshot(page, "02_formulaire_devis_vide.png")

    # --- Capture 03 : Sélection client ---
    print("\n📸 03 — Sélection du client (tarif auto)")
    client_field = page.locator("div[name='partner_id'] input, .o_field_many2one[name='partner_id'] input")
    if client_field.count() > 0:
        client_field.first.click()
        time.sleep(1)
        client_field.first.fill("")
        time.sleep(0.5)
        client_field.first.type("carrefour", delay=80)
        time.sleep(2)
        # Sélectionner le premier résultat du dropdown
        dropdown = page.locator(".o-autocomplete--dropdown-menu .o-autocomplete--dropdown-item, .ui-autocomplete .ui-menu-item")
        if dropdown.count() > 0:
            dropdown.first.click()
            client_name = "résultat dropdown"
        else:
            # Essayer avec Entrée
            client_field.first.press("Enter")
            client_name = "via Enter"
        wait_loading(page)
        time.sleep(2)
        print(f"  → Client sélectionné : {client_name}")
    else:
        print("  ⚠️  Champ client non trouvé, tentative alternative...")
        # Essayer un sélecteur plus générique
        inputs = page.locator("input[placeholder*='client'], input[placeholder*='Client'], input[placeholder*='customer']")
        if inputs.count() > 0:
            inputs.first.click()
            inputs.first.fill("carrefour")
            time.sleep(2)
            page.keyboard.press("ArrowDown")
            page.keyboard.press("Enter")
            wait_loading(page)
            time.sleep(2)

    screenshot(page, "03_client_selectionne.png")

    # --- Capture 04 : Ajout produit avec prix auto ---
    print("\n📸 04 — Ajout d'un produit (prix automatique)")
    add_product(page, "boulette", "10")
    wait_loading(page)
    time.sleep(2)
    screenshot(page, "04_produit_prix_auto.png")

    # --- Capture 05 : Devis complet (ajout d'un 2e produit) ---
    print("\n📸 05 — Devis complet avec plusieurs produits")
    add_product(page, "encornet", "5")
    wait_loading(page)
    time.sleep(2)
    # Cliquer en dehors pour désélectionner la ligne
    page.locator("h1").first.click()
    time.sleep(1)
    screenshot(page, "05_devis_complet.png")

    # --- Capture 06 : Commande confirmée ---
    print("\n📸 06 — Commande confirmée")
    confirm_btn = page.locator("button:has-text('Confirmer'), button:has-text('Confirm')")
    if confirm_btn.count() > 0:
        confirm_btn.first.click()
        wait_loading(page, 15000)
        time.sleep(3)
        # Gérer un éventuel dialogue de confirmation
        ok_btn = page.locator(".modal button:has-text('Ok'), .modal button:has-text('OK'), .modal button.btn-primary")
        if ok_btn.count() > 0:
            ok_btn.first.click()
            wait_loading(page)
            time.sleep(2)
    else:
        print("  ⚠️  Bouton Confirmer non trouvé")

    screenshot(page, "06_commande_confirmee.png")

    # Récupérer le numéro de commande
    title = page.locator("h1 .o_field_widget span, h1 span, .oe_title span")
    if title.count() > 0:
        order_ref = title.first.inner_text()
        print(f"\n  📌 Commande créée : {order_ref}")
    else:
        print("\n  📌 Commande créée (numéro non capturé)")

    print("\n✅ Scénario 1 terminé — 6 captures réalisées")
    print(f"   Dossier : {SCREENSHOTS_DIR}")


def main():
    print("🚀 Démarrage de la capture automatisée — Flux de Vente AH CHOU")
    print(f"   Instance : {ODOO_URL}")
    print(f"   Dossier captures : {SCREENSHOTS_DIR}")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            slow_mo=300,
        )
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            locale="fr-FR",
        )
        page = context.new_page()

        try:
            login(page)
            scenario_1_commande(page)
        except Exception as e:
            print(f"\n❌ Erreur : {e}")
            screenshot(page, "erreur_scenario1.png")
            raise
        finally:
            print("\n🔚 Fermeture du navigateur dans 5 secondes...")
            time.sleep(5)
            browser.close()


if __name__ == "__main__":
    main()
