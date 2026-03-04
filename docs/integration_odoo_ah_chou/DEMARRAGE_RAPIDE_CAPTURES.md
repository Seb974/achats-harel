# 🚀 DÉMARRAGE RAPIDE - Captures d'Écran Odoo

**Instance:** https://ah-chou1.odoo.com  
**Date:** 26 février 2026

---

## ⚡ En 3 commandes

```bash
# 1. Aller dans le dossier
cd /Users/mhoar/Desktop/achats-harel-4.0/docs/integration_odoo_ah_chou

# 2. Installer les dépendances (une seule fois)
./install_dependencies.sh

# 3. Lancer les captures automatiques
python3 capture_odoo_screenshots.py
```

**Durée totale : ~5-10 minutes**  
**Résultat : 8 captures d'écran dans `screenshots/`**

---

## 📸 Ce qui sera capturé

1. ✅ Page de connexion
2. ✅ Tableau de bord
3. ✅ Comptabilité > Taxes
4. ✅ Ventes > Listes de prix
5. ✅ Paramètres > Sociétés
6. ✅ Détails de la société
7. ✅ Applications installées
8. ✅ Devises

---

## 📚 Documentation disponible

### 🎯 Par où commencer ?

| Fichier | Quand l'utiliser |
|---------|------------------|
| **Ce fichier** | Pour lancer les captures maintenant |
| **GUIDE_CAPTURES_SCREENSHOTS.md** | Si problème avec le script |
| **LISEZMOI_BLOC1.md** | Vue d'ensemble complète |
| **BLOC1_GUIDE_RAPIDE.md** | Pour configurer Odoo (après captures) |

### 📖 Guides détaillés (si besoin)

- `BLOC1_1_CONFIG_SOCIETE_GUIDE.md` - Configuration société (12p)
- `BLOC1_2_CONFIG_TAXES_GUIDE.md` - Configuration taxes (18p)
- `BLOC1_3_CONFIG_DEVISES_GUIDE.md` - Configuration devises (16p)
- `BLOC1_4_VERIFICATION_MODULES_GUIDE.md` - Vérification modules (14p)

---

## ⚠️ En cas de problème

### Le script ne fonctionne pas ?

**Vérifications rapides :**
```bash
# Python installé ?
python3 --version

# ChromeDriver installé ?
chromedriver --version
```

**Si erreur, réinstaller :**
```bash
pip3 install selenium
brew install chromedriver
xattr -d com.apple.quarantine $(which chromedriver)
```

### Alternative : Captures manuelles

Si le script ne fonctionne vraiment pas :
1. Ouvrir Chrome
2. Aller sur https://ah-chou1.odoo.com
3. Se connecter (email: mathieu.loic.hoarau@gmail.com)
4. Utiliser **Cmd+Shift+4** pour capturer
5. Sauvegarder dans `screenshots/`

---

## ✅ Après les captures

1. **Ouvrir le dossier :**
   ```bash
   open screenshots/
   ```

2. **Analyser les images** pour voir l'état actuel

3. **Suivre le guide de configuration :**
   ```bash
   open BLOC1_GUIDE_RAPIDE.md
   ```

4. **Mettre à jour le suivi :**
   ```bash
   open BLOC1_SUIVI.md
   ```

---

## 📞 Support

- **Guide complet du script :** `GUIDE_CAPTURES_SCREENSHOTS.md`
- **Limitation technique :** `LIMITATION_TECHNIQUE_NAVIGATEUR.md`
- **Rapport d'automatisation :** `RAPPORT_AUTOMATISATION_CAPTURES.md`

---

**C'est parti ! 🚀**

Exécutez les 3 commandes ci-dessus et vous aurez vos captures en quelques minutes.
