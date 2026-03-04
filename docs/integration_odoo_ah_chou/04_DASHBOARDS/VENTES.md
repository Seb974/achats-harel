# Dashboards Ventes

## Indicateurs demandés (Cahier des charges)

### Palmarès

| Indicateur | Description | Source |
|------------|-------------|--------|
| Chiffre d'Affaires | CA HT | sale.order / account.move |
| Unités de Vente | Quantités vendues | sale.order.line |
| Volume KG | Poids total vendu | sale.order.line × product.weight |
| Valeur Marge | CA - Coût | Calculé |
| Taux de Marque | Marge / CA × 100 | Calculé |

### Colonnes détail

| Colonne | Description |
|---------|-------------|
| Total | Toutes ventes |
| Promo | Ventes avec remise promo |
| Hors Promo | Ventes sans promo |
| 3xNet | Ventes au prix net fixe |
| Ristournable | Ventes éligibles RFA |

### Axes d'analyse

| Axe | Champ Odoo | Niveau |
|----|------------|--------|
| Client | partner_id | Détail |
| Groupe Client | partner_id.x_groupe_client | Agrégé |
| Catégorie | partner_id.category_id | Agrégé |
| Enseigne | partner_id.x_enseigne | Agrégé |
| Typologie | partner_id.x_typologie | Agrégé |
| Famille Produit | product_id.categ_id | Agrégé |
| Sous-famille | product_id.categ_id (niveau 2) | Agrégé |
| Secteur | partner_id.x_secteur | Agrégé |
| Vendeur | user_id | Agrégé |

### Comparatifs

| Type | Description |
|------|-------------|
| N vs N-1 | Année en cours vs année précédente |
| Période libre | De date à date |
| Mensuel | Mois par mois |

## Configuration Odoo

### Rapports natifs

```
Ventes > Rapports > Ventes
```

Rapports disponibles par défaut :
- Analyse des ventes (pivot)
- Graphiques (barres, lignes, camembert)

### Filtres personnalisés

| Filtre | Champ |
|--------|-------|
| Par groupe client | partner_id.x_groupe_client |
| Par enseigne | partner_id.x_enseigne |
| Par catégorie client | partner_id.category_id |
| Par famille produit | product_id.categ_id |
| Par commercial | user_id |

### Mesures personnalisées

| Mesure | Calcul |
|--------|--------|
| Volume KG | sum(product_uom_qty × product_id.weight) |
| Marge | sum(price_subtotal - (product_uom_qty × product_id.standard_price)) |
| Taux de marque | (Marge / CA) × 100 |

## Tableaux de bord personnalisés

### Dashboard 1 : Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                    TABLEAU DE BORD VENTES                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   CA HT     │  │   MARGE     │  │  TX MARQUE  │  │ VOL. KG │ │
│  │  125 000 €  │  │  45 000 €   │  │    36%      │  │  8 500  │ │
│  │   +12% N-1  │  │   +8% N-1   │  │   -2pts     │  │ +15%    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  [Graphique CA par groupe client]   [Graphique CA par famille]  │
├─────────────────────────────────────────────────────────────────┤
│  [Top 10 clients]                   [Top 10 produits]           │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard 2 : Analyse promo/hors promo

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYSE PROMOTIONS                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Type        │   CA HT   │  % Total  │  Marge  │ Tx Marq │   │
│  ├──────────────┼───────────┼───────────┼─────────┼─────────┤   │
│  │  Total       │  125 000  │   100%    │ 45 000  │   36%   │   │
│  │  Promo       │   35 000  │    28%    │  8 750  │   25%   │   │
│  │  Hors Promo  │   75 000  │    60%    │ 31 500  │   42%   │   │
│  │  3xNet       │   15 000  │    12%    │  4 750  │   32%   │   │
│  └──────────────┴───────────┴───────────┴─────────┴─────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard 3 : Comparatif N/N-1

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPARATIF N vs N-1                           │
├─────────────────────────────────────────────────────────────────┤
│  Période : 01/01/2026 - 28/02/2026 vs 01/01/2025 - 28/02/2025  │
├─────────────────────────────────────────────────────────────────┤
│  [Graphique évolution mensuelle CA N vs N-1]                    │
├─────────────────────────────────────────────────────────────────┤
│  Par groupe client :                                             │
│  ┌────────────┬──────────┬──────────┬─────────┐                 │
│  │ Groupe     │  CA N    │  CA N-1  │  Évol.  │                 │
│  ├────────────┼──────────┼──────────┼─────────┤                 │
│  │ GBH        │  45 000  │  42 000  │  +7%    │                 │
│  │ SMDIS      │  32 000  │  35 000  │  -9%    │                 │
│  │ ...        │  ...     │  ...     │  ...    │                 │
│  └────────────┴──────────┴──────────┴─────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

## Champs calculés nécessaires

### Sur sale.order.line

| Champ | Calcul |
|-------|--------|
| x_volume_kg | product_uom_qty × product_id.weight |
| x_cout_total | product_uom_qty × product_id.standard_price |
| x_marge | price_subtotal - x_cout_total |
| x_taux_marque | (x_marge / price_subtotal) × 100 |
| x_is_promo | discount > 0 AND dans période promo |
| x_is_3xnet | Flag selon règle tarification |
| x_is_ristournable | product_id.x_ristournable |

### Sur sale.order

| Champ | Calcul |
|-------|--------|
| x_total_volume_kg | sum(line.x_volume_kg) |
| x_total_marge | sum(line.x_marge) |
| x_taux_marque_global | (x_total_marge / amount_untaxed) × 100 |

## Implémentation

### Option 1 : Odoo Studio (Enterprise)

Odoo Enterprise inclut **Odoo Studio** qui permet de créer des tableaux de bord personnalisés sans code.

### Option 2 : Développement module

Créer un module `ah_chou_dashboards` avec :
- Champs calculés
- Vues pivot personnalisées
- Vues graphiques
- Tableaux de bord

### Option 3 : Export vers BI

Exporter les données vers Excel/Power BI pour des analyses avancées.

## Actions à réaliser

- [ ] Créer les champs calculés sur sale.order.line
- [ ] Configurer les rapports natifs
- [ ] Créer les filtres personnalisés
- [ ] Développer les tableaux de bord
- [ ] Tester avec des données réelles
- [ ] Former les utilisateurs

## Accès

| Profil | Dashboards accessibles |
|--------|------------------------|
| Direction | Tous |
| Commercial | Ses ventes + équipe |
| Comptable | CA et marges |
| Admin | Tous |
