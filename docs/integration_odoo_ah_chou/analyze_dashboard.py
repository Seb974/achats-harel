#!/usr/bin/env python3
"""
Script pour se connecter à Odoo et analyser le dashboard Base Produit GEL OI
"""
import time
import os
from datetime import datetime

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
except ImportError:
    print("❌ Selenium n'est pas installé.")
    print("Installation: pip3 install selenium")
    exit(1)

# Configuration
ODOO_LOGIN_URL = "https://ah-chou1.odoo.com/web/login"
DASHBOARD_URL = "https://ah-chou1.odoo.com/odoo/dashboards?dashboard_id=21"
EMAIL = "mathieu.loic.hoarau@gmail.com"
PASSWORD = "gbtN0WxuCVjg@g*C"
SCREENSHOT_DIR = "screenshots/dashboard_analysis"

# Créer le dossier de screenshots
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

print("=" * 80)
print("ANALYSE DU DASHBOARD ODOO - Base Produit GEL OI")
print("=" * 80)
print()

# Configuration Chrome
chrome_options = Options()
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")

# Lancer le navigateur
print("🌐 Lancement du navigateur Chrome...")
driver = webdriver.Chrome(options=chrome_options)
wait = WebDriverWait(driver, 20)

try:
    # ÉTAPE 1: Navigation vers la page de login
    print()
    print("📍 ÉTAPE 1: Navigation vers la page de login")
    print("-" * 80)
    driver.get(ODOO_LOGIN_URL)
    time.sleep(2)
    
    screenshot_path = f"{SCREENSHOT_DIR}/01_login_page.png"
    driver.save_screenshot(screenshot_path)
    print(f"   ✓ Screenshot: {screenshot_path}")
    print(f"   URL actuelle: {driver.current_url}")
    
    # ÉTAPE 2: Connexion
    print()
    print("🔐 ÉTAPE 2: Connexion à Odoo")
    print("-" * 80)
    
    try:
        # Trouver le champ email
        email_field = wait.until(EC.presence_of_element_located((By.NAME, "login")))
        email_field.clear()
        email_field.send_keys(EMAIL)
        print(f"   ✓ Email saisi: {EMAIL}")
        
        # Trouver le champ mot de passe
        password_field = driver.find_element(By.NAME, "password")
        password_field.clear()
        password_field.send_keys(PASSWORD)
        print(f"   ✓ Mot de passe saisi")
        
        # Screenshot avant login
        screenshot_path = f"{SCREENSHOT_DIR}/02_login_filled.png"
        driver.save_screenshot(screenshot_path)
        print(f"   ✓ Screenshot: {screenshot_path}")
        
        # Cliquer sur le bouton de connexion
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        print(f"   ✓ Bouton de connexion cliqué")
        
        # Attendre que la connexion soit effective
        time.sleep(5)
        
        screenshot_path = f"{SCREENSHOT_DIR}/03_after_login.png"
        driver.save_screenshot(screenshot_path)
        print(f"   ✓ Screenshot: {screenshot_path}")
        print(f"   URL après login: {driver.current_url}")
        
        # Vérifier si la connexion a réussi
        if "login" in driver.current_url.lower():
            print("   ⚠️  Toujours sur la page de login - vérifier les identifiants")
            # Chercher un message d'erreur
            try:
                error_msg = driver.find_element(By.CLASS_NAME, "alert-danger")
                print(f"   ❌ Erreur: {error_msg.text}")
            except:
                pass
        else:
            print("   ✓ Connexion réussie!")
    
    except Exception as e:
        print(f"   ❌ Erreur lors de la connexion: {e}")
        screenshot_path = f"{SCREENSHOT_DIR}/error_login.png"
        driver.save_screenshot(screenshot_path)
        raise
    
    # ÉTAPE 3: Navigation vers le dashboard
    print()
    print("📊 ÉTAPE 3: Navigation vers le dashboard")
    print("-" * 80)
    print(f"   Dashboard: Base Produit GEL OI (ID: 21)")
    
    driver.get(DASHBOARD_URL)
    print(f"   ✓ Navigation vers: {DASHBOARD_URL}")
    
    # Attendre le chargement du dashboard
    print("   ⏳ Attente du chargement du dashboard...")
    time.sleep(8)  # Attendre que les graphiques se chargent
    
    screenshot_path = f"{SCREENSHOT_DIR}/04_dashboard_initial.png"
    driver.save_screenshot(screenshot_path)
    print(f"   ✓ Screenshot: {screenshot_path}")
    print(f"   URL actuelle: {driver.current_url}")
    
    # ÉTAPE 4: Analyse du dashboard
    print()
    print("🔍 ÉTAPE 4: Analyse détaillée du dashboard")
    print("-" * 80)
    
    # Attendre un peu plus pour s'assurer que tout est chargé
    time.sleep(3)
    
    # Screenshot après chargement complet
    screenshot_path = f"{SCREENSHOT_DIR}/05_dashboard_loaded.png"
    driver.save_screenshot(screenshot_path)
    print(f"   ✓ Screenshot: {screenshot_path}")
    
    # Obtenir les dimensions de la fenêtre
    window_size = driver.get_window_size()
    print(f"   📐 Dimensions fenêtre: {window_size['width']}x{window_size['height']}")
    
    # Obtenir la hauteur totale de la page
    total_height = driver.execute_script("return document.body.scrollHeight")
    print(f"   📏 Hauteur totale de la page: {total_height}px")
    
    # Analyser les éléments visibles
    print()
    print("   🔎 Analyse des éléments du dashboard:")
    print()
    
    # Chercher les scorecards
    try:
        scorecards = driver.find_elements(By.CLASS_NAME, "o-scorecard")
        if scorecards:
            print(f"   ✓ {len(scorecards)} scorecard(s) détecté(s)")
            for i, scorecard in enumerate(scorecards, 1):
                try:
                    text = scorecard.text
                    if text:
                        print(f"      {i}. {text[:100]}")
                except:
                    pass
        else:
            print(f"   ⚠️  Aucun scorecard détecté (classe: o-scorecard)")
    except Exception as e:
        print(f"   ⚠️  Erreur lors de la recherche des scorecards: {e}")
    
    # Chercher les graphiques
    try:
        charts = driver.find_elements(By.TAG_NAME, "canvas")
        if charts:
            print(f"   ✓ {len(charts)} graphique(s) canvas détecté(s)")
        else:
            print(f"   ⚠️  Aucun graphique canvas détecté")
    except Exception as e:
        print(f"   ⚠️  Erreur lors de la recherche des graphiques: {e}")
    
    # Chercher les tableaux croisés dynamiques
    try:
        pivot_tables = driver.find_elements(By.CLASS_NAME, "o-spreadsheet-pivot")
        if pivot_tables:
            print(f"   ✓ {len(pivot_tables)} tableau(x) croisé(s) dynamique(s) détecté(s)")
        else:
            print(f"   ℹ️  Aucun tableau croisé dynamique détecté")
    except:
        pass
    
    # ÉTAPE 5: Scroll et screenshots
    print()
    print("📸 ÉTAPE 5: Captures d'écran avec défilement")
    print("-" * 80)
    
    # Scroll positions
    scroll_positions = [0, 500, 1000, 1500, 2000]
    
    for i, scroll_y in enumerate(scroll_positions, 1):
        try:
            driver.execute_script(f"window.scrollTo(0, {scroll_y});")
            time.sleep(1)
            
            screenshot_path = f"{SCREENSHOT_DIR}/06_scroll_{i}_y{scroll_y}.png"
            driver.save_screenshot(screenshot_path)
            print(f"   ✓ Screenshot {i}: {screenshot_path} (scroll Y={scroll_y})")
            
            # Si on a dépassé la hauteur totale, arrêter
            if scroll_y >= total_height:
                print(f"   ℹ️  Fin de page atteinte")
                break
        except Exception as e:
            print(f"   ⚠️  Erreur scroll position {scroll_y}: {e}")
    
    # Retour en haut
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(1)
    
    # ÉTAPE 6: Analyse détaillée des éléments
    print()
    print("📋 ÉTAPE 6: Analyse détaillée de la mise en page")
    print("-" * 80)
    
    # Vérifier la largeur du contenu principal
    try:
        main_content = driver.find_element(By.TAG_NAME, "main")
        content_width = main_content.size['width']
        content_height = main_content.size['height']
        print(f"   📐 Dimensions contenu principal: {content_width}x{content_height}")
    except:
        print(f"   ⚠️  Impossible de déterminer les dimensions du contenu")
    
    # Vérifier les marges
    try:
        body_styles = driver.execute_script("""
            var body = document.body;
            var styles = window.getComputedStyle(body);
            return {
                marginLeft: styles.marginLeft,
                marginRight: styles.marginRight,
                paddingLeft: styles.paddingLeft,
                paddingRight: styles.paddingRight
            };
        """)
        print(f"   📏 Marges body: left={body_styles['marginLeft']}, right={body_styles['marginRight']}")
        print(f"   📏 Padding body: left={body_styles['paddingLeft']}, right={body_styles['paddingRight']}")
    except:
        pass
    
    # Screenshot final haute résolution
    print()
    print("📷 Screenshot final haute résolution...")
    driver.set_window_size(1920, 4000)  # Grande hauteur pour tout capturer
    time.sleep(2)
    screenshot_path = f"{SCREENSHOT_DIR}/07_full_dashboard_hires.png"
    driver.save_screenshot(screenshot_path)
    print(f"   ✓ Screenshot: {screenshot_path}")
    
    # ÉTAPE 7: Rapport final
    print()
    print("=" * 80)
    print("📊 RAPPORT D'ANALYSE DU DASHBOARD")
    print("=" * 80)
    print()
    print(f"Dashboard: Base Produit GEL OI")
    print(f"URL: {driver.current_url}")
    print(f"Titre de la page: {driver.title}")
    print()
    print("Screenshots créés:")
    for filename in sorted(os.listdir(SCREENSHOT_DIR)):
        if filename.endswith('.png'):
            filepath = os.path.join(SCREENSHOT_DIR, filename)
            size = os.path.getsize(filepath)
            print(f"  - {filename} ({size/1024:.1f} KB)")
    print()
    print("⚠️  Pour une analyse détaillée:")
    print("   1. Consultez les screenshots dans:", SCREENSHOT_DIR)
    print("   2. Vérifiez particulièrement:")
    print("      • 05_dashboard_loaded.png - Vue d'ensemble")
    print("      • 06_scroll_*.png - Vues défilées")
    print("      • 07_full_dashboard_hires.png - Vue complète haute résolution")
    print()
    print("✅ Analyse terminée!")
    print()
    
    # Garder le navigateur ouvert pour inspection manuelle
    print("Le navigateur reste ouvert pour inspection manuelle.")
    print("Appuyez sur Entrée pour fermer le navigateur...")
    input()

except Exception as e:
    print()
    print(f"❌ ERREUR CRITIQUE: {e}")
    import traceback
    traceback.print_exc()
    
    screenshot_path = f"{SCREENSHOT_DIR}/error_critical.png"
    try:
        driver.save_screenshot(screenshot_path)
        print(f"Screenshot d'erreur: {screenshot_path}")
    except:
        pass
    
    print()
    print("Appuyez sur Entrée pour fermer...")
    input()

finally:
    driver.quit()
    print("🔚 Navigateur fermé")
