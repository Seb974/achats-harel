# Traçabilité - Lots et Dates d'Expiration

## Vue d'ensemble

Le cahier des charges exige :
- Traçabilité par **numéro de lot**
- Gestion des **DLC** (Date Limite de Consommation)
- Suivi par **tranches de péremption** : 1-3 mois, 4-6 mois, ... +24 mois
- **Zone de pêche** et **nom scientifique** pour les produits de la mer

## Activation

```
Stock > Configuration > Paramètres
☑ Numéros de série / lots
☑ Dates d'expiration
```

## Configuration produit

### Par produit

```
Stock > Produits > [Produit] > Onglet Stock
```

| Champ | Valeur |
|-------|--------|
| Suivi | Par numéros de lot |
| Dates d'expiration | ☑ |

### Délais d'expiration par défaut

```
Champ: Temps avant expiration (jours)
```

| Produit type | DLC par défaut |
|--------------|----------------|
| Surgelés | 365-730 jours |
| Frais | 7-30 jours |

## Dates d'expiration

### Types de dates

| Date | Champ | Description | Utilisation |
|------|-------|-------------|-------------|
| **DLC** | expiration_date | Date limite de consommation | Blocage vente après |
| **DLUO** | use_date | Date de durabilité minimale | Indicatif, pas de blocage |
| **Alerte** | alert_date | Date d'alerte | Notification préventive |
| **Enlèvement** | removal_date | Date de retrait | Préparation picking |

### Calcul automatique

Lors de la création d'un lot, les dates sont calculées :

```
DLC = Date production + Temps avant expiration
Alerte = DLC - Jours alerte
Enlèvement = DLC - Jours enlèvement
```

## Lots

### Structure d'un lot

| Champ | Description | Exemple |
|-------|-------------|---------|
| Numéro de lot | Identifiant unique | LOT2026-001 |
| Produit | Produit concerné | Bichique 225g |
| Date de production | Date de création | 01/02/2026 |
| Date d'expiration | DLC | 01/02/2027 |
| Quantité | Stock dans ce lot | 500 |

### Création de lot

**À la réception :**

```
Stock > Opérations > Réceptions > [Réception]
Pour chaque ligne:
├── Quantité à recevoir: 100
├── Lot: [Créer] ou [Sélectionner]
│   ├── Numéro: LOT2026-001
│   └── Date expiration: 01/02/2027
└── Valider
```

## Tranches de péremption (Dashboard)

Le cahier des charges demande une vue stock par tranche :
- 1 à 3 mois
- 4 à 6 mois
- 7 à 12 mois
- 13 à 24 mois
- +24 mois

### Solution : Rapport personnalisé

Créer un rapport basé sur `stock.lot` avec calcul :

```python
# Pseudo-code pour le calcul des tranches
from datetime import date, timedelta

def get_expiry_bracket(expiration_date):
    today = date.today()
    days_until_expiry = (expiration_date - today).days
    months = days_until_expiry / 30
    
    if months <= 3:
        return "1-3 mois"
    elif months <= 6:
        return "4-6 mois"
    elif months <= 12:
        return "7-12 mois"
    elif months <= 24:
        return "13-24 mois"
    else:
        return "+24 mois"
```

### Alternative : Champ calculé sur lot

```
Modèle: stock.lot
Champ: x_expiry_bracket (Selection)
Calcul: Automatique basé sur expiration_date
```

## Alerte produits périmés

### Configuration

```
Stock > Configuration > Paramètres > Traçabilité
Jours avant alerte: 30
```

### Action automatique

Créer une action planifiée :

```python
# Cron quotidien
def check_expiring_lots():
    today = date.today()
    alert_date = today + timedelta(days=30)
    
    expiring_lots = env['stock.lot'].search([
        ('expiration_date', '<=', alert_date),
        ('expiration_date', '>', today),
    ])
    
    # Envoyer notification
    for lot in expiring_lots:
        send_expiry_alert(lot)
```

## Traçabilité produits de la mer

### Champs réglementaires

Pour les produits de pêche, informations obligatoires :

| Champ | Champ Odoo | Source |
|-------|------------|--------|
| Zone de pêche FAO | x_zone_peche | Colonne "Zone de Pêche" |
| Nom scientifique | x_nom_scientifique | Colonne "Nom Scientifique" |
| Origine | x_origine | Colonne "Origine" |

### Champs personnalisés produit

```
Stock > Configuration > Attributs produit
```

| Champ | Type | Exemple |
|-------|------|---------|
| x_zone_peche | Char | FAO51 - OCEAN INDIEN OUEST |
| x_nom_scientifique | Char | STOLEPHORUS COMMERSONII |
| x_origine | Char | INDE |

### Affichage sur documents

Ces informations doivent apparaître sur :
- Bon de livraison
- Facture
- Étiquette produit

## Actions à réaliser

- [ ] Activer la traçabilité par lots
- [ ] Activer les dates d'expiration
- [ ] Configurer les délais par défaut par catégorie
- [ ] Créer les champs zone pêche / nom scientifique
- [ ] Créer le rapport par tranche de péremption
- [ ] Configurer les alertes expiration
- [ ] Personnaliser les documents (BL, facture)

## Tests

- [ ] Créer un lot avec DLC
- [ ] Vérifier l'alerte à l'approche de la DLC
- [ ] Bloquer une vente sur lot périmé
- [ ] Générer le rapport par tranche
- [ ] Vérifier les infos traçabilité sur BL
