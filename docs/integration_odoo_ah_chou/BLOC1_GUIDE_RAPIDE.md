# 🚀 Guide de Démarrage Rapide - BLOC 1

**Pour:** Administrateur Odoo  
**Durée estimée:** 4-6 heures  
**Prérequis:** Identifiants de connexion à ah-chou1.odoo.com

---

## ⚡ En bref

Ce guide vous permet de configurer rapidement les éléments essentiels du BLOC 1 :
- ✅ Vérifier les modules installés
- ✅ Configurer la société
- ✅ Créer les 6 taxes TVA DOM
- ✅ Activer EUR et USD
- ✅ Valider avec des tests

---

## 📋 Checklist rapide

### Avant de commencer
- [ ] J'ai l'email et le mot de passe administrateur
- [ ] Je dispose de 4-6 heures consécutives
- [ ] J'ai les informations de la société (SIRET, adresse, logo)
- [ ] J'ai un navigateur moderne (Chrome, Firefox, Safari)

### Pendant la configuration
- [ ] Je prends des captures d'écran à chaque étape
- [ ] Je coche les checklists au fur et à mesure
- [ ] J'effectue tous les tests de validation
- [ ] Je note les problèmes rencontrés

---

## 🎯 Les 4 étapes principales

### ÉTAPE 1 : Modules (30 min)
**Objectif:** Vérifier que les 5 modules critiques sont installés

1. Se connecter à https://ah-chou1.odoo.com
2. Aller dans **Paramètres > Applications**
3. Filtrer par "Installé"
4. Vérifier la présence de :
   - ✅ Ventes
   - ✅ Achats
   - ✅ Inventaire
   - ✅ Comptabilité
   - ✅ Point de Vente
5. Si un module manque → Cliquer sur "Installer"

**📸 Captures:** 3 screenshots (liste modules, menu principal, page "À propos")

**📖 Guide détaillé:** [BLOC1_4_VERIFICATION_MODULES_GUIDE.md](./BLOC1_4_VERIFICATION_MODULES_GUIDE.md)

---

### ÉTAPE 2 : Société (1h)
**Objectif:** Configurer les informations de base de la société

1. Aller dans **Paramètres > Sociétés**
2. Renseigner :
   - **Nom** de la société
   - **Logo** (fichier PNG/JPG, 500x500px)
   - **Adresse** complète (rue, code postal, ville, pays)
   - **Contact** (téléphone, email, site web)
   - **Fiscal** (SIRET, N° TVA, RCS, Code APE)
   - **Devise** = EUR
   - **Plan comptable** = France
   - **Fuseau horaire** = America/Martinique
3. Cliquer sur **Enregistrer**
4. Créer un devis test pour vérifier l'affichage

**📸 Captures:** 4 screenshots (paramètres société, aperçu devis)

**📖 Guide détaillé:** [BLOC1_1_CONFIG_SOCIETE_GUIDE.md](./BLOC1_1_CONFIG_SOCIETE_GUIDE.md)

---

### ÉTAPE 3 : Taxes (1-2h)
**Objectif:** Créer les 6 taxes TVA DOM (2.1%, 8.5%, 0%)

1. Aller dans **Comptabilité > Configuration > Taxes**
2. Créer chaque taxe en cliquant sur **Créer** :

#### Taxe 1 : TVA 2.1% Ventes
- Nom: `TVA 2.1% DOM (Ventes)`
- Type: Ventes
- Taux: `2.1`
- Compte: `445710 - TVA collectée`
- Étiquette facture: `TVA 2,1%`

#### Taxe 2 : TVA 2.1% Achats
- Nom: `TVA 2.1% DOM (Achats)`
- Type: Achats
- Taux: `2.1`
- Compte: `445660 - TVA déductible`

#### Taxe 3 : TVA 8.5% Ventes
- Nom: `TVA 8.5% DOM (Ventes)`
- Type: Ventes
- Taux: `8.5`
- Compte: `445710 - TVA collectée`
- Étiquette facture: `TVA 8,5%`

#### Taxe 4 : TVA 8.5% Achats
- Nom: `TVA 8.5% DOM (Achats)`
- Type: Achats
- Taux: `8.5`
- Compte: `445660 - TVA déductible`

#### Taxe 5 : Exonéré 0% Ventes
- Nom: `Exonéré DOM 0% (Ventes)`
- Type: Ventes
- Taux: `0`
- Étiquette facture: `Exonéré TVA`

#### Taxe 6 : Exonéré 0% Achats
- Nom: `Exonéré DOM 0% (Achats)`
- Type: Achats
- Taux: `0`

3. Créer 3 devis tests (un par taux de taxe)
4. Vérifier les calculs :
   - 100€ HT + TVA 2.1% = **102,10€** TTC ✓
   - 100€ HT + TVA 8.5% = **108,50€** TTC ✓
   - 100€ HT + TVA 0% = **100,00€** TTC ✓

