# Scénarios de Test

## Organisation des tests

### Phases

| Phase | Objectif | Prérequis |
|-------|----------|-----------|
| 1. Unitaire | Tester chaque fonction | Paramétrage terminé |
| 2. Intégration | Tester les flux complets | Tests unitaires OK |
| 3. Acceptation | Validation utilisateur | Tests intégration OK |
| 4. Performance | Charge et temps réponse | Données importées |

## Scénarios par module

---

## MODULE VENTES

### TEST-VTE-001 : Création commande client simple

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Aller dans Ventes > Commandes | Liste des commandes |
| 2 | Cliquer "Créer" | Formulaire vierge |
| 3 | Sélectionner client "SOCIETE LOT" | Client chargé, liste de prix appliquée |
| 4 | Ajouter produit "Bichique standard 225g" | Produit ajouté, prix selon liste |
| 5 | Saisir quantité 10 | Prix total calculé |
| 6 | Confirmer la commande | Statut "Commande de vente" |
| 7 | Vérifier le bon de préparation créé | BL visible dans Stock |

### TEST-VTE-002 : Tarif spécifique client/produit

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Créer règle prix spéciale client A / produit X | Règle créée |
| 2 | Créer commande client A avec produit X | Prix spécial appliqué |
| 3 | Créer commande client B avec produit X | Prix standard appliqué |

### TEST-VTE-003 : Promotion périodique

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Créer promo -20% sur catégorie Pêche, 01/03 au 31/03 | Promo créée |
| 2 | Créer commande le 15/03 avec produit Pêche | Remise -20% appliquée |
| 3 | Créer commande le 15/04 avec même produit | Pas de remise |

### TEST-VTE-004 : Facturation groupée

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Créer 3 commandes pour client X | 3 commandes créées |
| 2 | Livrer les 3 commandes | 3 BL validés |
| 3 | Aller dans Facturation | 3 BL à facturer |
| 4 | Sélectionner les 3, créer facture groupée | 1 seule facture avec 3 origines |

### TEST-VTE-005 : Blocage encours client

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Définir plafond encours 1000€ pour client Y | Plafond configuré |
| 2 | Définir blocage = "Oui si dépassement" | Blocage configuré |
| 3 | Créer facture impayée 800€ | Encours = 800€ |
| 4 | Créer nouvelle commande 500€ | Alerte ou blocage (encours 1300€ > 1000€) |

---

## MODULE ACHATS

### TEST-ACH-001 : Création commande fournisseur (Odoo direct)

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Aller dans Achats > Commandes | Liste des commandes |
| 2 | Cliquer "Créer" | Formulaire vierge |
| 3 | Sélectionner fournisseur "ALPS" | Fournisseur chargé |
| 4 | Ajouter produit avec quantité | Ligne ajoutée |
| 5 | Confirmer la commande | Statut "Bon de commande" |
| 6 | Vérifier réception créée | BL visible dans Stock |

### TEST-ACH-002 : Création commande via App Achats

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Ouvrir App Achats Harel | Interface App |
| 2 | Créer nouveau dossier d'achat | Dossier créé |
| 3 | Sélectionner fournisseur (depuis Odoo) | Fournisseur chargé |
| 4 | Ajouter produits (depuis Odoo) | Produits chargés |
| 5 | Saisir prix USD, parité, coefficients | Calcul PR effectué |
| 6 | Envoyer vers Odoo | Commande créée dans Odoo |
| 7 | Vérifier dans Odoo Achats | Commande confirmée visible |

### TEST-ACH-003 : Réception avec lot et DLC

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Ouvrir réception depuis commande | BL réception |
| 2 | Saisir quantité reçue | Quantité enregistrée |
| 3 | Créer lot avec numéro | Lot créé |
| 4 | Saisir date d'expiration | DLC enregistrée |
| 5 | Valider réception | Stock mis à jour |
| 6 | Vérifier stock avec lot | Lot visible avec DLC |

---

## MODULE STOCK

