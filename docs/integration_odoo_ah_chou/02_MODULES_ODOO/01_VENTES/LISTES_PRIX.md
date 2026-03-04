# Gestion des Listes de Prix (Tarifs)

## Structure tarifaire

Le cahier des charges prévoit **6 niveaux de tarifs** (T1 à T6) plus des tarifs spécifiques.

### Hiérarchie d'attribution

```
CATÉGORIE (GMS, CHR...) → Tarif par défaut
    ↓ peut être surchargé par
GROUPE CLIENT (GBH, SMDIS...) → Tarif groupe
    ↓ peut être surchargé par
ENSEIGNE (Carrefour, U...) → Tarif enseigne
    ↓ peut être surchargé par
TYPOLOGIE (Hyper, Super...) → Tarif typologie
    ↓ peut être surchargé par
CLIENT → Tarif spécifique
```

## Configuration Odoo

### Activation listes de prix avancées

```
Ventes > Configuration > Paramètres
☑ Listes de prix
☑ Listes de prix avancées (règles basées sur des formules)
```

### Création des listes de prix

```
Ventes > Produits > Listes de prix
```

| Liste | Base | Marge/Remise | Usage |
|-------|------|--------------|-------|
| Tarif Base | Prix de vente | - | Prix catalogue |
| Tarif T1 | Tarif Base | -X% | Grands comptes |
| Tarif T2 | Tarif Base | -Y% | Moyens comptes |
| Tarif T3 | Tarif Base | -Z% | Petits comptes |
| Tarif T4 | Tarif Base | +W% | Détail |
| Tarif T5 | Tarif Base | Variable | CHR |
| Tarif T6 | Tarif Base | Variable | Autre |

### Structure d'une liste de prix

```yaml
Liste de prix: Tarif T1
├── Devise: EUR
├── Type de prix: Remise (% ou montant fixe)
├── Applicable à:
│   ├── Tous les produits
│   ├── Catégorie de produits
│   └── Produit spécifique
└── Règles:
    ├── Règle 1: Tous produits, -10%
    ├── Règle 2: Catégorie Pêche, -15%
    └── Règle 3: Produit X spécifique, prix fixe 5.00€
```

## Tarifs spécifiques (Client + Produit)

Le cahier des charges mentionne :
> "Tarif Spécifique (expl : Client AVEC Tarif de base mais pour un ou plusieurs produits Prix Spécial)"

### Solution Odoo

Utiliser les **règles de prix par produit** dans la liste de prix du client.

```
Ventes > Produits > Listes de prix > [Liste client]
Ajouter une règle:
├── Applicable à: Produit spécifique
├── Produit: [Sélectionner le produit]
├── Quantité min: 1
└── Prix: [Prix spécial]
```

### Exemple

Client "Carrefour St-Pierre" :
- Liste de prix : Tarif T2 (par défaut)
- Règle spéciale : Produit "Bichique standard" → Prix net 12.50€

## Attribution aux clients

### Méthode 1 : Attribution directe

```
Contacts > [Client] > Onglet Vente & Achat
Liste de prix: [Sélectionner]
```

### Méthode 2 : Attribution via règles (automatisation)

Créer une action automatique pour attribuer la liste de prix selon la catégorie :

```python
# Action serveur
if record.category_id.name == 'GMS':
    record.property_product_pricelist = env.ref('sale.pricelist_t1')
elif record.category_id.name == 'CHR':
    record.property_product_pricelist = env.ref('sale.pricelist_t5')
```

## Champs produits pour les tarifs

Les données Excel contiennent des colonnes T1 à T6 (HT et TTC).

| Colonne Excel | Champ Odoo | Méthode |
|---------------|------------|---------|
| PV HT | list_price | Prix de vente standard |
| T1 HT | Via règle liste T1 | Règle prix fixe |
| T2 HT | Via règle liste T2 | Règle prix fixe |
| ... | ... | ... |

### Import des tarifs

Option 1 : **Import via règles de prix**
- Créer une règle par produit dans chaque liste de prix
- Complexe mais flexible

Option 2 : **Champs personnalisés produit**
- Créer x_tarif_t1, x_tarif_t2... sur product.template
- Utiliser une formule dans les listes de prix

```yaml
Liste T1:
├── Applicable à: Tous les produits
└── Formule: [x_tarif_t1] (champ personnalisé)
```

## Actions à réaliser

- [ ] Activer les listes de prix avancées
- [ ] Créer les 6 listes de prix de base
- [ ] Définir les règles de remise par défaut
- [ ] Créer les champs personnalisés tarifs sur produits (si option 2)
- [ ] Documenter la procédure de création de tarif spécifique
- [ ] Former les utilisateurs à l'attribution des listes de prix

## Tests

- [ ] Créer un devis avec un client T1 → Vérifier les prix
- [ ] Créer un devis avec tarif spécifique → Vérifier le prix spécial
- [ ] Tester le changement de liste de prix sur une commande
