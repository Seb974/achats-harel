# Module Ventes - Paramétrage

## Activation du module

```
Applications > Ventes > Installer
```

## Configuration générale

```
Ventes > Configuration > Paramètres
```

| Paramètre | Valeur | Justification |
|-----------|--------|---------------|
| Devis | ☐ Désactivé | Commande directe selon cahier des charges |
| Unités de mesure | ☑ Activé | Gestion cartons/UVC |
| Variantes produits | ☐ Désactivé | Non requis |
| Listes de prix | ☑ Activé | 6 tarifs + spécifiques |
| Remises | ☑ Activé | Remise % par ligne |
| Marges | ☑ Activé | Calcul marge pour dashboards |

## Workflow vente

```
Commande client → Bon de livraison → Facture
```

### Configuration workflow

```
Ventes > Configuration > Paramètres > Facturation
☑ Facturer les quantités livrées
```

### Politique de facturation

| Type | Valeur |
|------|--------|
| Facturation | Sur quantités livrées |
| Facture groupée | ☑ Oui (plusieurs BL = 1 facture) |

## Structure client

### Hiérarchie

```
GROUPE CLIENTS (champ personnalisé)
    └── CATÉGORIE (catégorie client Odoo)
        └── ENSEIGNE (champ personnalisé)
            └── TYPOLOGIE (champ personnalisé)
                └── CLIENT (res.partner)
```

### Champs personnalisés à créer sur res.partner

| Champ | Type | Valeurs |
|-------|------|---------|
| x_groupe_client | Selection | GBH, SMDIS, CELLULE U, CAILLE, DISTRIMASCAREIGNES, IBL, TK, LOT |
| x_enseigne | Selection | AUCHAN, CARREFOUR, CARREFOUR MARKET, PROMOCASH, U, LECLERC, etc. |
| x_typologie | Selection | HYPER, SUPER, MARCHE, EXPRESS, CASH, AUTRES |
| x_code_reglement | Char | Code règlement |
| x_plafond_encours | Float | Plafond d'encours |
| x_commercial | Many2one (res.users) | Commercial attitré |
| x_taux_remise | Float | Taux remise global % |
| x_taux_rfa | Float | Taux RFA % |

### Catégories client (standard Odoo)

```
Contacts > Configuration > Étiquettes partenaires
```

| Catégorie | Couleur |
|-----------|---------|
| GMS | Bleu |
| PLATE-FORME | Vert |
| GROSSISTE | Orange |
| CHR | Rouge |
| DIVERS | Gris |

## Commercial / Vendeur

### Attribution client

Chaque client est attribué à un commercial via le champ `x_commercial`.

### Configuration équipe de vente

```
Ventes > Configuration > Équipes de ventes
```

| Équipe | Membres |
|--------|---------|
| Équipe commerciale | Tous les commerciaux |

## Actions à réaliser

- [ ] Installer le module Ventes
- [ ] Configurer les paramètres généraux
- [ ] Créer les champs personnalisés sur res.partner
- [ ] Créer les catégories client
- [ ] Configurer les équipes de vente
- [ ] Tester le workflow commande → BL → facture

## Voir aussi

- LISTES_PRIX.md : Configuration des 6 tarifs
- PROMOS_3XNET.md : Gestion des promotions
- WORKFLOW.md : Détail du processus de vente
