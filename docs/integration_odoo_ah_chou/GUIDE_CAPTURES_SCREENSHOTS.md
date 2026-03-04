# 📸 Guide d'utilisation - Script de captures d'écran Odoo

**Date:** 26 février 2026  
**Instance:** https://ah-chou1.odoo.com

---

## 🎯 Objectif

Ce script automatise la prise de captures d'écran de l'instance Odoo pour documenter la configuration actuelle du BLOC 1.

---

## 📋 Prérequis

### Logiciels nécessaires
- ✅ Python 3 (déjà installé sur macOS)
- ✅ Google Chrome
- ✅ Homebrew (pour installer ChromeDriver)
- ✅ Selenium (bibliothèque Python)
- ✅ ChromeDriver (pilote pour automatiser Chrome)

---

## 🚀 Installation rapide

### Option 1 : Installation automatique (recommandé)

Ouvrez le Terminal et exécutez :

```bash
cd /Users/mhoar/Desktop/achats-harel-4.0/docs/integration_odoo_ah_chou
./install_dependencies.sh
```

Ce script va installer automatiquement :
- Selenium (via pip3)
- ChromeDriver (via Homebrew)
- Configurer les permissions nécessaires

### Option 2 : Installation manuelle

Si le script automatique ne fonctionne pas, installez manuellement :

```bash
# 1. Installer Selenium
pip3 install selenium

# 2. Installer ChromeDriver (via Homebrew)
brew install chromedriver

# 3. Vérifier l'installation
chromedriver --version

# 4. Donner les permissions (macOS)
xattr -d com.apple.quarantine $(which chromedriver)
```

---

## 📸 Exécution du script de captures

### Commande d'exécution

```bash
cd /Users/mhoar/Desktop/achats-harel-4.0/docs/integration_odoo_ah_chou
python3 capture_odoo_screenshots.py
```

### Ce que fait le script

Le script va automatiquement :

1. **Se connecter à Odoo** avec vos identifiants
2. **Naviguer** dans différentes sections
3. **Prendre des captures d'écran** de :
   - Page de connexion
   - Tableau de bord
   - Comptabilité > Taxes
   - Ventes > Listes de prix
   - Paramètres > Sociétés
   - Détails de la société
   - Applications installées
   - Devises

4. **Sauvegarder les captures** dans :
   ```
   /Users/mhoar/Desktop/achats-harel-4.0/docs/integration_odoo_ah_chou/screenshots/
   ```

### Durée estimée
- **2-3 minutes** pour l'exécution complète

---

## 📁 Fichiers créés

Le script créera les captures suivantes :

| Fichier | Description |
|---------|-------------|
| `01_page_connexion.png` | Page de connexion Odoo |
| `02_tableau_bord.png` | Tableau de bord principal |
| `03_comptabilite_taxes.png` | Liste des taxes |
| `04_ventes_listes_prix.png` | Listes de prix |
| `05_parametres_societes.png` | Configuration des sociétés |
| `06_societe_details.png` | Détails de la société |
| `07_applications_installees.png` | Applications installées |
| `08_comptabilite_devises.png` | Configuration des devises |

---

## ⚙️ Configuration

### Identifiants (déjà configurés dans le script)
- **URL:** https://ah-chou1.odoo.com/web/login
- **Email:** mathieu.loic.hoarau@gmail.com
- **Mot de passe:** gbtN0WxuCVjg@g*C

### Mode d'affichage

Par défaut, le script s'exécute avec le navigateur **visible** (vous verrez Chrome s'ouvrir).

Pour exécuter en mode **invisible** (headless), modifiez la ligne 36 du script :

```python
# Décommenter cette ligne pour mode sans interface
options.add_argument('--headless')
```

---

## 🔍 Vérifier les captures

Après l'exécution, vérifiez les captures :

```bash
# Ouvrir le dossier des captures
open /Users/mhoar/Desktop/achats-harel-4.0/docs/integration_odoo_ah_chou/screenshots/

# Ou lister les fichiers
ls -lh /Users/mhoar/Desktop/achats-harel-4.0/docs/integration_odoo_ah_chou/screenshots/
```

---

## ⚠️ Problèmes courants

### Erreur : "chromedriver not found"

**Cause :** ChromeDriver n'est pas installé ou pas dans le PATH

