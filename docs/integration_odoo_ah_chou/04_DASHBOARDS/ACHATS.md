# Dashboards Achats

## Indicateurs demandés (Cahier des charges)

### Tableau Achat

| Indicateur | Description | Source |
|------------|-------------|--------|
| Fournisseur | Nom fournisseur | purchase.order.partner_id |
| Code Produit | Référence | product.default_code |
| Désignation | Nom produit | product.name |
| Navire | Transport | x_navire (champ perso) |
| Date départ | Départ port | x_date_depart |
| Date arrivée | Arrivée port | x_date_arrivee |
| Date dépotage | Réception | stock.move.date |

### Historique Achat

| Indicateur | Description | Source |
|------------|-------------|--------|
| Prix achat USD/kg | Prix unitaire USD | App Achats |
| Prix achat USD/UVC | Prix par unité USD | App Achats |
| Parité EUR/USD | Taux de change | App Achats |
| Coef frais | Coefficient frais | App Achats |
| Coef total approche | Coefficient global | App Achats |

### Stock Flottant

| Indicateur | Description |
|------------|-------------|
| Quantité UVC | Stock en transit |
| Quantité cartons | Stock en transit (conversion) |
| Navire | Identifiant transport |
| ETA | Date arrivée estimée |

## Configuration Odoo

### Rapports natifs

```
Achats > Rapports > Analyse achats
```

Rapports disponibles :
- Analyse des achats (pivot)
- Performance fournisseurs

### Filtres personnalisés

| Filtre | Champ |
|--------|-------|
| Par fournisseur | partner_id |
| Par groupe fournisseur | partner_id.x_groupe_fournisseur |
| Par catégorie produit | product_id.categ_id |
| Par statut transit | x_statut_transit |
| Par période | date_order |

## Tableaux de bord personnalisés

### Dashboard 1 : Vue d'ensemble Achats

```
┌─────────────────────────────────────────────────────────────────┐
│                    TABLEAU DE BORD ACHATS                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ TOTAL CMD   │  │  EN TRANSIT │  │   À RECEVOIR│  │ REÇU    │ │
│  │  85 000 €   │  │  32 000 €   │  │   28 000 €  │  │ 25 000 €│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  [Graphique achats par fournisseur]  [Graphique par origine]    │
├─────────────────────────────────────────────────────────────────┤
│  [Commandes en cours - Détail]                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard 2 : Stock Flottant

```
┌─────────────────────────────────────────────────────────────────┐
│                    STOCK FLOTTANT                                │
├─────────────────────────────────────────────────────────────────┤
│  En transit : 15 000 UVC (750 cartons) - Valeur : 32 000 €     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┬───────────┬───────────┬────────────┬────────┐ │
│  │ Navire       │ Fourniss. │ Départ    │ Arrivée    │ Statut │ │
│  ├──────────────┼───────────┼───────────┼────────────┼────────┤ │
│  │ EVER GIVEN   │ ALPS      │ 15/01/26  │ 28/02/26   │ Transit│ │
│  │ MSC OSCAR    │ ADI000    │ 01/02/26  │ 15/03/26   │ Transit│ │
│  └──────────────┴───────────┴───────────┴────────────┴────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard 3 : Analyse Prix de Revient

```
┌─────────────────────────────────────────────────────────────────┐
│                    ÉVOLUTION PRIX DE REVIENT                     │
├─────────────────────────────────────────────────────────────────┤
│  Produit : Bichique standard 225g                               │
├─────────────────────────────────────────────────────────────────┤
│  [Graphique évolution PR sur 12 mois]                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┬────────┬────────┬───────┬───────────┬────────┐  │
│  │ Date récep │ Frs    │ USD/kg │ Parité│ Coef App. │ PR EUR │  │
│  ├────────────┼────────┼────────┼───────┼───────────┼────────┤  │
│  │ 15/01/26   │ ALPS   │ 4.50   │ 0.92  │ 1.35      │ 5.59   │  │
│  │ 01/12/25   │ ALPS   │ 4.20   │ 0.94  │ 1.32      │ 5.21   │  │
│  └────────────┴────────┴────────┴───────┴───────────┴────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Intégration avec App Achats

### Données stockées dans App Achats

| Donnée | Localisation |
|--------|--------------|
| Prix USD | App Achats (achat) |
| Parité | App Achats (achat) |
| Coefficients | App Achats (achat) |
| Navire, dates | App Achats (achat) |

### Données stockées dans Odoo

| Donnée | Localisation |
|--------|--------------|
| Commande confirmée | purchase.order |
| Prix EUR final | purchase.order.line |
| Réception | stock.picking |
| Lot, DLC | stock.lot |

### Rapport combiné

Pour un rapport complet incluant les détails USD et coefficients :

**Option 1** : API depuis App Achats vers Odoo pour stocker les données de calcul

**Option 2** : Rapport généré côté App Achats avec données Odoo

**Option 3** : Champs personnalisés sur purchase.order pour stocker les infos calcul

### Champs suggérés sur purchase.order

| Champ | Type | Description |
|-------|------|-------------|
| x_navire | Char | Nom navire/conteneur |
| x_date_depart | Date | Date départ port |
| x_date_arrivee | Date | Date arrivée estimée |
| x_date_depotage | Date | Date dépotage effectif |
| x_parite_eur_usd | Float | Taux de change utilisé |
| x_coef_approche | Float | Coefficient approche |
| x_origine_achat | Selection | app_achats / odoo_direct |

## Actions à réaliser

- [ ] Créer les champs personnalisés sur purchase.order
- [ ] Configurer les rapports natifs
- [ ] Développer le dashboard flottant
- [ ] Intégrer les données App Achats (optionnel)
- [ ] Former les utilisateurs

## Accès

| Profil | Dashboards accessibles |
|--------|------------------------|
| Direction | Tous |
| Responsable Achats | Tous achats |
| Logistique | Flottant, réceptions |
| Admin | Tous |
