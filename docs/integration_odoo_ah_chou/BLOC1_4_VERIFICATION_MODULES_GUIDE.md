# BLOC 1.4 - Guide de Vérification des Modules Installés

**Objectif:** Vérifier et documenter les modules installés dans l'instance Odoo

---

## Modules requis pour le projet

| Module | Code technique | Usage | Priorité |
|--------|---------------|-------|----------|
| Ventes | sale_management | Gestion des devis et commandes clients | ✅ Critique |
| Achats | purchase | Gestion des bons de commande fournisseurs | ✅ Critique |
| Inventaire | stock | Gestion des stocks et mouvements | ✅ Critique |
| Comptabilité | account_accountant | Comptabilité générale, taxes, devises | ✅ Critique |
| Point de Vente | point_of_sale | Caisse et vente en magasin | ✅ Critique |

---

## Accès à la liste des modules

### Navigation
1. Se connecter à https://ah-chou1.odoo.com
2. Cliquer sur l'icône **Paramètres** (engrenage) en haut à droite
3. Dans le menu, cliquer sur **Applications**
4. Ou directement : `Paramètres > Applications`

### Filtrer les modules installés
1. Dans la page Applications
2. Cliquer sur le filtre **Installé** (en haut)
3. La liste affiche uniquement les modules actuellement installés

---

## Vérification des modules critiques

### 1. Module Ventes (sale_management)

#### Identification
- **Nom affiché:** Ventes
- **Nom technique:** sale_management
- **Icône:** 🛒 Panier de courses
- **Description:** Envoyez des devis, obtenez des bons de commande, facturez et suivez les ventes

#### Comment vérifier l'installation
**Méthode 1 : Via le menu principal**
- Vérifier la présence de l'application **Ventes** dans le menu principal
- L'icône doit être visible et accessible

**Méthode 2 : Via les Applications**
- Aller dans `Paramètres > Applications`
- Rechercher "Ventes" ou "sale_management"
- Statut doit être : **Installé** (bouton vert)

**Méthode 3 : Test fonctionnel**
- Aller dans **Ventes** (menu principal)
- Créer un nouveau devis
- Si accessible → Module installé ✅

#### Fonctionnalités à vérifier
- [ ] Création de devis
- [ ] Confirmation en commande
- [ ] Transformation en facture
- [ ] Gestion des clients
- [ ] Catalogue de produits
- [ ] Conditions de paiement
- [ ] Incoterms

#### Sous-modules optionnels
- **Signature électronique** (sale_management_signature) - Pour faire signer les devis
- **Abonnements** (sale_subscription) - Pour la facturation récurrente
- **Configurateur de produits** (sale_product_configurator) - Pour produits complexes

---

### 2. Module Achats (purchase)

#### Identification
- **Nom affiché:** Achats
- **Nom technique:** purchase
- **Icône:** 📋 Presse-papiers
- **Description:** Lancez des demandes de prix, comparez les offres, gérez les commandes

#### Comment vérifier l'installation
**Méthode 1 : Via le menu principal**
- Vérifier la présence de l'application **Achats** dans le menu principal

**Méthode 2 : Test fonctionnel**
- Aller dans **Achats** (menu principal)
- Créer un nouveau bon de commande
- Si accessible → Module installé ✅

#### Fonctionnalités à vérifier
- [ ] Création de demandes de prix
- [ ] Confirmation en commande
- [ ] Réception des produits
- [ ] Contrôle des factures fournisseurs
- [ ] Gestion des fournisseurs
- [ ] Accords de prix
- [ ] Appels d'offres

#### Sous-modules optionnels
- **Accords-cadres** (purchase_requisition) - Pour les appels d'offres
- **Facturation par lots** (purchase_stock) - Pour facturation automatique à réception

---

### 3. Module Inventaire (stock)

#### Identification
- **Nom affiché:** Inventaire
- **Nom technique:** stock
- **Icône:** 📦 Boîte/Package
- **Description:** Gérez votre entrepôt, les réceptions, les livraisons, l'inventaire

#### Comment vérifier l'installation
**Méthode 1 : Via le menu principal**
- Vérifier la présence de l'application **Inventaire** dans le menu principal

**Méthode 2 : Test fonctionnel**
- Aller dans **Inventaire** (menu principal)
- Accéder à `Inventaire > Produits`
- Si accessible → Module installé ✅

#### Fonctionnalités à vérifier
- [ ] Gestion des emplacements
- [ ] Réceptions (bons de réception)
- [ ] Livraisons (bons de livraison)
- [ ] Mouvements de stock
- [ ] Inventaires physiques
- [ ] Traçabilité (numéros de série, lots)
- [ ] Règles de réassort

