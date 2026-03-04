# Dashboards Stock

## Indicateurs demandés (Cahier des charges)

### Vue Stock

| Indicateur | Description | Unité |
|------------|-------------|-------|
| Quantité UVC | Stock en unités | UVC |
| Quantité cartons | Stock en cartons | Cartons |
| Lieu de stockage | Emplacement | Zone 1-6 |
| Reste à livrer | Commandes en attente | UVC |
| Flottant | En transit | UVC |
| Périmés | Stock périmé | UVC |
| PRMP | Prix moyen pondéré | EUR |
| Date dernier PRMP | Dernière MAJ | Date |

### Tranches de péremption

| Tranche | Critère |
|---------|---------|
| 1 à 3 mois | DLC ≤ 90 jours |
| 4 à 6 mois | 90 < DLC ≤ 180 jours |
| 7 à 12 mois | 180 < DLC ≤ 365 jours |
| 13 à 24 mois | 365 < DLC ≤ 730 jours |
| +24 mois | DLC > 730 jours |

## Configuration Odoo

### Rapports natifs

```
Stock > Rapports > Stock
```

Rapports disponibles :
- Valorisation stock
- Stock par emplacement
- Mouvements de stock
- Traçabilité

### Filtres personnalisés

| Filtre | Champ |
|--------|-------|
| Par emplacement | location_id |
| Par catégorie produit | product_id.categ_id |
| Par lot | lot_id |
| Par DLC | lot_id.expiration_date |

## Tableaux de bord personnalisés

### Dashboard 1 : Vue d'ensemble Stock

```
┌─────────────────────────────────────────────────────────────────┐
│                    TABLEAU DE BORD STOCK                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ STOCK TOTAL │  │  FLOTTANT   │  │ À LIVRER    │  │PÉRIMÉS  │ │
│  │ 45 000 UVC  │  │  8 500 UVC  │  │ 3 200 UVC   │  │ 150 UVC │ │
│  │ 185 000 €   │  │  32 000 €   │  │  12 500 €   │  │ 450 €   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  [Graphique stock par zone]         [Graphique par famille]     │
├─────────────────────────────────────────────────────────────────┤
│  [Alertes DLC imminentes]                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard 2 : Tranches de péremption

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYSE DLC                                   │
├─────────────────────────────────────────────────────────────────┤
│  Date : 26/02/2026                                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────┬───────────┬───────────┬─────────┐           │
│  │ Tranche        │ Quantité  │ Valeur    │ % Stock │           │
│  ├────────────────┼───────────┼───────────┼─────────┤           │
│  │ 1-3 mois       │ 2 500 UVC │  9 500 €  │  5.5%   │  ⚠️      │
│  │ 4-6 mois       │ 8 200 UVC │ 32 000 €  │  18.2%  │           │
│  │ 7-12 mois      │15 000 UVC │ 58 500 €  │  33.3%  │           │
│  │ 13-24 mois     │12 500 UVC │ 48 750 €  │  27.8%  │           │
│  │ +24 mois       │ 6 800 UVC │ 26 520 €  │  15.1%  │           │
│  ├────────────────┼───────────┼───────────┼─────────┤           │
│  │ TOTAL          │45 000 UVC │175 270 €  │  100%   │           │
│  └────────────────┴───────────┴───────────┴─────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  [Graphique répartition DLC en camembert]                       │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard 3 : Stock par emplacement

```
┌─────────────────────────────────────────────────────────────────┐
│                    STOCK PAR ZONE                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┬───────────┬───────────┬─────────────┐             │
│  │ Zone     │ Quantité  │ Valeur    │ Occupation  │             │
│  ├──────────┼───────────┼───────────┼─────────────┤             │
│  │ Zone 1   │ 12 500    │  48 750 € │ ████████░░  │             │
│  │ Zone 2   │  8 200    │  31 980 € │ █████░░░░░  │             │
│  │ Zone 3   │  9 500    │  37 050 € │ ██████░░░░  │             │
│  │ Zone 4   │  7 800    │  30 420 € │ █████░░░░░  │             │
│  │ Zone 5   │  4 200    │  16 380 € │ ███░░░░░░░  │             │
│  │ Zone 6   │  2 800    │  10 920 € │ ██░░░░░░░░  │             │
│  └──────────┴───────────┴───────────┴─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard 4 : Rotation stock

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROTATION STOCK                                │
├─────────────────────────────────────────────────────────────────┤
│  Période : 12 derniers mois                                     │
├─────────────────────────────────────────────────────────────────┤
│  [Top 10 produits à forte rotation]                             │
│  [Top 10 produits à faible rotation - risque obsolescence]      │
├─────────────────────────────────────────────────────────────────┤
│  Indicateurs globaux :                                          │
│  - Rotation moyenne : 4.2 fois/an                               │
│  - Durée moyenne en stock : 87 jours                            │
│  - Taux de rupture : 2.3%                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Champs calculés nécessaires

### Sur stock.quant

| Champ | Calcul |
|-------|--------|
| x_quantity_cartons | quantity / product_id.x_conditionnement |
| x_value | quantity × product_id.standard_price |
| x_expiry_bracket | Calculé selon lot_id.expiration_date |

### Sur stock.lot

| Champ | Calcul |
|-------|--------|
| x_days_until_expiry | expiration_date - today |
| x_expiry_bracket | 1-3m, 4-6m, 7-12m, 13-24m, +24m |
| x_is_expired | expiration_date < today |

### Vue agrégée par tranche

```sql
SELECT 
    CASE 
        WHEN days_until_expiry <= 90 THEN '1-3 mois'
        WHEN days_until_expiry <= 180 THEN '4-6 mois'
        WHEN days_until_expiry <= 365 THEN '7-12 mois'
        WHEN days_until_expiry <= 730 THEN '13-24 mois'
        ELSE '+24 mois'
    END as tranche,
    SUM(quantity) as total_qty,
    SUM(quantity * standard_price) as total_value
FROM stock_quant sq
JOIN stock_lot sl ON sq.lot_id = sl.id
JOIN product_product pp ON sq.product_id = pp.id
WHERE sq.location_id IN (zones_internes)
GROUP BY tranche
```

## Alertes automatiques

### Configuration

| Alerte | Critère | Action |
|--------|---------|--------|
| DLC imminente | DLC ≤ 30 jours | Email responsable |
| Stock périmé | DLC < aujourd'hui | Notification + blocage |
| Rupture | Stock ≤ seuil min | Email acheteur |
| Surstock | Stock > 2× moyenne | Rapport hebdo |

### Implémentation

```python
# Action planifiée quotidienne
def check_expiry_alerts():
    today = date.today()
    alert_date = today + timedelta(days=30)
    
    # Lots bientôt périmés
    expiring = env['stock.lot'].search([
        ('expiration_date', '<=', alert_date),
        ('expiration_date', '>', today),
    ])
    
    for lot in expiring:
        # Envoyer alerte
        send_expiry_notification(lot)
```

## Actions à réaliser

- [ ] Créer les champs calculés
- [ ] Développer la vue par tranche de péremption
- [ ] Configurer les alertes automatiques
- [ ] Créer les dashboards
- [ ] Tester avec des données réelles
- [ ] Former les utilisateurs

## Accès

| Profil | Dashboards accessibles |
|--------|------------------------|
| Direction | Tous |
| Logistique | Tous stock |
| Responsable Achats | Flottant, alertes |
| Commercial | Stock disponible (lecture) |
