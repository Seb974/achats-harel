# Module Stock - Paramétrage

## Activation du module

```
Applications > Stock > Installer
```

## Configuration générale

```
Stock > Configuration > Paramètres
```

| Paramètre | Valeur | Justification |
|-----------|--------|---------------|
| Multi-entrepôts | ☑ Activé | 6 emplacements |
| Emplacements de stockage | ☑ Activé | Gestion zones |
| Packages | ☐ Désactivé | Non requis |
| Numéros de série / lots | ☑ Activé | Traçabilité |
| Dates d'expiration | ☑ Activé | DLC/DLUO |
| Consignation | ☐ Désactivé | Non requis |

## Méthode de valorisation

### Configuration

```
Stock > Configuration > Catégories de produits
```

| Champ | Valeur |
|-------|--------|
| Méthode de coût | Prix moyen (PRMP) |
| Valorisation | Automatique |

### Impact

- Chaque entrée de stock recalcule le prix moyen
- Le champ `standard_price` du produit est mis à jour automatiquement
- Permet de suivre le PRMP comme demandé dans le cahier des charges

## Traçabilité

### Configuration par produit

```
Stock > Produits > [Produit] > Onglet Stock
```

| Champ | Valeur |
|-------|--------|
| Suivi | Par numéro de lot |
| Dates d'expiration | ☑ Activé |

### Types de dates

| Date | Description | Usage |
|------|-------------|-------|
| Date limite de consommation (DLC) | Ne pas vendre après | Blocage automatique |
| Date de durabilité minimale (DLUO) | Qualité optimale | Alerte |
| Date d'enlèvement | Retirer du stock | Préparation |
| Date d'alerte | Déclenche alerte | Prévention |

### Configuration par défaut

```
Stock > Configuration > Paramètres > Traçabilité
☑ Dates d'expiration
Nombre de jours avant alerte: 30
```

## Entrepôts

### Structure demandée : 6 emplacements

```
Entrepôt principal (WH)
├── Stock/Zone 1
├── Stock/Zone 2
├── Stock/Zone 3
├── Stock/Zone 4
├── Stock/Zone 5
└── Stock/Zone 6
```

### Configuration

```
Stock > Configuration > Entrepôts > [Créer ou modifier]
```

| Champ | Valeur |
|-------|--------|
| Nom | Entrepôt AH CHOU |
| Code court | WH |
| Adresse | [Adresse entrepôt] |
| Réceptions | 1 étape (direct) |
| Expéditions | 2 étapes (prép + expé) |

### Création des emplacements

```
Stock > Configuration > Emplacements
```

| Emplacement | Type | Parent |
|-------------|------|--------|
| WH/Stock | Vue | WH |
| WH/Stock/Zone 1 | Interne | WH/Stock |
| WH/Stock/Zone 2 | Interne | WH/Stock |
| WH/Stock/Zone 3 | Interne | WH/Stock |
| WH/Stock/Zone 4 | Interne | WH/Stock |
| WH/Stock/Zone 5 | Interne | WH/Stock |
| WH/Stock/Zone 6 | Interne | WH/Stock |
| WH/Output | Interne | WH |
| WH/Input | Interne | WH |

Les noms exacts des zones sont **à confirmer avec le client**.

## Règles de réapprovisionnement

### Configuration (si activé)

```
Stock > Configuration > Règles de réapprovisionnement
```

| Champ | Description |
|-------|-------------|
| Produit | Produit concerné |
| Quantité min | Seuil de déclenchement |
| Quantité max | Quantité à commander |
| Délai | Jours avant livraison |

**Note** : Le réapprovisionnement est manuel selon les réponses au questionnaire.

## Unités de mesure

### Catégories UoM

```
Stock > Configuration > Unités de mesure > Catégories
```

| Catégorie | Unités |
|-----------|--------|
| Unité | Unité, Carton, Palette |
| Poids | kg, g |
| Volume | L, mL |

### Unités personnalisées

| Nom | Catégorie | Type | Ratio |
|-----|-----------|------|-------|
| Unité (UVC) | Unité | Référence | 1 |
| Carton | Unité | Plus grande | Variable selon produit |
| Palette | Unité | Plus grande | Variable selon produit |
| kg | Poids | Référence | 1 |
| g | Poids | Plus petite | 0.001 |

## Actions à réaliser

- [ ] Installer le module Stock
- [ ] Configurer les paramètres généraux
- [ ] Créer l'entrepôt principal
- [ ] Créer les 6 emplacements (noms à confirmer)
- [ ] Configurer la valorisation PRMP
- [ ] Activer la traçabilité par lots
- [ ] Configurer les dates d'expiration
- [ ] Créer les unités de mesure personnalisées

## Voir aussi

- ENTREPOTS.md : Détail des emplacements
- TRACABILITE.md : Gestion lots et DLC
- FLOTTANT.md : Stock en transit
