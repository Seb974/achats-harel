#!/usr/bin/env python3
"""
Script pour vérifier l'import du plan comptable via l'interface web Odoo
Utilise Selenium pour naviguer dans l'interface
"""

import time
import sys
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuration
ODOO_URL = "https://ah-chou1.odoo.com/odoo"
LOGIN = "mathieu.loic.hoarau@gmail.com"
SCREENSHOT_DIR = "screenshots/verification_import"

# Créer le dossier de screenshots
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

print("=" * 80)
print("VÉRIFICATION DU PLAN COMPTABLE DANS ODOO")
print("=" * 80)
print()
print(f"Instance: {ODOO_URL}")
print(f"Login: {LOGIN}")
print(f"Screenshots: {SCREENSHOT_DIR}/")
print()

# Configuration Chrome
chrome_options = Options()
chrome_options.add_argument("--start-maximized")
# Utiliser le profil par défaut pour avoir les mots de passe sauvegardés
user_data_dir = os.path.expanduser("~/Library/Application Support/Google/Chrome")
chrome_options.add_argument(f"user-data-dir={user_data_dir}")
chrome_options.add_argument("profile-directory=Default")

# Lancer le navigateur
print("Démarrage du navigateur Chrome...")
try:
    driver = webdriver.Chrome(options=chrome_options)
    wait = WebDriverWait(driver, 20)
    print("✓ Navigateur démarré")
except Exception as e:
    print(f"❌ Erreur lors du démarrage du navigateur: {e}")
    print()
    print("Vérifiez que ChromeDriver est installé:")
    print("  brew install chromedriver")
    sys.exit(1)

