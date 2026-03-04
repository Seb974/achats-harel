# Configuration des Entrepôts

## Structure demandée

Le cahier des charges mentionne **plus de 6 lieux de stockage**.

## Entrepôt principal

```
Stock > Configuration > Entrepôts > Créer
```

| Champ | Valeur |
|-------|--------|
| Nom | Entrepôt AH CHOU |
| Code court | AHC |
| Adresse | 97451 SAINT PIERRE CEDEX |
| Société | AH CHOU SARL |

### Configuration des flux

| Flux | Configuration |
|------|---------------|
| Réceptions | 1 étape (recevoir directement) |
| Expéditions | 2 étapes (préparer + expédier) |
| Fabrication | Non applicable |

## Emplacements internes

### Arborescence

```
AHC (Entrepôt)
├── AHC/Input                    # Zone réception
├── AHC/Stock                    # Vue stock principal
│   ├── AHC/Stock/Zone-1         # Zone 1 (à nommer)
│   ├── AHC/Stock/Zone-2         # Zone 2 (à nommer)
│   ├── AHC/Stock/Zone-3         # Zone 3 (à nommer)
│   ├── AHC/Stock/Zone-4         # Zone 4 (à nommer)
│   ├── AHC/Stock/Zone-5         # Zone 5 (à nommer)
│   └── AHC/Stock/Zone-6         # Zone 6 (à nommer)
├── AHC/Output                   # Zone expédition
└── AHC/Transit                  # Stock flottant (optionnel)
```

### Création des emplacements

```
Stock > Configuration > Emplacements > Créer
```

| Nom | Type | Emplacement parent | Code barre |
|-----|------|-------------------|------------|
| Zone-1 | Emplacement interne | AHC/Stock | AHC-Z1 |
| Zone-2 | Emplacement interne | AHC/Stock | AHC-Z2 |
| Zone-3 | Emplacement interne | AHC/Stock | AHC-Z3 |
| Zone-4 | Emplacement interne | AHC/Stock | AHC-Z4 |
| Zone-5 | Emplacement interne | AHC/Stock | AHC-Z5 |
| Zone-6 | Emplacement interne | AHC/Stock | AHC-Z6 |
| Transit | Emplacement interne | AHC | AHC-TR |

## Emplacements virtuels

| Emplacement | Type | Usage |
|-------------|------|-------|
| Partners/Customers | Client | Destination ventes |
| Partners/Vendors | Fournisseur | Source achats |
| Virtual/Scrapped | Perte | Rebuts, périmés |
| Virtual/Inventory adjustment | Ajustement | Inventaires |

## Nommage des zones

**À confirmer avec le client :**

| Zone | Nom possible | Usage possible |
|------|--------------|----------------|
| Zone-1 | Chambre froide 1 | Surgelés |
| Zone-2 | Chambre froide 2 | Surgelés |
| Zone-3 | Frais | Produits frais |
| Zone-4 | Préparation | Zone picking |
| Zone-5 | Quarantaine | Produits en attente |
| Zone-6 | Réserve | Stock tampon |

## Stratégies de rangement

### Stratégie FIFO par lot

Pour respecter la rotation des stocks (premier arrivé, premier sorti) :

```
Stock > Configuration > Stratégies de rangement
```

| Règle | Catégorie | Stratégie |
|-------|-----------|-----------|
| Surgelés FIFO | Pêche | Emplacement avec date lot la plus ancienne |

### Stratégie par catégorie

| Catégorie produit | Emplacement cible |
|-------------------|-------------------|
| Pêche | Zone-1, Zone-2 |
| Condiments | Zone-3 |
| Snacking | Zone-4 |

## Règles de flux

### Réception

```
Fournisseurs → AHC/Input → AHC/Stock/[Zone]
```

### Préparation commande

```
AHC/Stock/[Zone] → AHC/Output
```

### Expédition

```
AHC/Output → Clients
```

## Inventaires

### Configuration

```
Stock > Opérations > Ajustements d'inventaire
```

| Type | Fréquence | Périmètre |
|------|-----------|-----------|
| Inventaire complet | Annuel | Tous les emplacements |
| Inventaire tournant | Mensuel | Par zone |
| Inventaire spot | À la demande | Produit spécifique |

## Actions à réaliser

- [ ] Confirmer les noms des 6 zones avec le client
- [ ] Créer l'entrepôt principal
- [ ] Créer tous les emplacements
- [ ] Configurer les stratégies de rangement
- [ ] Paramétrer les règles de flux
- [ ] Tester un flux complet (achat → stock → vente)

## Questions pour le client

1. Quels sont les noms/usages des 6 zones de stockage ?
2. Y a-t-il des règles d'affectation produit → zone ?
3. La zone Transit/Flottant est-elle nécessaire dans Odoo ?
4. Quelle est la politique d'inventaire (fréquence, méthode) ?
