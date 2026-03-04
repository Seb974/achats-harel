# Module Comptabilité - Paramétrage

## Activation du module

```
Applications > Comptabilité > Installer
```

## Configuration initiale

### Assistant de configuration

```
Comptabilité > Configuration > Paramètres
```

| Paramètre | Valeur |
|-----------|--------|
| Localisation fiscale | France |
| Exercice fiscal | 01/01 - 31/12 |
| Devise | EUR |
| Plan comptable | PCG France (personnalisé) |

### Paramètres comptables

| Paramètre | Valeur | Justification |
|-----------|--------|---------------|
| Factures clients | ☑ | Facturation ventes |
| Factures fournisseurs | ☑ | Achats |
| Paiements | ☑ | Suivi encaissements |
| Rapprochement bancaire | ☑ | Contrôle |
| Budget | ☐ | Non requis initialement |
| Analytique | ☐ | À évaluer |

## Journaux comptables

### Journaux standards

```
Comptabilité > Configuration > Journaux
```

| Code | Nom | Type |
|------|-----|------|
| VTE | Ventes | Ventes |
| ACH | Achats | Achats |
| BNK | Banque principale | Banque |
| CAIS | Caisse | Espèces |
| OD | Opérations diverses | Divers |

### Journaux spécifiques

| Code | Nom | Type | Usage |
|------|-----|------|-------|
| POS | Point de vente | Ventes | Caisse enregistreuse |
| AVO | Avoirs | Ventes | Notes de crédit |

## Taxes

### Configuration TVA DOM

```
Comptabilité > Configuration > Taxes
```

| Nom | Portée | Taux | Compte |
|-----|--------|------|--------|
| TVA 2.1% (Ventes) | Ventes | 2.1% | 44571 |
| TVA 2.1% (Achats) | Achats | 2.1% | 44566 |
| TVA 8.5% (Ventes) | Ventes | 8.5% | 44571 |
| TVA 8.5% (Achats) | Achats | 8.5% | 44566 |
| Exonéré (Ventes) | Ventes | 0% | - |
| Exonéré (Achats) | Achats | 0% | - |

### Taxes par défaut

| Type | Taxe par défaut |
|------|-----------------|
| Produits alimentaires | TVA 2.1% |
| Services | TVA 8.5% |
| Export | Exonéré |

## Modes de paiement

### Configuration

```
Comptabilité > Configuration > Modes de paiement
```

| Mode | Type | Journal |
|------|------|---------|
| Virement | Électronique | BNK |
| Chèque | Manuel | BNK |
| Espèces | Manuel | CAIS |
| CB | Électronique | BNK |

## Conditions de paiement

### Standards

```
Comptabilité > Configuration > Conditions de paiement
```

| Nom | Échéance |
|-----|----------|
| Comptant | Immédiat |
| 30 jours | 30 jours fin de mois |
| 60 jours | 60 jours fin de mois |
| 30/60/90 | 3 échéances |

## Facturation

### Paramètres facture

```
Comptabilité > Configuration > Paramètres > Facturation
```

| Paramètre | Valeur |
|-----------|--------|
| Séquence factures | FACT-YYYY-NNNN |
| Factures pro forma | ☐ |
| Acomptes | ☐ |

### Facturation groupée

Comme demandé (plusieurs BL = 1 facture) :

```
Ventes > Facturation > À facturer
Sélectionner plusieurs BL du même client
Action > Créer les factures
☑ Regrouper par client
```

## Relances clients

### Configuration

```
Comptabilité > Configuration > Niveaux de relance
```

| Niveau | Jours après échéance | Action |
|--------|---------------------|--------|
| 1 | 7 | Email de rappel |
| 2 | 15 | Email + Appel |
| 3 | 30 | Courrier recommandé |
| 4 | 60 | Mise en contentieux |

## Rapports comptables

### Rapports standards

| Rapport | Usage |
|---------|-------|
| Grand livre | Détail des écritures |
| Balance | Soldes par compte |
| Compte de résultat | P&L |
| Bilan | Situation patrimoniale |
| TVA | Déclaration TVA |

### Personnalisations

Rapports spécifiques à créer :
- CA par groupe client
- Marge par catégorie
- Encours clients

## Actions à réaliser

- [ ] Installer le module Comptabilité
- [ ] Configurer l'exercice fiscal
- [ ] Créer/vérifier les journaux
- [ ] Créer les taxes DOM
- [ ] Configurer les modes de paiement
- [ ] Paramétrer la facturation groupée
- [ ] Importer le plan comptable Cegid

## Voir aussi

- PLAN_COMPTABLE.md : Import des 910 comptes