**📸 Captures:** 6 screenshots (liste taxes, détails, tests)

**📖 Guide détaillé:** [BLOC1_2_CONFIG_TAXES_GUIDE.md](./BLOC1_2_CONFIG_TAXES_GUIDE.md)

---

### ÉTAPE 4 : Devises (1h)
**Objectif:** Activer EUR et USD avec taux de change

1. Aller dans **Paramètres > Comptabilité**
2. Activer **Multi-devises** → Enregistrer
3. Aller dans **Comptabilité > Configuration > Devises**

#### EUR (déjà activé normalement)
- Vérifier : Symbole = `€`
- Position = Après le montant
- Séparateur décimal = `,` (virgule)
- Séparateur milliers = ` ` (espace)

#### USD (à activer)
- Cliquer sur **Tous** (pour voir les devises inactives)
- Rechercher **USD**
- Ouvrir et cocher **Actif** → Enregistrer
- Vérifier : Symbole = `$`
- Position = Avant le montant
- Séparateur décimal = `.` (point)
- Séparateur milliers = `,` (virgule)

#### Taux de change automatiques
1. Retourner dans **Paramètres > Comptabilité > Devises**
2. **Fournisseur de taux** = `Banque Centrale Européenne`
3. **Intervalle** = `Quotidiennement`
4. **Enregistrer**
5. Retourner dans **Comptabilité > Configuration > Devises**
6. Cliquer sur **Mettre à jour les taux**
7. Vérifier que USD a un taux (ex: 1.08)

#### Tests
1. Créer un devis en **EUR** : vérifier format `1 234,56 €`
2. Créer un devis en **USD** : vérifier format `$1,234.56`
3. Vérifier la conversion EUR ↔ USD

**📸 Captures:** 5 screenshots (devises, taux, tests)

**📖 Guide détaillé:** [BLOC1_3_CONFIG_DEVISES_GUIDE.md](./BLOC1_3_CONFIG_DEVISES_GUIDE.md)

---

## ✅ Tests de validation finale

### Tests obligatoires

#### Test 1 : Devis avec TVA 2.1%
1. Créer un devis
2. Ajouter un produit à 100€ HT
3. Sélectionner taxe `TVA 2.1% DOM (Ventes)`
4. Vérifier : Total TTC = **102,10€** ✓

#### Test 2 : Devis avec TVA 8.5%
1. Créer un devis
2. Ajouter un produit à 100€ HT
3. Sélectionner taxe `TVA 8.5% DOM (Ventes)`
4. Vérifier : Total TTC = **108,50€** ✓

#### Test 3 : Devis en USD
1. Créer un devis
2. Changer la devise en **USD**
3. Ajouter un produit à $100 HT
4. Vérifier format : `$100.00` ✓
5. Vérifier conversion en EUR affichée ✓

#### Test 4 : Aperçu facture
1. Créer et confirmer un devis
2. Créer une facture
3. Vérifier l'aperçu (mode impression)
4. Vérifier :
   - ✓ Logo de la société affiché
   - ✓ Adresse complète
   - ✓ SIRET visible
   - ✓ Mentions légales présentes
   - ✓ TVA calculée correctement

---

## 📸 Captures d'écran essentielles

### Captures minimales (12)
1. Liste des modules installés
2. Paramètres société (informations complètes)
3. Liste des 6 taxes créées
4. Détail taxe TVA 8.5% Ventes
5. Liste des devises (EUR et USD actifs)
6. Paramètres taux de change (BCE)
7. Test devis TVA 2.1%
8. Test devis TVA 8.5%
9. Test devis TVA 0%
10. Test devis en EUR
11. Test devis en USD
12. Aperçu facture finale

**💾 Enregistrer dans:** `docs/integration_odoo_ah_chou/BLOC1_SCREENSHOTS/`

---

## ⚠️ Problèmes courants

### ❌ "Module non trouvé"
**Solution:** Aller dans `Paramètres > Applications > Mettre à jour la liste des applications`

### ❌ "Impossible de créer la taxe"
**Solution:** Vérifier que le compte comptable existe dans le plan comptable

### ❌ "USD n'apparaît pas"
**Solution:** Cliquer sur **Tous** pour afficher les devises inactives, puis cocher **Actif**

### ❌ "Taux de change non mis à jour"
**Solution:** Vérifier la connexion internet du serveur, relancer manuellement

### ❌ "Logo ne s'affiche pas"
**Solution:** Vérifier le format (PNG recommandé) et la taille (< 2 MB)

---

## 🎯 Checklist finale

### Configuration terminée
- [ ] 5 modules critiques vérifiés et accessibles
- [ ] Société configurée (nom, logo, adresse, SIRET)
- [ ] 6 taxes créées (2.1%, 8.5%, 0% pour Ventes et Achats)
- [ ] 2 devises activées (EUR et USD)
- [ ] Taux de change configurés (BCE automatique)

