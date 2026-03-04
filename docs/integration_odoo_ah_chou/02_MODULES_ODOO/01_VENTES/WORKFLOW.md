# Workflow Ventes

## Flux principal

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  COMMANDE   │ ──► │ PRÉPARATION │ ──► │ EXPÉDITION  │ ──► │  FACTURE    │
│   CLIENT    │     │    (BL)     │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     │                    │                   │                   │
     ▼                    ▼                   ▼                   ▼
   Brouillon          À traiter          Livré              Validée
   Confirmée          Prêt               Fait               Payée
```

## Configuration livraison 2 étapes

```
Stock > Configuration > Entrepôts > [Entrepôt principal]
Expéditions sortantes: Envoyer les marchandises en zone de sortie puis livrer (2 étapes)
```

### Emplacements créés automatiquement

| Emplacement | Usage |
|-------------|-------|
| WH/Stock | Stock principal |
| WH/Output | Zone d'expédition (préparation) |
| Clients | Destination finale |

### Opérations

| Opération | De | Vers | Document |
|-----------|----|----|----------|
| Pick (Préparation) | WH/Stock | WH/Output | Bon de préparation |
| Ship (Expédition) | WH/Output | Clients | Bon de livraison |

## Processus détaillé

### 1. Création commande client

**Acteur** : Commercial

```
Ventes > Commandes > Créer
```

| Champ | Action |
|-------|--------|
| Client | Sélectionner (charge liste de prix automatiquement) |
| Date commande | Auto (aujourd'hui) |
| Date livraison | Saisir ou calculer |
| Lignes | Ajouter produits |

**Validation** : Bouton "Confirmer"

### 2. Préparation (Pick)

**Acteur** : Préparateur logistique

```
Stock > Opérations > Transferts > [Bon de préparation]
```

| Action | Détail |
|--------|--------|
| Réserver | Réserver les quantités en stock |
| Préparer | Scanner/cocher les produits préparés |
| Valider | Confirme la préparation |

**Gestion des lots** :
- Sélectionner le lot à expédier
- Vérifier la DLC (alerte si proche)

### 3. Expédition (Ship)

**Acteur** : Logistique / Chauffeur

```
Stock > Opérations > Transferts > [Bon de livraison]
```

| Action | Détail |
|--------|--------|
| Charger | Charger le camion |
| Valider | Confirme la livraison effectuée |

**Documents** :
- Impression BL pour signature client
- Retour BL signé

### 4. Facturation

**Acteur** : Comptable

```
Ventes > Facturation > Factures à créer
```

**Facturation groupée** :
1. Sélectionner tous les BL d'un client
2. Action > Créer les factures
3. Sélectionner "Regrouper les BL"

| Option | Valeur |
|--------|--------|
| Regroupement | Par client |
| Période | À définir (hebdo, mensuel...) |

## États des documents

### Commande client

| État | Signification |
|------|---------------|
| Devis | Brouillon (non utilisé ici) |
| Commande | Confirmée, en attente livraison |
| Verrouillée | Terminée et facturée |
| Annulée | Annulée |

### Bon de livraison

| État | Signification |
|------|---------------|
| Brouillon | Créé, pas encore planifié |
| En attente | Attente de stock |
| Prêt | Stock réservé, à préparer |
| Fait | Livré |
| Annulé | Annulé |

### Facture

| État | Signification |
|------|---------------|
| Brouillon | Non validée |
| Comptabilisée | Validée, en attente paiement |
| Payée | Paiement reçu |
| Annulée | Avoir ou annulation |

## Gestion encours client

### Configuration

```
Contacts > [Client]
x_plafond_encours: 10000
x_blocage: Oui si dépassement
```

### Automatisation

Créer une contrainte ou alerte :

```python
@api.constrains('partner_id')
def _check_credit_limit(self):
    if self.partner_id.x_plafond_encours > 0:
        encours = self.partner_id.total_due
        if encours > self.partner_id.x_plafond_encours:
            if self.partner_id.x_blocage == 'oui':
                raise ValidationError("Client bloqué - Plafond d'encours dépassé")
```

## Documents imprimés

| Document | Modèle | Usage |
|----------|--------|-------|
| Bon de commande | report_saleorder | Confirmation au client |
| Bon de préparation | report_picking | Liste pour préparateur |
| Bon de livraison | report_delivery | Signature client |
| Facture | report_invoice | Facturation |

## Actions à réaliser

- [ ] Configurer l'entrepôt en 2 étapes
- [ ] Personnaliser les rapports (BL, facture)
- [ ] Configurer la gestion d'encours
- [ ] Former les préparateurs au processus
- [ ] Former les commerciaux à la saisie commande
- [ ] Tester le flux complet

## Tests

- [ ] Créer une commande → Valider
- [ ] Préparer le bon de préparation
- [ ] Expédier le bon de livraison
- [ ] Facturer (groupé et unitaire)
- [ ] Tester le blocage encours