#### Sous-modules optionnels
- **Traçabilité** (stock_account) - Pour valorisation des stocks
- **Codes-barres** (stock_barcode) - Pour scan des produits
- **Lots & Numéros de série** (stock_production_lot) - Pour traçabilité avancée

---

### 4. Module Comptabilité (account_accountant)

#### Identification
- **Nom affiché:** Comptabilité
- **Nom technique:** account_accountant
- **Icône:** 💰 Pièce de monnaie
- **Description:** Gérez toute votre comptabilité : client, fournisseur, banque, trésorerie

#### Comment vérifier l'installation
**Méthode 1 : Via le menu principal**
- Vérifier la présence de l'application **Comptabilité** dans le menu principal

**Méthode 2 : Test fonctionnel**
- Aller dans **Comptabilité** (menu principal)
- Accéder aux **Écritures comptables**
- Si accessible → Module installé ✅

#### Fonctionnalités à vérifier
- [ ] Factures clients
- [ ] Factures fournisseurs
- [ ] Écritures comptables
- [ ] Rapprochement bancaire
- [ ] Plan comptable
- [ ] Taxes (TVA)
- [ ] Devises
- [ ] Journaux comptables
- [ ] Bilan et Compte de résultat
- [ ] Grand livre et Balance

#### Sous-modules optionnels
- **Rapports comptables** (account_reports) - Pour rapports avancés
- **Actifs** (account_asset) - Pour gestion des immobilisations
- **Budget** (account_budget) - Pour gestion budgétaire
- **Analytic** (analytic) - Pour comptabilité analytique

---

### 5. Module Point de Vente (point_of_sale)

#### Identification
- **Nom affiché:** Point de Vente
- **Nom technique:** point_of_sale
- **Icône:** 🏪 Caisse enregistreuse
- **Description:** Interface de caisse pour vente en magasin

#### Comment vérifier l'installation
**Méthode 1 : Via le menu principal**
- Vérifier la présence de l'application **Point de Vente** dans le menu principal

**Méthode 2 : Test fonctionnel**
- Aller dans **Point de Vente** (menu principal)
- Ouvrir une session de caisse
- Si accessible → Module installé ✅

#### Fonctionnalités à vérifier
- [ ] Création de sessions de caisse
- [ ] Interface de vente tactile
- [ ] Gestion des paiements multiples
- [ ] Tickets de caisse
- [ ] Clôture de caisse
- [ ] Rapports de vente
- [ ] Gestion des remises
- [ ] Synchronisation stocks

#### Sous-modules optionnels
- **Restaurants** (pos_restaurant) - Pour gestion de tables et commandes
- **Fidélité** (pos_loyalty) - Pour programme de fidélité
- **Remises** (pos_discount) - Pour remises avancées
- **Factures** (pos_sale) - Pour émission de factures depuis le POS

---

## Checklist de vérification

### Modules critiques installés
- [ ] **Ventes** (sale_management) - Accessible depuis le menu principal
- [ ] **Achats** (purchase) - Accessible depuis le menu principal
- [ ] **Inventaire** (stock) - Accessible depuis le menu principal
- [ ] **Comptabilité** (account_accountant) - Accessible depuis le menu principal
- [ ] **Point de Vente** (point_of_sale) - Accessible depuis le menu principal

### Tests fonctionnels effectués
- [ ] Création d'un devis dans Ventes
- [ ] Création d'un bon de commande dans Achats
- [ ] Consultation des stocks dans Inventaire
- [ ] Accès aux écritures comptables
- [ ] Ouverture d'une session POS

### Modules complémentaires recommandés
- [ ] **CRM** (crm) - Gestion de la relation client
- [ ] **Contacts** (contacts) - Gestion centralisée des contacts
- [ ] **Signature électronique** (sign) - Pour signature de documents
- [ ] **Documents** (documents) - Gestion documentaire

---

## Installation de modules manquants

### Si un module critique est manquant

#### Étape 1 : Rechercher le module
1. Aller dans `Paramètres > Applications`
2. Supprimer le filtre "Installé"
3. Rechercher le nom du module (ex: "Ventes")

#### Étape 2 : Installer le module
1. Cliquer sur le bouton **Installer** sur la carte du module
2. Attendre la fin de l'installation (peut prendre 1-2 minutes)
3. La page se recharge automatiquement
4. Le module apparaît maintenant dans le menu principal

#### Étape 3 : Configuration initiale
1. Lors de la première installation, un assistant de configuration peut s'afficher
2. Suivre les étapes de l'assistant
3. Configurer les paramètres de base
4. Valider la configuration

---

## Modules selon l'édition Odoo

### Odoo Community (gratuit)
- ✅ Ventes
- ✅ Achats
- ✅ Inventaire
- ❌ Comptabilité complète (version limitée)
- ✅ Point de Vente

