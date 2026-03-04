# Module Achats - Paramétrage

## Activation du module

```
Applications > Achats > Installer
```

## Configuration générale

```
Achats > Configuration > Paramètres
```

| Paramètre | Valeur | Justification |
|-----------|--------|---------------|
| Approbation commandes | ☐ Désactivé | Workflow simple |
| Accords d'achat | ☐ Désactivé | Non requis |
| Variantes produits | ☐ Désactivé | Non requis |
| Unités de mesure | ☑ Activé | Cartons, UVC |
| Contrôle factures | ☑ Activé | Sur quantités reçues |

## Workflow achat simplifié

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   COMMANDE  │ ──► │  RÉCEPTION  │ ──► │   FACTURE   │
│   FOURNISS. │     │   (1 étape) │     │  FOURNISS.  │
└─────────────┘     └─────────────┘     └─────────────┘
     │                    │                   │
     ▼                    ▼                   ▼
  Brouillon            Reçu               Validée
  Confirmée            Fait               Payée
```

## Structure fournisseur

### Champs personnalisés sur res.partner (fournisseur)

| Champ | Type | Valeurs | Source Excel |
|-------|------|---------|--------------|
| x_code_fournisseur | Char | Code unique | Code fournisseur |
| x_groupe_fournisseur | Selection | ASIE-INDE, EUROPE, etc. | Grp. Frs |
| x_transitaire | Many2one (res.partner) | Lien transitaire | Transitaire |
| x_nb_jours_dispo | Integer | Délai approvisionnement | Nb Jrs Dispo |
| x_condition_paiement | Char | Conditions | Condi. paiement |
| x_condition_livraison | Char | Incoterm | Condi. livraison |
| x_condition_achat | Char | Conditions spéciales | Condi. achats |

### Groupes fournisseurs

D'après les données :
- ASIE-INDE
- AISIE-INDE (probable erreur saisie)
- EUROPE
- LOCAL
- etc.

À normaliser lors de l'import.

## Réception 1 étape

```
Stock > Configuration > Entrepôts > [Entrepôt principal]
Réceptions entrantes: Recevoir les marchandises directement (1 étape)
```

## Transitaires

### Configuration

Les transitaires sont des partenaires de type fournisseur avec un flag spécial :

```
Champ: is_company = True
Champ: supplier_rank > 0
Champ: x_is_transitaire = True (champ personnalisé)
```

### Usage sur commande

```
Achats > Commandes > [Commande]
Champ: x_transitaire (Many2one vers res.partner)
```

## Intégration Module Achats Harel

### Architecture

```
┌─────────────────────────────────────────┐
│           ODOO 19 ENTERPRISE            │
│  ┌─────────────────────────────────┐   │
│  │  Produits / Fournisseurs        │◄──┼─── Données maîtres
│  │  Commandes d'achat              │◄──┼─── Création commandes
│  └─────────────────────────────────┘   │
└────────────────▲────────────────────────┘
                 │ API XML-RPC
                 │
┌────────────────┴────────────────────────┐
│        MODULE ACHATS HAREL 4.0          │
│  ┌─────────────────────────────────┐   │
│  │  Récupère: produits, UoM, frs   │   │
│  │  Calcule: PR en EUR             │   │
│  │  Crée: commandes confirmées     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Flux de données

| Direction | Données | Fréquence |
|-----------|---------|-----------|
| Odoo → App | Produits (id, nom, UoM, prix) | À la demande |
| Odoo → App | Fournisseurs (id, nom) | À la demande |
| App → Odoo | Commande d'achat confirmée | Après validation utilisateur |

### API utilisée

Voir `INTEGRATION_APP_ACHATS.md` pour les détails techniques.

## Prix d'achat

### Champs produit

| Champ Odoo | Signification |
|------------|---------------|
| standard_price | Prix de revient (coût) |
| seller_ids | Prix fournisseurs |

### Configuration prix fournisseur

```
Achats > Produits > [Produit] > Onglet Achat
```

| Champ | Valeur |
|-------|--------|
| Fournisseur | [Sélectionner] |
| Prix | Prix unitaire négocié |
| Devise | EUR ou USD |
| Quantité min | 1 |
| Délai | Jours de livraison |

## Actions à réaliser

- [ ] Installer le module Achats
- [ ] Configurer les paramètres généraux
- [ ] Créer les champs personnalisés fournisseur
- [ ] Normaliser les groupes fournisseurs
- [ ] Configurer la réception 1 étape
- [ ] Documenter l'intégration avec App Achats

## Voir aussi

- INTEGRATION_APP_ACHATS.md : Détails API et flux
- WORKFLOW.md : Processus complet achat
