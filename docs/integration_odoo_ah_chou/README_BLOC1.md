# Index - Documentation BLOC 1 : Paramétrage Général Odoo

**Instance:** https://ah-chou1.odoo.com  
**Projet:** Intégration Odoo - Achats Harel 4.0  
**Date de création:** 26 février 2026

---

## 📋 Vue d'ensemble

Ce dossier contient la documentation complète pour le **BLOC 1** du paramétrage Odoo, qui couvre la configuration de base de l'instance.

---

## 📁 Structure de la documentation

### 1. Rapports d'investigation

#### [BLOC1_RAPPORT_PARAMETRAGE.md](./BLOC1_RAPPORT_PARAMETRAGE.md)
**Description:** Rapport détaillé de l'investigation initiale de l'instance Odoo  
**Contenu:**
- État de la connexion à l'instance
- Liste des éléments à vérifier
- Recommandations pour la suite
- Prochaines étapes à suivre

#### [BLOC1_ETAT_CONNEXION.md](./BLOC1_ETAT_CONNEXION.md)
**Description:** Documentation de l'état de la page de connexion  
**Contenu:**
- Structure de la page de connexion
- Méthodes d'authentification disponibles
- Informations techniques
- Prochaines étapes pour accéder à l'instance

---

### 2. Guides de configuration détaillés

#### [BLOC1_1_CONFIG_SOCIETE_GUIDE.md](./BLOC1_1_CONFIG_SOCIETE_GUIDE.md)
**Description:** Guide complet pour configurer les informations de la société  
**Contenu:**
- Informations de base (nom, logo, adresse)
- Informations de contact (téléphone, email, site web)
- Informations fiscales et légales (SIRET, TVA, RCS)
- Paramètres comptables (devise, plan comptable)
- Checklist de configuration
- Validation et tests

**Chemin d'accès:** `Paramètres > Sociétés`

#### [BLOC1_2_CONFIG_TAXES_GUIDE.md](./BLOC1_2_CONFIG_TAXES_GUIDE.md)
**Description:** Guide complet pour configurer les taxes TVA DOM  
**Contenu:**
- Contexte réglementaire DOM
- Configuration de la TVA 2.1% (Ventes et Achats)
- Configuration de la TVA 8.5% (Ventes et Achats)
- Configuration de l'Exonération 0% (Ventes et Achats)
- Positions fiscales
- Tests de validation
- Réglementation et articles de loi

**Chemin d'accès:** `Comptabilité > Configuration > Taxes`

#### [BLOC1_3_CONFIG_DEVISES_GUIDE.md](./BLOC1_3_CONFIG_DEVISES_GUIDE.md)
**Description:** Guide complet pour configurer les devises EUR et USD  
**Contenu:**
- Configuration de l'Euro (devise principale)
- Configuration du Dollar américain (devise secondaire)
- Configuration des taux de change (automatique/manuel)
- Gestion multi-devises sur les documents
- Gain/perte de change
- Tests de validation

**Chemin d'accès:** `Comptabilité > Configuration > Devises`

#### [BLOC1_4_VERIFICATION_MODULES_GUIDE.md](./BLOC1_4_VERIFICATION_MODULES_GUIDE.md)
**Description:** Guide pour vérifier et documenter les modules installés  
**Contenu:**
- Vérification du module Ventes
- Vérification du module Achats
- Vérification du module Inventaire
- Vérification du module Comptabilité
- Vérification du module Point de Vente
- Installation de modules manquants
- Dépendances entre modules

**Chemin d'accès:** `Paramètres > Applications`

---

### 3. Captures d'écran

#### Dossier: `BLOC1_SCREENSHOTS/`
**Description:** Dossier pour stocker toutes les captures d'écran du BLOC 1  
**Contenu attendu:**
- Captures de la page de connexion
- Captures des paramètres société
- Captures de la configuration des taxes
- Captures de la configuration des devises
- Captures de la liste des modules
- Captures des tests (devis, factures, etc.)

---

## 🎯 Objectifs du BLOC 1

### 1.1 - Configuration Société
- ✅ Guide créé et détaillé
- ⏸️ Configuration à effectuer après connexion

### 1.2 - Configuration Taxes TVA DOM
- ✅ Guide créé et détaillé
- ⏸️ Configuration à effectuer après connexion
- **Taxes requises:**
  - TVA 2.1% DOM (Ventes et Achats)
  - TVA 8.5% DOM (Ventes et Achats)
  - Exonéré DOM 0% (Ventes et Achats)

### 1.3 - Configuration Devises
- ✅ Guide créé et détaillé
- ⏸️ Configuration à effectuer après connexion
- **Devises requises:**
  - EUR (Euro) - Devise principale
  - USD (Dollar américain) - Devise secondaire

### 1.4 - Vérification Modules
- ✅ Guide créé et détaillé
- ⏸️ Vérification à effectuer après connexion
- **Modules requis:**
  - Ventes (sale_management)
  - Achats (purchase)
  - Inventaire (stock)
  - Comptabilité (account_accountant)
  - Point de Vente (point_of_sale)

---

## 📊 État d'avancement

| Étape | Statut | Commentaire |
|-------|--------|-------------|
| Investigation initiale | ✅ Terminé | Instance accessible, page de connexion OK |
| Création des guides | ✅ Terminé | 4 guides détaillés créés |
| Connexion à l'instance | ⏸️ En attente | Identifiants requis |
| Configuration société | ⏸️ En attente | À effectuer après connexion |
| Configuration taxes | ⏸️ En attente | À effectuer après connexion |
| Configuration devises | ⏸️ En attente | À effectuer après connexion |
| Vérification modules | ⏸️ En attente | À effectuer après connexion |
| Tests de validation | ⏸️ En attente | À effectuer après configuration |
| Captures d'écran | ⏸️ En attente | À prendre pendant la configuration |