try:
    print()
    print("=" * 80)
    print("ÉTAPE 1: CONNEXION À ODOO")
    print("=" * 80)
    print()
    
    print(f"Navigation vers {ODOO_URL}...")
    driver.get(ODOO_URL)
    time.sleep(3)
    
    # Screenshot initial
    screenshot_path = f"{SCREENSHOT_DIR}/01_page_initiale.png"
    driver.save_screenshot(screenshot_path)
    print(f"✓ Screenshot: {screenshot_path}")
    
    current_url = driver.current_url
    print(f"URL actuelle: {current_url}")
    
    # Vérifier si on doit se connecter
    if "login" in current_url.lower() or "web/login" in current_url:
        print()
        print("Page de connexion détectée. Connexion en cours...")
        
        try:
            # Remplir le login
            email_field = wait.until(EC.presence_of_element_located((By.NAME, "login")))
            email_field.clear()
            email_field.send_keys(LOGIN)
            print(f"✓ Email saisi: {LOGIN}")
            
            # Attendre que le mot de passe soit pré-rempli ou demander
            time.sleep(2)
            
            screenshot_path = f"{SCREENSHOT_DIR}/02_login_rempli.png"
            driver.save_screenshot(screenshot_path)
            print(f"✓ Screenshot: {screenshot_path}")
            
            # Chercher et cliquer sur le bouton de connexion
            login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
            login_button.click()
            print("✓ Bouton de connexion cliqué")
            
            time.sleep(5)
            
            screenshot_path = f"{SCREENSHOT_DIR}/03_apres_connexion.png"
            driver.save_screenshot(screenshot_path)
            print(f"✓ Screenshot: {screenshot_path}")
            
        except Exception as e:
            print(f"❌ Erreur lors de la connexion: {e}")
            screenshot_path = f"{SCREENSHOT_DIR}/erreur_connexion.png"
            driver.save_screenshot(screenshot_path)
            raise
    else:
        print("✓ Déjà connecté")
    
    print()
    print("=" * 80)
    print("ÉTAPE 2: NAVIGATION VERS LA COMPTABILITÉ")
    print("=" * 80)
    print()
    
    time.sleep(3)
    
    try:
        # Chercher le lien vers Comptabilité/Accounting
        print("Recherche du module Comptabilité...")
        accounting_link = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//a[contains(@href, '/web') and (contains(., 'Accounting') or contains(., 'Comptabilité') or contains(@data-menu-xmlid, 'account'))]")
        ))
        accounting_link.click()
        print("✓ Module Comptabilité ouvert")
        
        time.sleep(4)
        screenshot_path = f"{SCREENSHOT_DIR}/04_module_comptabilite.png"
        driver.save_screenshot(screenshot_path)
        print(f"✓ Screenshot: {screenshot_path}")
        
    except TimeoutException:
        print("⚠️  Module Comptabilité non trouvé directement")
        print("Tentative via le menu Apps...")
        
        # Essayer via le menu
        try:
            # Cliquer sur le menu Apps
            apps_menu = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//a[contains(@class, 'o_menu_toggle')]")
            ))
            apps_menu.click()
            time.sleep(2)
            
            # Chercher Accounting
            accounting_link = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//a[contains(., 'Accounting') or contains(., 'Comptabilité')]")
            ))
            accounting_link.click()
            print("✓ Module Comptabilité ouvert via le menu")
            
            time.sleep(4)
        except Exception as e:
            print(f"❌ Impossible d'accéder au module Comptabilité: {e}")
            screenshot_path = f"{SCREENSHOT_DIR}/erreur_acces_comptabilite.png"
            driver.save_screenshot(screenshot_path)
            raise
    
    print()
    print("=" * 80)
    print("ÉTAPE 3: ACCÈS AU PLAN COMPTABLE")
    print("=" * 80)
    print()
    
    time.sleep(2)
    
    try:
        print("Recherche du menu Configuration...")
        
        # Chercher le menu Configuration
        config_menu = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//a[contains(., 'Configuration') or contains(@data-menu-xmlid, 'account.menu_finance_configuration')]")
        ))
        config_menu.click()
        print("✓ Menu Configuration ouvert")
        time.sleep(1)
        
        # Chercher Plan comptable / Chart of Accounts
        chart_link = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//a[contains(., 'Chart of Accounts') or contains(., 'Plan comptable') or contains(@data-menu-xmlid, 'account.menu_action_account_form')]")
        ))
        chart_link.click()
        print("✓ Plan comptable ouvert")
        
        time.sleep(4)
        screenshot_path = f"{SCREENSHOT_DIR}/05_plan_comptable.png"
        driver.save_screenshot(screenshot_path)
        print(f"✓ Screenshot: {screenshot_path}")
        
    except Exception as e:
        print(f"❌ Erreur d'accès au plan comptable: {e}")
        screenshot_path = f"{SCREENSHOT_DIR}/erreur_plan_comptable.png"
        driver.save_screenshot(screenshot_path)
        raise
    
    print()
    print("=" * 80)
    print("ÉTAPE 4: COMPTAGE DES COMPTES")
    print("=" * 80)
    print()
    
    time.sleep(3)
    
    try:
        # Chercher le compteur de lignes ou les lignes elles-mêmes
        print("Comptage des comptes visibles...")
        
        # Essayer de trouver le compteur Odoo
        try:
            pager = driver.find_element(By.CLASS_NAME, "o_pager_value")
            pager_text = pager.text
            print(f"✓ Pager trouvé: {pager_text}")
            
            # Parser le texte (format: "1-80 / 390" ou similaire)
            if "/" in pager_text:
                total = pager_text.split("/")[1].strip()
                print(f"📊 Nombre total de comptes: {total}")
            else:
                print(f"📊 Info pager: {pager_text}")
        except NoSuchElementException:
            print("⚠️  Pager non trouvé, comptage manuel des lignes...")
            
            # Compter les lignes visibles
            rows = driver.find_elements(By.XPATH, "//tr[contains(@class, 'o_data_row')]")
            visible_count = len(rows)
            print(f"📊 Comptes visibles sur cette page: {visible_count}")
        
        screenshot_path = f"{SCREENSHOT_DIR}/06_liste_comptes.png"
        driver.save_screenshot(screenshot_path)
        print(f"✓ Screenshot: {screenshot_path}")
        
    except Exception as e:
        print(f"⚠️  Erreur lors du comptage: {e}")
    
    print()
    print("=" * 80)
    print("ÉTAPE 5: VÉRIFICATION DES COMPTES CLÉS")
    print("=" * 80)
    print()
    
    # Comptes à chercher
    key_accounts = [
        ('40100000', 'Fournisseurs', 'Payable'),
        ('41100000', 'Clients', 'Receivable'),
        ('41600000', 'Clients douteux', 'Receivable'),
        ('60710000', 'Achats march exo', 'Expense'),
        ('70700000', 'Ventes exo libre service', 'Income'),
        ('10100000', 'Capital', 'Equity')
    ]
    
    for code, name, expected_type in key_accounts:
        print(f"Recherche du compte {code} ({name})...")
        
        try:
            # Utiliser la recherche Odoo
            search_box = driver.find_element(By.XPATH, "//input[contains(@class, 'o_searchview_input')]")
            search_box.clear()
            search_box.send_keys(code)
            time.sleep(2)
            
            # Appuyer sur Entrée pour chercher
            from selenium.webdriver.common.keys import Keys
            search_box.send_keys(Keys.RETURN)
            time.sleep(2)
            
            # Chercher le compte dans les résultats
            try:
                row = driver.find_element(By.XPATH, f"//tr[contains(@class, 'o_data_row')]//td[contains(., '{code}')]")
                print(f"  ✓ Compte trouvé: {code}")
                
                # Screenshot du compte
                screenshot_path = f"{SCREENSHOT_DIR}/compte_{code}.png"
                driver.save_screenshot(screenshot_path)
                print(f"  ✓ Screenshot: {screenshot_path}")
                
            except NoSuchElementException:
                print(f"  ❌ Compte NON trouvé: {code}")
            
            # Effacer la recherche
            search_box = driver.find_element(By.XPATH, "//input[contains(@class, 'o_searchview_input')]")
            search_box.clear()
            time.sleep(1)
            
        except Exception as e:
            print(f"  ⚠️  Erreur lors de la recherche: {e}")
        
        print()
    
    print("=" * 80)
    print("VÉRIFICATION TERMINÉE")
    print("=" * 80)
    print()
    print(f"Tous les screenshots sont dans: {SCREENSHOT_DIR}/")
    print()
    print("Consultez les screenshots pour voir:")
    print("  - La liste complète des comptes")
    print("  - Le nombre total de comptes")
    print("  - Les comptes clés recherchés")
    print()
    
    input("Appuyez sur Entrée pour fermer le navigateur...")

except Exception as e:
    print()
    print(f"❌ ERREUR: {e}")
    screenshot_path = f"{SCREENSHOT_DIR}/erreur_critique.png"
    driver.save_screenshot(screenshot_path)
    print(f"Screenshot d'erreur: {screenshot_path}")
    import traceback
    traceback.print_exc()
    
    input("Appuyez sur Entrée pour fermer le navigateur...")

finally:
    driver.quit()
    print("Navigateur fermé")