### TEST-STK-001 : Valorisation PRMP

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Vérifier stock produit X = 100 à 5€ | Valeur = 500€ |
| 2 | Recevoir 50 unités à 6€ | Réception validée |
| 3 | Vérifier PRMP | PRMP = (500 + 300) / 150 = 5.33€ |
| 4 | Vérifier standard_price produit | 5.33€ |

### TEST-STK-002 : Alerte DLC

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Créer lot avec DLC dans 25 jours | Lot créé |
| 2 | Exécuter action planifiée alerte DLC | Notification envoyée |
| 3 | Vérifier rapport produits bientôt périmés | Lot visible |

### TEST-STK-003 : Préparation 2 étapes

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Confirmer commande vente | BL préparation créé |
| 2 | Valider préparation (pick) | Stock → Output |
| 3 | Valider expédition (ship) | Output → Client |
| 4 | Vérifier stock | Quantité déduite |

### TEST-STK-004 : Tranches de péremption

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Créer lots avec différentes DLC | Lots créés |
| 2 | Ouvrir rapport tranches péremption | Rapport affiché |
| 3 | Vérifier répartition par tranche | Quantités correctes par tranche |

---

## MODULE COMPTABILITÉ

### TEST-CPT-001 : Facture client avec TVA DOM

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Créer facture produit TVA 2.1% | Facture créée |
| 2 | Vérifier calcul TVA | HT + 2.1% = TTC |
| 3 | Valider facture | Écritures comptables générées |
| 4 | Vérifier écritures | 707, 44571, 411 |

### TEST-CPT-002 : Facture fournisseur

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Recevoir facture depuis commande | Facture brouillon |
| 2 | Vérifier montants | Conforme à commande |
| 3 | Valider facture | Écritures générées |
| 4 | Enregistrer paiement | Facture soldée |

### TEST-CPT-003 : Import plan comptable

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Exécuter script import | Import terminé |
| 2 | Vérifier nombre de comptes | ~900 comptes importés |
| 3 | Vérifier types de comptes | Types corrects |
| 4 | Vérifier comptes 41, 40 | Comptes lettrables |

---

## MODULE POS

### TEST-POS-001 : Session caisse

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Ouvrir session avec fond caisse 200€ | Session ouverte |
| 2 | Effectuer vente espèces 50€ | Ticket imprimé |
| 3 | Effectuer vente CB 75€ | Ticket imprimé |
| 4 | Clôturer session | Comptage espèces |
| 5 | Saisir comptage 250€ | Session clôturée |
| 6 | Vérifier écritures | Écritures comptables générées |

---

## DASHBOARDS

### TEST-DSH-001 : Dashboard ventes

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Créer plusieurs commandes/factures | Données créées |
| 2 | Ouvrir dashboard ventes | Indicateurs affichés |
| 3 | Vérifier CA total | Somme correcte |
| 4 | Filtrer par groupe client | Filtre appliqué |
| 5 | Comparer N vs N-1 | Comparaison affichée |

---

## INTÉGRATION APP ACHATS

### TEST-INT-001 : Synchronisation produits

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Créer produit dans Odoo | Produit créé |
| 2 | Rafraîchir produits dans App | Nouveau produit visible |
| 3 | Vérifier données (nom, UoM, prix) | Données correctes |

### TEST-INT-002 : Création commande complète

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Créer achat complet dans App | Calculs PR effectués |
| 2 | Envoyer vers Odoo | API call réussi |
| 3 | Vérifier commande Odoo | Commande confirmée |
| 4 | Vérifier montants EUR | Montants corrects |
| 5 | Réceptionner dans Odoo | Stock mis à jour |

---

## DROITS D'ACCÈS

### TEST-SEC-001 : Commercial restreint

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Se connecter en tant que commercial | Connexion OK |
| 2 | Lister les clients | Seulement ses clients |
| 3 | Lister les commandes | Seulement ses commandes |
| 4 | Accéder aux achats | Accès refusé |
| 5 | Voir prix d'achat produit | Champ masqué |

### TEST-SEC-002 : Direction lecture seule

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Se connecter en tant que direction | Connexion OK |
| 2 | Accéder aux ventes | Lecture OK |
| 3 | Tenter de modifier une commande | Modification refusée |
| 4 | Accéder aux dashboards | Accès OK |
