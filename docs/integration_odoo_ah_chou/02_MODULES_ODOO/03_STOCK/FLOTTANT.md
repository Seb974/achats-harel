# Gestion du Stock Flottant

## Définition

Le **stock flottant** représente la marchandise en cours de transport (sur navire ou en transit) entre le fournisseur et l'entrepôt.

## Besoin cahier des charges

| Information | Description |
|-------------|-------------|
| Quantité flottante | Stock en transit (UVC et cartons) |
| Navire | Identifiant du transport |
| Date départ | Départ du port fournisseur |
| Date arrivée | Arrivée estimée au port |
| Dépotage | Date de réception effective |

## Solution retenue

Le stock flottant est géré principalement dans l'**App Achats Harel**.

### Pourquoi ?

1. L'App Achats gère déjà le workflow d'achat import
2. Les informations de transit (navire, dates) y sont saisies
3. Synchronisation avec Odoo au moment du dépotage

### Flux

```
┌─────────────────────────────────────────────────────────────────┐
│                    APP ACHATS HAREL                              │
│                                                                  │
│  Commande créée ──► En transit (flottant) ──► Dépoté            │
│       │                    │                      │              │
│       └────────────────────┼──────────────────────┘              │
│                            │                                     │
│       Infos stockées:      │                                     │
│       - Navire             │                                     │
│       - Date départ        │                                     │
│       - Date arrivée       │                                     │
│       - Statut transit     │                                     │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ Envoi vers Odoo (au dépotage)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ODOO                                     │
│                                                                  │
│  Commande confirmée ──► Réception créée ──► Stock mis à jour    │
│                                                                  │
│  Le stock apparaît dans Odoo seulement après dépotage           │
└─────────────────────────────────────────────────────────────────┘
```

## Option : Emplacement flottant dans Odoo

Si vous souhaitez voir le stock flottant directement dans Odoo :

### Création emplacement

```
Stock > Configuration > Emplacements > Créer
```

| Champ | Valeur |
|-------|--------|
| Nom | Transit/Flottant |
| Type | Emplacement interne |
| Emplacement parent | AHC |

### Flux avec emplacement flottant

```
Fournisseur ──► AHC/Transit/Flottant ──► AHC/Stock
                     │                        │
             (commande confirmée)      (après dépotage)
```

### Avantages

- Visibilité stock flottant dans Odoo
- Valorisation du stock en transit
- Reporting unifié

### Inconvénients

- Double saisie (App + Odoo)
- Complexité workflow
- Risque de désynchronisation

## Champs personnalisés (si option Odoo)

### Sur commande d'achat

| Champ | Type | Description |
|-------|------|-------------|
| x_navire | Char | Nom du navire/conteneur |
| x_date_depart | Date | Date départ port |
| x_date_arrivee_estimee | Date | Date arrivée estimée |
| x_date_depotage | Date | Date réception effective |
| x_statut_transit | Selection | En transit / Arrivé / Dépoté |

### Valeurs statut

| Statut | Description |
|--------|-------------|
| en_transit | Marchandise sur navire |
| arrive | Arrivé au port, pas encore dépoté |
| depote | Réceptionné et contrôlé |

## Rapport stock flottant

### Via App Achats

L'App Achats fournit une vue des achats en cours avec :
- Toutes les commandes en transit
- Dates prévues d'arrivée
- Quantités par produit

### Via Odoo (si emplacement flottant)

```
Stock > Rapports > Stock par emplacement
Filtrer: Emplacement = Transit/Flottant
```

## Conversion UVC / Cartons

Le cahier des charges demande l'affichage en :
- **UVC** (Unité de Vente Consommateur)
- **Cartons**

### Solution

Utiliser les UoM (Unités de Mesure) Odoo :

| UoM | Type | Ratio |
|-----|------|-------|
| UVC | Référence | 1 |
| Carton | Plus grande | Variable (ex: 1 carton = 20 UVC) |

Le rapport peut afficher les deux colonnes :
- Quantité en UVC
- Quantité en cartons (calculée)

## Recommandation

**Pour la phase initiale** : Garder le stock flottant dans l'App Achats uniquement.

**Évolution possible** : Si besoin de vision consolidée, implémenter l'emplacement flottant dans Odoo avec synchronisation automatique.

## Actions à réaliser

- [ ] Décider si emplacement flottant Odoo est nécessaire
- [ ] Si oui, créer l'emplacement et les champs
- [ ] Documenter le processus de dépotage
- [ ] Former l'équipe logistique

## Questions pour le client

1. Avez-vous besoin de voir le stock flottant dans Odoo ?
2. Ou la vue dans l'App Achats est-elle suffisante ?
3. Combien de temps dure généralement le transit ?
4. Qui est responsable du suivi du flottant ?