**Solution :**
```bash
brew install chromedriver
```

### Erreur : "Permission denied" (macOS)

**Cause :** macOS bloque l'exécution de ChromeDriver

**Solution :**
```bash
xattr -d com.apple.quarantine $(which chromedriver)
```

Ou via l'interface :
1. Ouvrir **Préférences Système > Sécurité et confidentialité**
2. Autoriser chromedriver

### Erreur : "Selenium not found"

**Cause :** Selenium n'est pas installé

**Solution :**
```bash
pip3 install selenium
```

### Le script échoue sur une page

**Cause :** La structure HTML d'Odoo peut varier

**Solution :** Le script utilise des URLs directes en fallback. Si une section échoue, le script continue avec les autres sections.

### Les identifiants ne fonctionnent pas

**Cause :** Identifiants incorrects ou compte verrouillé

**Solution :** 
1. Vérifier les identifiants dans le script
2. Tester manuellement la connexion sur https://ah-chou1.odoo.com
3. Réinitialiser le mot de passe si nécessaire

---

## 🎨 Personnalisation

### Ajouter des captures supplémentaires

Modifiez le script `capture_odoo_screenshots.py` pour ajouter d'autres sections :

```python
# Exemple : Capturer la page des produits
driver.get("https://ah-chou1.odoo.com/web#menu_id=XXX&action=YYY")
wait_for_page_load(driver)
time.sleep(2)
take_screenshot(driver, "09_produits.png", "Liste des produits")
```

### Modifier la résolution

Changez la taille de la fenêtre (ligne 35) :

```python
options.add_argument('--window-size=1920,1080')  # Full HD
# ou
options.add_argument('--window-size=2560,1440')  # 2K
```

---

## 📊 Après les captures

### 1. Vérifier les captures
- Ouvrir chaque image
- Vérifier que les informations sont visibles
- Vérifier qu'il n'y a pas de données sensibles à masquer

### 2. Analyser la configuration
Utiliser les captures pour remplir les checklists du BLOC 1 :
- Modules installés
- Taxes existantes
- Devises actives
- Configuration société

### 3. Documenter dans le rapport
Mettre à jour le fichier `BLOC1_SUIVI.md` avec les informations observées.

---

## 🆘 Support

### Logs du script

Si le script échoue, consultez :
1. Le message d'erreur dans le Terminal
2. La capture `error_YYYYMMDD_HHMMSS.png` (si créée)
3. Le traceback Python pour identifier le problème

### Documentation Selenium

- [Documentation officielle](https://www.selenium.dev/documentation/)
- [Selenium avec Python](https://selenium-python.readthedocs.io/)

### Alternatives

Si le script ne fonctionne pas, vous pouvez :
1. **Prendre les captures manuellement** :
   - Se connecter à Odoo dans Chrome
   - Naviguer vers chaque section
   - Utiliser Cmd+Shift+4 pour capturer
   - Nommer les fichiers selon la convention

2. **Utiliser un outil de capture** :
   - Snagit
   - Monosnap
   - Skitch

---

## ✅ Checklist d'exécution

Avant d'exécuter le script :
- [ ] Python 3 installé
- [ ] Google Chrome installé
- [ ] Homebrew installé
- [ ] Dépendances installées (Selenium, ChromeDriver)
- [ ] Permissions ChromeDriver configurées (macOS)
- [ ] Identifiants vérifiés dans le script

Après l'exécution :
- [ ] 8 captures créées
- [ ] Toutes les images sont lisibles
- [ ] Pas d'erreur dans le Terminal
- [ ] Dossier screenshots/ contient les fichiers

---

## 🎉 Résumé

### Commandes rapides

```bash
# 1. Installer les dépendances
cd /Users/mhoar/Desktop/achats-harel-4.0/docs/integration_odoo_ah_chou
./install_dependencies.sh

# 2. Exécuter le script
python3 capture_odoo_screenshots.py

# 3. Vérifier les captures
open screenshots/
```

### Temps total estimé
- **Installation :** 2-5 minutes (une seule fois)
- **Exécution :** 2-3 minutes
- **Vérification :** 5 minutes
- **Total :** ~10 minutes

---

**Ce script vous permet d'automatiser la documentation visuelle de votre instance Odoo pour le BLOC 1.**

Bonne capture ! 📸