---

## 🚀 Prochaines étapes

### Étape immédiate
1. **Obtenir les identifiants de connexion**
   - E-mail de l'administrateur
   - Mot de passe
   - Ou utiliser la réinitialisation de mot de passe

### Une fois connecté
2. **Suivre les guides dans l'ordre:**
   1. BLOC 1.4 - Vérifier les modules installés
   2. BLOC 1.1 - Configurer la société
   3. BLOC 1.2 - Configurer les taxes TVA DOM
   4. BLOC 1.3 - Configurer les devises

3. **Documenter avec des captures d'écran**
   - Prendre des captures à chaque étape
   - Enregistrer dans `BLOC1_SCREENSHOTS/`
   - Nommer les fichiers de manière explicite

4. **Effectuer les tests de validation**
   - Créer des devis tests
   - Vérifier les calculs de TVA
   - Vérifier les conversions de devises
   - Vérifier l'affichage sur les documents

---

## 📖 Comment utiliser cette documentation

### Pour un administrateur
1. Commencez par lire le [rapport de paramétrage](./BLOC1_RAPPORT_PARAMETRAGE.md)
2. Connectez-vous à l'instance Odoo
3. Suivez les guides dans l'ordre numérique (1.1 → 1.2 → 1.3 → 1.4)
4. Utilisez les checklists pour vérifier que tout est configuré
5. Effectuez les tests de validation
6. Prenez des captures d'écran pour documentation

### Pour un développeur
1. Consultez les guides pour comprendre la configuration métier
2. Utilisez les noms techniques des modules et champs
3. Référez-vous aux comptes comptables mentionnés
4. Vérifiez les dépendances entre modules

### Pour un auditeur/contrôleur
1. Vérifiez que tous les éléments des checklists sont cochés
2. Consultez les captures d'écran pour preuve de configuration
3. Vérifiez les tests de validation
4. Vérifiez la conformité réglementaire (taxes DOM)

---

## 🔗 Liens utiles

### Documentation Odoo officielle
- [Odoo 16 - Documentation](https://www.odoo.com/documentation/16.0/)
- [Configuration société](https://www.odoo.com/documentation/16.0/applications/general/companies.html)
- [Configuration taxes](https://www.odoo.com/documentation/16.0/applications/finance/accounting/taxation.html)
- [Multi-devises](https://www.odoo.com/documentation/16.0/applications/finance/accounting/getting_started/multi_currency.html)

### Réglementation française
- [Service Public Pro - TVA DOM](https://www.service-public.fr/professionnels-entreprises/vosdroits/F23567)
- [Code Général des Impôts](https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069577/)
- [Mentions légales factures](https://www.service-public.fr/professionnels-entreprises/vosdroits/F31214)

### Ressources externes
- [Banque Centrale Européenne - Taux de change](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.fr.html)
- [Code ISO 4217 - Devises](https://www.iso.org/iso-4217-currency-codes.html)

---

## ❓ Support et questions

### En cas de problème
1. Consultez la section "Problèmes courants" de chaque guide
2. Vérifiez les logs Odoo : `Paramètres > Technique > Logs`
3. Consultez la documentation officielle Odoo
4. Contactez le support Odoo si vous avez une licence Enterprise

### Pour poser une question
- Précisez le guide concerné (ex: BLOC1_2)
- Décrivez le problème rencontré
- Joignez des captures d'écran si possible
- Indiquez la version Odoo utilisée

---

## 📝 Historique des modifications

| Date | Version | Auteur | Description |
|------|---------|--------|-------------|
| 2026-02-26 | 1.0 | Système | Création de la documentation initiale BLOC 1 |
| | | | - Rapport d'investigation |
| | | | - 4 guides de configuration |
| | | | - Index et structure |

---

## ✅ Checklist générale du BLOC 1

### Documentation
- [x] Rapport d'investigation créé
- [x] Guide 1.1 (Société) créé
- [x] Guide 1.2 (Taxes) créé
- [x] Guide 1.3 (Devises) créé
- [x] Guide 1.4 (Modules) créé
- [x] Index créé
- [ ] Dossier BLOC1_SCREENSHOTS/ créé

### Configuration (à effectuer)
- [ ] Connexion à l'instance réussie
- [ ] Modules vérifiés (1.4)
- [ ] Société configurée (1.1)
- [ ] Taxes configurées (1.2)
- [ ] Devises configurées (1.3)

### Validation (à effectuer)
- [ ] Tests devis avec TVA 2.1%
- [ ] Tests devis avec TVA 8.5%
- [ ] Tests devis avec Exonération 0%
- [ ] Tests conversion EUR/USD
- [ ] Captures d'écran prises
- [ ] Documentation à jour

---

## 🎉 Prochain BLOC

Une fois le BLOC 1 terminé et validé, vous pourrez passer au **BLOC 2** qui couvrira probablement :
- Configuration des produits
- Configuration des clients et fournisseurs
- Configuration des paiements
- Configuration des documents (templates)
- Ou autres paramètres métiers

---

**Note:** Cette documentation est un guide de référence. Adaptez les configurations à vos besoins spécifiques et respectez toujours les réglementations en vigueur.