### Odoo Enterprise (payant)
- ✅ Ventes (version avancée)
- ✅ Achats (version avancée)
- ✅ Inventaire (version avancée)
- ✅ Comptabilité (account_accountant) - **Version complète**
- ✅ Point de Vente (version avancée)
- ✅ Tous les rapports avancés
- ✅ Support technique

### Comment vérifier l'édition
1. Aller dans `Paramètres > À propos`
2. Regarder la version affichée :
   - **Odoo 16.0 Community** → Version gratuite
   - **Odoo 16.0 Enterprise** → Version payante

---

## Documentation des modules installés

### Création d'un inventaire

Après vérification, créer un document `BLOC1_MODULES_INVENTAIRE.md` avec :

```markdown
# Inventaire des Modules - Instance ah-chou1

**Date de vérification:** [Date]
**Version Odoo:** [16.0 / 17.0 / etc.]
**Édition:** [Community / Enterprise]

## Modules critiques

| Module | Statut | Version | Date d'installation |
|--------|--------|---------|---------------------|
| Ventes | ✅ Installé | 16.0 | [Date] |
| Achats | ✅ Installé | 16.0 | [Date] |
| Inventaire | ✅ Installé | 16.0 | [Date] |
| Comptabilité | ✅ Installé | 16.0 | [Date] |
| Point de Vente | ✅ Installé | 16.0 | [Date] |

## Modules complémentaires

| Module | Statut | Usage |
|--------|--------|-------|
| CRM | [Statut] | Gestion relation client |
| Projet | [Statut] | Gestion de projets |
| Documents | [Statut] | GED |

## Modules à installer

- [ ] [Nom du module] - [Raison]
```

---

## Captures d'écran recommandées

Après vérification, prendre des captures d'écran de :
1. **Liste des applications** (`Paramètres > Applications` avec filtre "Installé")
2. **Menu principal** (toutes les icônes d'applications visibles)
3. **Détail du module Ventes** (version, fonctionnalités)
4. **Détail du module Achats**
5. **Détail du module Inventaire**
6. **Détail du module Comptabilité**
7. **Détail du module Point de Vente**
8. **Page "À propos"** (`Paramètres > À propos` - pour version et édition)

Enregistrer les captures dans `docs/integration_odoo_ah_chou/BLOC1_SCREENSHOTS/`

---

## Problèmes courants

### Un module n'apparaît pas dans la liste
- Vérifier le filtre (Installé / Tous)
- Utiliser la barre de recherche
- Vérifier l'édition Odoo (Community vs Enterprise)
- Rafraîchir la liste des modules (`Paramètres > Applications > Mettre à jour la liste des applications`)

### Impossible d'installer un module
- Vérifier les droits d'accès (administrateur requis)
- Vérifier les dépendances (modules prérequis)
- Vérifier l'espace disque disponible
- Vérifier les logs dans `Paramètres > Technique > Logs`

### Un module installé ne fonctionne pas
- Redémarrer le serveur Odoo
- Vérifier la configuration du module
- Mettre à jour le module
- Vérifier les logs d'erreur

### Les données de test apparaissent
- Lors de l'installation d'un module, Odoo peut créer des données de démo
- Pour supprimer : `Paramètres > Technique > Base de données > Supprimer les données de démo`
- Ou réinstaller Odoo sans données de démo

---

## Dépendances entre modules

### Modules de base (automatiquement installés)
- **base** - Module de base Odoo
- **web** - Interface web
- **mail** - Messagerie et notifications

### Dépendances des modules critiques

**Ventes** dépend de :
- base
- product (Produits)
- account (Comptabilité de base)
- portal (Portail client)

**Achats** dépend de :
- base
- product
- account
- stock (souvent)

**Inventaire** dépend de :
- base
- product
- barcodes (pour codes-barres)

**Comptabilité** dépend de :
- base
- web
- product

**Point de Vente** dépend de :
- base
- product
- stock
- account

---

## Plan de mise à jour des modules

### Vérification régulière
- **Fréquence recommandée:** Mensuelle
- **Vérifier:** Mises à jour de sécurité
- **Vérifier:** Nouvelles fonctionnalités
- **Vérifier:** Corrections de bugs

### Procédure de mise à jour
1. Sauvegarder la base de données
2. Tester en environnement de staging
3. Planifier une maintenance
4. Effectuer la mise à jour
5. Tester les fonctionnalités critiques
6. Documenter les changements

---

## Ressources

- [Documentation Odoo - Applications](https://www.odoo.com/documentation/16.0/applications.html)
- [Odoo Apps Store](https://apps.odoo.com/) - Modules tiers
- [Guide des modules Odoo](https://www.odoo.com/page/all-apps)
