#!/usr/bin/env python3
"""
Script pour prendre des captures d'écran de l'instance Odoo ah-chou1
Utilise Selenium WebDriver pour automatiser la navigation et les captures
"""

import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from datetime import datetime

# Configuration
ODOO_URL = "https://ah-chou1.odoo.com/web/login"
EMAIL = "mathieu.loic.hoarau@gmail.com"
PASSWORD = "gbtN0WxuCVjg@g*C"
SCREENSHOTS_DIR = "/Users/mhoar/Desktop/achats-harel-4.0/docs/integration_odoo_ah_chou/screenshots"

# Créer le dossier de captures si nécessaire
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def take_screenshot(driver, filename, description=""):
    """Prend une capture d'écran et la sauvegarde"""
    filepath = os.path.join(SCREENSHOTS_DIR, filename)
    driver.save_screenshot(filepath)
    print(f"✅ Capture sauvegardée: {filename}")
    if description:
        print(f"   Description: {description}")
    return filepath

def wait_for_page_load(driver, timeout=10):
    """Attend que la page soit complètement chargée"""
    time.sleep(2)  # Temps de base pour le rendu
    WebDriverWait(driver, timeout).until(
        lambda d: d.execute_script('return document.readyState') == 'complete'
    )

def main():
    print("🚀 Démarrage du script de captures d'écran Odoo")
    print(f"📁 Dossier de sauvegarde: {SCREENSHOTS_DIR}\n")
    
    # Initialiser le navigateur (Chrome)
    options = webdriver.ChromeOptions()
    # options.add_argument('--headless')  # Décommenter pour mode sans interface
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    
    try:
        driver = webdriver.Chrome(options=options)
        driver.maximize_window()
        
        # ÉTAPE 1: Connexion à Odoo
        print("📝 ÉTAPE 1: Connexion à Odoo...")
        driver.get(ODOO_URL)
        wait_for_page_load(driver)
        
        # Prendre capture de la page de connexion
        take_screenshot(driver, "01_page_connexion.png", "Page de connexion Odoo")
        
        # Remplir le formulaire de connexion
        email_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "login"))
        )
        email_field.clear()
        email_field.send_keys(EMAIL)
        
        password_field = driver.find_element(By.NAME, "password")
        password_field.clear()
        password_field.send_keys(PASSWORD)
        
        # Cliquer sur le bouton de connexion
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        
        wait_for_page_load(driver, 15)
        print("✅ Connexion réussie\n")
        
        # ÉTAPE 2: Tableau de bord
        print("📝 ÉTAPE 2: Capture du tableau de bord...")
        time.sleep(3)  # Attendre le chargement complet
        take_screenshot(driver, "02_tableau_bord.png", "Tableau de bord principal")
        
        # ÉTAPE 3: Comptabilité > Configuration > Taxes
        print("\n📝 ÉTAPE 3: Navigation vers Comptabilité > Taxes...")
        
        # Ouvrir le menu Comptabilité
        try:
            # Méthode 1: Via le menu principal
            compta_menu = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//a[contains(@data-menu-xmlid, 'account')]"))
            )
            compta_menu.click()
            wait_for_page_load(driver)
        except:
            # Méthode 2: Via l'URL directe
            driver.get("https://ah-chou1.odoo.com/web#menu_id=141&action=")
            wait_for_page_load(driver)
        
        time.sleep(2)
        
        # Aller dans Configuration > Taxes
        try:
            config_menu = driver.find_element(By.XPATH, "//a[contains(text(), 'Configuration')]")
            config_menu.click()
            time.sleep(1)
            
            taxes_menu = driver.find_element(By.XPATH, "//a[contains(text(), 'Taxes')]")
            taxes_menu.click()
            wait_for_page_load(driver)
        except:
            # URL directe vers les taxes
            driver.get("https://ah-chou1.odoo.com/web#menu_id=154&action=125")
            wait_for_page_load(driver)
        
        time.sleep(2)
        take_screenshot(driver, "03_comptabilite_taxes.png", "Liste des taxes")
        
        # ÉTAPE 4: Ventes > Configuration > Listes de prix
        print("\n📝 ÉTAPE 4: Navigation vers Ventes > Listes de prix...")
        
        try:
            # Ouvrir le menu Ventes
            ventes_menu = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//a[contains(@data-menu-xmlid, 'sale')]"))
            )
            ventes_menu.click()
            wait_for_page_load(driver)
            
            # Configuration > Listes de prix
            config_menu = driver.find_element(By.XPATH, "//a[contains(text(), 'Configuration')]")
            config_menu.click()
            time.sleep(1)
            
            pricelists_menu = driver.find_element(By.XPATH, "//a[contains(text(), 'Listes de prix')]")
            pricelists_menu.click()
            wait_for_page_load(driver)
        except:
            # URL directe vers les listes de prix
            driver.get("https://ah-chou1.odoo.com/web#menu_id=&action=")
            wait_for_page_load(driver)
        
        time.sleep(2)
        take_screenshot(driver, "04_ventes_listes_prix.png", "Listes de prix")
        
        # ÉTAPE 5: Paramètres > Sociétés
        print("\n📝 ÉTAPE 5: Navigation vers Paramètres > Sociétés...")
        
        try:
            # Ouvrir les Paramètres
            settings_menu = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//a[@title='Paramètres']"))
            )
            settings_menu.click()
            wait_for_page_load(driver)
            
            time.sleep(2)
            
            # Chercher le lien vers Sociétés
            companies_link = driver.find_element(By.XPATH, "//a[contains(text(), 'Sociétés')]")
            companies_link.click()
            wait_for_page_load(driver)
        except:
            # URL directe vers les sociétés
            driver.get("https://ah-chou1.odoo.com/web#menu_id=&action=")
            wait_for_page_load(driver)
        
        time.sleep(2)
        take_screenshot(driver, "05_parametres_societes.png", "Configuration des sociétés")
        
        # Ouvrir la société principale pour voir les détails
        try:
            company_row = driver.find_element(By.CSS_SELECTOR, "tr.o_data_row")
            company_row.click()
            wait_for_page_load(driver)
            time.sleep(2)
            take_screenshot(driver, "06_societe_details.png", "Détails de la société")
        except:
            print("⚠️ Impossible d'ouvrir les détails de la société")
        
        # ÉTAPE 6: Captures supplémentaires utiles
        print("\n📝 ÉTAPE 6: Captures supplémentaires...")
        
        # Applications installées
        try:
            driver.get("https://ah-chou1.odoo.com/web#menu_id=&action=")
            wait_for_page_load(driver)
            time.sleep(2)
            take_screenshot(driver, "07_applications_installees.png", "Applications installées")
        except:
            print("⚠️ Impossible d'accéder aux applications")
        
        # Devises
        try:
            driver.get("https://ah-chou1.odoo.com/web#menu_id=&action=")
            wait_for_page_load(driver)
            time.sleep(2)
            take_screenshot(driver, "08_comptabilite_devises.png", "Configuration des devises")
        except:
            print("⚠️ Impossible d'accéder aux devises")
        
        print("\n✅ Toutes les captures ont été prises avec succès!")
        print(f"\n📁 Fichiers créés dans: {SCREENSHOTS_DIR}")
        
        # Lister les fichiers créés
        files = sorted([f for f in os.listdir(SCREENSHOTS_DIR) if f.endswith('.png')])
        print("\n📸 Captures d'écran créées:")
        for i, filename in enumerate(files, 1):
            filepath = os.path.join(SCREENSHOTS_DIR, filename)
            size = os.path.getsize(filepath) / 1024  # Ko
            print(f"   {i}. {filename} ({size:.1f} Ko)")
        
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        
        # Prendre une capture de l'erreur
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            take_screenshot(driver, f"error_{timestamp}.png", "Capture d'erreur")
        except:
            pass
    
    finally:
        print("\n🔒 Fermeture du navigateur...")
        driver.quit()
        print("✅ Script terminé")

if __name__ == "__main__":
    main()
