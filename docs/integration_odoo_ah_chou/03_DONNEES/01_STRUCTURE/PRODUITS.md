# Structure des Données Produits

## Source des données

| Fichier | Feuille | Lignes |
|---------|---------|--------|
| Feuille de calcul sans titre (2).xlsx | Trame articles | 377 |

## Colonnes principales

### Identification

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| C. Puit | AIL000 | default_code |
| N° Interne | 901007 | x_code_interne |
| Ean 13 | 3456470901007 | barcode |
| Désignation | Ail congelé Vietnam 100g | name |
| Nom long | Ail congelé Vietnam 100g PNE 100G | x_nom_long |

### Conditionnement

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Contenu | 1.0 | x_contenu |
| Condt. | 50.0 | x_conditionnement |
| PCB | - | x_pcb |
| Détail Cdt. | - | x_detail_conditionnement |

### Poids / Volume

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Poids brut | 0.1 | x_poids_brut |
| Poids net | 0.1 | weight |
| Unité poids | -1 | x_unite_poids |
| Volume | - | volume |
| Unité volume | -1 | x_unite_volume |

### Prix

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| PV HT | 0.69 | list_price |
| PV TTC | 0.70449 | x_pv_ttc |
| PR HT | 0.476186 | standard_price |
| PR TTC | 0.486186 | x_pr_ttc |
| PRMUP | 0.476186 | x_prmup |

### Tarifs échelonnés

| Colonne | Champ Odoo |
|---------|------------|
| T1 HT | x_tarif_t1_ht |
| T2 HT | x_tarif_t2_ht |
| T3 HT | x_tarif_t3_ht |
| T4 HT | x_tarif_t4_ht |
| T5 HT | x_tarif_t5_ht |
| T6 HT | x_tarif_t6_ht |
| T1 TTC | x_tarif_t1_ttc |
| ... | ... |

### Taxes

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Tx. TVA | 2.1 | taxes_id |
| Tx OM | 0.0 | x_taux_om |

### Coefficient approche

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Coef. App. | 1.353369 | x_coef_approche |

### Traçabilité

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Code ONU | FAO51 | x_code_onu |
| Nom ONU | OCEAN INDIEN OUEST | x_zone_peche |
| Détails NSA | STOLEPHORUS COMMERSONII | x_nom_scientifique |
| Origine | INDE | x_origine |

### Classification

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| C. Rayon | 000 | - |
| Rayon | RAYONS DIVERS | categ_id (niveau 1) |
| Gr. Art | 010 | - |
| Nom GR | CONDIMENTS | categ_id (niveau 2) |
| SGr Art | 00 | - |
| Nom SGR | LEGUME | categ_id (niveau 3) |
| Segments | 01 | - |
| Nom Seg. | ENTIER | x_segment |

### Marque et stockage

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Ab. marque | ZZ | x_code_marque |
| Marque | Diverses marques | x_marque |
| N° Stockage | - | x_emplacement_stockage |

## Modèle Odoo cible

### product.template (standard)

| Champ | Type | Usage |
|-------|------|-------|
| name | Char | Désignation |
| default_code | Char | Référence (C. Puit) |
| barcode | Char | EAN13 |
| list_price | Float | Prix de vente HT |
| standard_price | Float | Prix de revient |
| weight | Float | Poids net kg |
| volume | Float | Volume |
| categ_id | Many2one | Catégorie |
| taxes_id | Many2many | Taxes vente |
| supplier_taxes_id | Many2many | Taxes achat |
| tracking | Selection | Par lot |

### Champs personnalisés à créer

| Champ | Type | Label |
|-------|------|-------|
| x_code_interne | Char | N° Interne |
| x_nom_long | Char | Nom long |
| x_contenu | Float | Contenu |
| x_conditionnement | Float | Conditionnement |
| x_pcb | Float | PCB |
| x_poids_brut | Float | Poids brut |
| x_coef_approche | Float | Coefficient approche |
| x_zone_peche | Char | Zone de pêche |
| x_nom_scientifique | Char | Nom scientifique |
| x_origine | Char | Origine |
| x_marque | Char | Marque |
| x_segment | Char | Segment |
| x_taux_om | Float | Taux Octroi de Mer |
| x_tarif_t1_ht | Float | Tarif T1 HT |
| x_tarif_t2_ht | Float | Tarif T2 HT |
| x_tarif_t3_ht | Float | Tarif T3 HT |
| x_tarif_t4_ht | Float | Tarif T4 HT |
| x_tarif_t5_ht | Float | Tarif T5 HT |
| x_tarif_t6_ht | Float | Tarif T6 HT |
| x_pv_ttc | Float | Prix vente TTC |
| x_pr_ttc | Float | Prix revient TTC |
| x_prmup | Float | PRMP |

## Catégories produits

### Structure hiérarchique

```
Tous les produits
├── Pêche (PE)
│   ├── Crustacé (CRUS)
│   ├── Poisson (POIS)
│   └── Mollusque (MOLL)
├── Condiment (CO)
│   └── Légume (LEGU)
├── Snacking Vapeur (SV)
│   └── Nature (NATU)
└── Snacking Friture (SF)
    ├── Friture (FRIT)
    └── Séché (SECH)
```

### Création dans Odoo

```
Stock > Configuration > Catégories de produits
```

Créer la hiérarchie Rayon > Groupe > Sous-groupe.

## Unités de mesure

### UoM par produit

| Type | UoM référence | UoM secondaire |
|------|---------------|----------------|
| Unité | UVC | Carton (ratio variable) |
| Poids | kg | g |

### Configuration

Chaque produit peut avoir plusieurs UoM via `uom_ids` (Odoo 19).

## Actions à réaliser

- [ ] Créer les champs personnalisés
- [ ] Créer la hiérarchie de catégories
- [ ] Créer les unités de mesure
- [ ] Préparer le mapping
- [ ] Développer le script d'import
- [ ] Importer les 377 produits

## Voir aussi

- 02_MAPPING/MAPPING_PRODUITS.xlsx
- 03_SCRIPTS_IMPORT/import_produits.py
