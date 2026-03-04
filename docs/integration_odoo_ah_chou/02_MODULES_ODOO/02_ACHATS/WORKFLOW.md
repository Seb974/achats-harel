# Workflow Achats

## Vue d'ensemble

Deux sources de commandes d'achat :
1. **Via App Achats Harel** : Achats import (USD → EUR)
2. **Directement dans Odoo** : Achats locaux (EUR)

## Flux via App Achats Harel (Import)

```
┌─────────────────────────────────────────────────────────────────┐
│                    APP ACHATS HAREL 4.0                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐ │
│  │ Sélect. │  │ Saisie  │  │ Calcul  │  │ Envoi vers Odoo     │ │
│  │ Produits│─►│ Quantité│─►│ PR EUR  │─►│ (commande confirmée)│ │
│  │ Frs     │  │ Prix USD│  │         │  │                     │ │
│  └─────────┘  └─────────┘  └─────────┘  └──────────┬──────────┘ │
└────────────────────────────────────────────────────┼────────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ODOO                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        │
│  │  COMMANDE   │     │  RÉCEPTION  │     │   FACTURE   │        │
│  │  CONFIRMÉE  │ ──► │  (+ lots)   │ ──► │  FOURNISS.  │        │
│  └─────────────┘     └─────────────┘     └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Étapes détaillées

#### 1. Création achat (App Achats)

**Acteur** : Responsable achats

| Action | Détail |
|--------|--------|
| Nouveau dossier | Créer un dossier d'achat |
| Infos transit | Navire, date départ, date arrivée |
| Sélection fournisseur | Depuis liste Odoo |
| Ajout produits | Depuis catalogue Odoo |
| Saisie prix | Prix USD/UVC |
| Saisie parité | Taux EUR/USD du jour |
| Saisie coef | Coefficient d'approche |

#### 2. Calcul PR (App Achats)

Automatique après saisie des coefficients.

#### 3. Envoi vers Odoo (App Achats)

**Bouton** : "Envoyer vers Odoo"

| Donnée envoyée | Champ Odoo |
|----------------|------------|
| Fournisseur | partner_id |
| Date | date_order |
| Produit | product_id |
| Quantité | product_qty |
| Prix EUR | price_unit |
| UoM | product_uom_id |
| Notes | note (détails calcul) |

#### 4. Réception (Odoo)

**Acteur** : Logistique

```
Stock > Opérations > Réceptions > [Bon de réception]
```

| Action | Détail |
|--------|--------|
| Vérifier quantités | Comparer commande vs reçu |
| Saisir lots | Numéro de lot + DLC |
| Valider | Entrée en stock |

#### 5. Facturation (Odoo)

**Acteur** : Comptable

```
Comptabilité > Fournisseurs > Factures fournisseurs
```

Créer la facture depuis la commande ou saisir manuellement.

## Flux Odoo direct (Local)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  COMMANDE   │ ──► │  RÉCEPTION  │ ──► │   FACTURE   │
│  BROUILLON  │     │             │     │  FOURNISS.  │
└─────────────┘     └─────────────┘     └─────────────┘
```

Pour les achats locaux en EUR sans calcul de coefficient.

## Gestion du stock flottant

### Définition

Le **stock flottant** représente la marchandise en transit (sur un navire).

### Suivi dans App Achats

| Champ | Description |
|-------|-------------|
| Navire | Nom du navire/conteneur |
| Date départ | Départ du port |
| Date arrivée | Arrivée estimée |
| Statut | En transit / Arrivé / Dépoté |

### Transfert vers Odoo

Après dépotage (arrivée et contrôle) :
1. Créer la réception dans Odoo
2. Les quantités passent de "flottant" à "stock"

### Emplacement flottant (optionnel)

Créer un emplacement virtuel dans Odoo :

```
Stock > Configuration > Emplacements
Nom: Transit/Flottant
Type: Vue (ou Interne)
```

Flux :
1. Achat → Emplacement Flottant
2. Dépotage → Transfert interne → Stock principal

## Tableau achats (historique)

Le cahier des charges demande un historique avec :

| Champ | Source |
|-------|--------|
| Nom Fournisseur | purchase.order.partner_id |
| Code Produit | product.default_code |
| Désignation | product.name |
| Navire | x_navire (champ perso) |
| Date départ | x_date_depart (champ perso) |
| Date arrivée | x_date_arrivee (champ perso) |
| Date dépotage | Date réception |
| Prix achat USD | Stocké dans App Achats |
| Parité | Stocké dans App Achats |
| Coef approche | Stocké dans App Achats |

### Solution

Les données de calcul (USD, parité, coef) sont stockées dans l'App Achats.
Un rapport croisé peut être généré en combinant les données Odoo et App.

## Actions à réaliser

- [ ] Documenter le processus pour l'équipe achats
- [ ] Créer les champs personnalisés (navire, dates)
- [ ] Configurer l'emplacement flottant (optionnel)
- [ ] Former sur le processus de réception
- [ ] Mettre en place le reporting historique

## Tests

- [ ] Créer un achat via App → Vérifier dans Odoo
- [ ] Réceptionner avec lots et DLC
- [ ] Créer la facture fournisseur
- [ ] Vérifier le stock après réception
