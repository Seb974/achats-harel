# Module Point de Vente (POS) - Paramétrage

## Activation du module

```
Applications > Point de vente > Installer
```

## Configuration générale

```
Point de vente > Configuration > Point de vente > Créer
```

| Paramètre | Valeur |
|-----------|--------|
| Nom | Caisse AH CHOU |
| Société | AH CHOU SARL |
| Entrepôt | Entrepôt AH CHOU |

## Paramètres de session

### Facturation

| Paramètre | Valeur | Justification |
|-----------|--------|---------------|
| Factures | ☑ Activé | Permettre facturation client |
| Facture automatique | ☐ | Facturer si demandé seulement |

### Stock

| Paramètre | Valeur |
|-----------|--------|
| Gestion des stocks | ☑ Temps réel |
| Emplacement de stock | AHC/Stock |

### Paiements

| Mode | Activé |
|------|--------|
| Espèces | ☑ |
| Carte bancaire | ☑ |
| Chèque | ☑ |

## Matériel

### Imprimante tickets

| Paramètre | Valeur |
|-----------|--------|
| Type | Imprimante réseau ou USB |
| Format | 80mm |

### Scanner code-barres

| Paramètre | Valeur |
|-----------|--------|
| Type | USB HID |
| Préfixe | EAN13 |

## Produits POS

### Configuration produits

```
Point de vente > Produits > [Produit]
☑ Disponible en point de vente
Catégorie POS: [Sélectionner]
```

### Catégories POS

```
Point de vente > Configuration > Catégories de produits
```

| Catégorie | Couleur |
|-----------|---------|
| Pêche | Bleu |
| Condiments | Vert |
| Snacking | Orange |
| Divers | Gris |

## Clients POS

### Client par défaut

Pour les ventes comptoir sans client identifié :

| Paramètre | Valeur |
|-----------|--------|
| Client par défaut | Comptoir (créer un client générique) |

### Clients avec compte

Les clients avec compte peuvent être sélectionnés pour :
- Facturation
- Conditions de paiement spécifiques
- Tarifs personnalisés

## Caisse et sessions

### Ouverture de session

1. **Vérification solde d'ouverture**
   - Saisir le fond de caisse
   
2. **Pendant la session**
   - Ventes normales
   - Remboursements si nécessaire
   
3. **Clôture**
   - Comptage espèces
   - Validation écarts éventuels

### Rapports de session

| Rapport | Contenu |
|---------|---------|
| X | Rapport en cours de journée |
| Z | Clôture journalière |

## Intégration comptable

### Journal POS

```
Comptabilité > Configuration > Journaux
```

| Code | Nom | Type | Compte |
|------|-----|------|--------|
| POS | Point de vente | Ventes | 707 |

### Écritures automatiques

Chaque clôture de session génère :
- Écriture de vente (recettes)
- Écriture de TVA
- Mouvement de trésorerie

## Actions à réaliser

- [ ] Installer le module Point de vente
- [ ] Créer la configuration POS
- [ ] Configurer les modes de paiement
- [ ] Créer les catégories POS
- [ ] Activer les produits pour le POS
- [ ] Configurer le matériel
- [ ] Former les caissiers
- [ ] Tester une session complète

## Tests

- [ ] Ouvrir une session avec fond de caisse
- [ ] Effectuer une vente comptant
- [ ] Effectuer une vente avec facture
- [ ] Scanner un produit
- [ ] Clôturer la session
- [ ] Vérifier les écritures comptables