### Tests validés
- [ ] Calcul TVA 2.1% correct (102,10€)
- [ ] Calcul TVA 8.5% correct (108,50€)
- [ ] Format EUR correct (1 234,56 €)
- [ ] Format USD correct ($1,234.56)
- [ ] Aperçu facture avec logo et mentions légales

### Documentation
- [ ] 12 captures d'écran minimum prises
- [ ] Fichier `BLOC1_SUIVI.md` mis à jour
- [ ] Problèmes rencontrés documentés (si applicable)

---

## 📚 Ressources rapides

### Guides complets
- [Index BLOC 1](./README_BLOC1.md) - Navigation générale
- [Guide Société](./BLOC1_1_CONFIG_SOCIETE_GUIDE.md) - 12 pages détaillées
- [Guide Taxes](./BLOC1_2_CONFIG_TAXES_GUIDE.md) - 18 pages détaillées
- [Guide Devises](./BLOC1_3_CONFIG_DEVISES_GUIDE.md) - 16 pages détaillées
- [Guide Modules](./BLOC1_4_VERIFICATION_MODULES_GUIDE.md) - 14 pages détaillées

### Suivi
- [Suivi BLOC 1](./BLOC1_SUIVI.md) - Progression détaillée
- [Rapport Final](./BLOC1_RAPPORT_FINAL.md) - État complet

### Support
- **Documentation Odoo:** https://www.odoo.com/documentation/
- **Forum:** https://www.odoo.com/forum/
- **TVA DOM:** https://www.service-public.fr/professionnels-entreprises/vosdroits/F23567

---

## 💡 Conseils

### Pour gagner du temps
1. Préparer à l'avance les informations de la société (SIRET, logo, etc.)
2. Ouvrir les guides dans des onglets séparés
3. Utiliser Cmd/Ctrl + F pour rechercher dans les guides
4. Faire les captures au fur et à mesure (ne pas attendre la fin)

### Pour éviter les erreurs
1. Lire chaque guide au moins une fois avant de commencer
2. Suivre l'ordre recommandé (Modules → Société → Taxes → Devises)
3. Vérifier chaque calcul de TVA avec une calculatrice
4. Tester après chaque configuration

### Pour bien documenter
1. Nommer les captures selon la convention : `BLOC1_SECTION_NUM_description.png`
2. Prendre des captures claires et complètes (pas de zoom excessif)
3. Annoter si nécessaire (flèches, cadres)
4. Mettre à jour le fichier de suivi régulièrement

---

## 🎉 Après le BLOC 1

Une fois le BLOC 1 terminé et validé :

1. **Mettre à jour la documentation**
   - Cocher toutes les cases dans `BLOC1_SUIVI.md`
   - Ajouter vos notes dans `BLOC1_RAPPORT_FINAL.md`
   - Archiver les captures d'écran

2. **Informer l'équipe**
   - Configuration terminée et validée
   - Instance prête pour utilisation
   - Documentation disponible

3. **Préparer le BLOC 2** (si applicable)
   - Configuration des produits
   - Configuration des clients/fournisseurs
   - Configuration des paiements
   - Templates de documents

---

## ⏱️ Estimation du temps par étape

| Étape | Temps min | Temps max | Moyenne |
|-------|-----------|-----------|---------|
| Connexion et vérification | 15 min | 30 min | 20 min |
| Modules (1.4) | 20 min | 1h | 30 min |
| Société (1.1) | 30 min | 1h30 | 1h |
| Taxes (1.2) | 45 min | 2h | 1h30 |
| Devises (1.3) | 30 min | 1h30 | 1h |
| Tests | 20 min | 1h | 30 min |
| Captures et doc | 20 min | 1h | 30 min |
| **TOTAL** | **4h** | **8h30** | **5h30** |

**Note:** Les temps varient selon votre familiarité avec Odoo et la complexité des données.

---

## 📞 Besoin d'aide ?

### En cas de blocage
1. Consulter la section "Problèmes courants" du guide concerné
2. Rechercher dans le forum Odoo
3. Consulter la documentation officielle
4. Contacter le support (si Enterprise)

### Questions fréquentes
- **Puis-je modifier la configuration plus tard ?** Oui, tout est modifiable
- **Puis-je supprimer une taxe créée par erreur ?** Oui, si pas encore utilisée
- **Puis-je changer la devise de base ?** Non, pas après création de transactions
- **Puis-je ajouter d'autres devises ?** Oui, même procédure que USD

---

**Bon courage ! 🚀**

Une fois cette configuration terminée, votre instance Odoo sera prête pour une utilisation en production.

---

**Version:** 1.0  
**Dernière mise à jour:** 26 février 2026
