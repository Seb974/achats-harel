# Structure des Données Fournisseurs

## Source des données

| Fichier | Feuille | Lignes |
|---------|---------|--------|
| Feuille de calcul sans titre (2).xlsx | TRAME FRS | 999 |

## Colonnes source

### Identification

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Code fournisseur | ADI000 | ref |
| C. Interne | ADILAKSM | x_code_interne |
| Nom fournisseur | Adilakshmhmi Exports | name |
| Raison sociale | ADILAKSHMHMI EXPORTS | x_raison_sociale |

### Adresse

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Adresse | PLOT NR: APMC YARD... | street |
| Code postal | - | zip |
| Ville | - | city |
| France | 0.0 | country_id (si 1 = France) |

### Contact

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Responsable 1 | - | x_responsable_1 |
| Responsable 2 | - | x_responsable_2 |
| Téléphone | - | phone |
| N° Fax | - | - |
| E-Mail | - | email |
| Site Web | - | website |

### Classification

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Grp. Frs | ASIE-INDE | x_groupe_fournisseur |

### Comptabilité

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| N° Cpte. Cpta. | 40100000 | property_account_payable_id |
| C. Cpta. Aux. | 082ADILA | x_compte_auxiliaire |
| N° Cpte comptable achat | 60721000 | property_account_expense_categ_id |

### Logistique

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Transitaire | 0.0 | x_is_transitaire |
| Nb Jrs Dispo | 0.0 | x_delai_livraison |
| Condi. paiement | - | property_supplier_payment_term_id |
| Condi. livraison | - | x_incoterm |
| Condi. achats | - | x_conditions_achat |

### Lien client

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| N° Client | - | x_numero_client_chez_frs |

## Modèle Odoo cible

### res.partner (standard)

| Champ | Type | Usage |
|-------|------|-------|
| name | Char | Nom fournisseur |
| ref | Char | Code fournisseur |
| is_company | Boolean | True |
| supplier_rank | Integer | > 0 pour fournisseur |
| street | Char | Adresse |
| city | Char | Ville |
| zip | Char | Code postal |
| country_id | Many2one | Pays |
| phone | Char | Téléphone |
| email | Char | Email |
| property_account_payable_id | Many2one | Compte fournisseur |
| property_supplier_payment_term_id | Many2one | Conditions paiement |

### Champs personnalisés à créer

| Champ | Type | Label |
|-------|------|-------|
| x_code_interne | Char | Code interne |
| x_raison_sociale | Char | Raison sociale |
| x_groupe_fournisseur | Selection | Groupe fournisseur |
| x_compte_auxiliaire | Char | Compte auxiliaire |
| x_is_transitaire | Boolean | Est transitaire |
| x_delai_livraison | Integer | Délai livraison (jours) |
| x_incoterm | Char | Condition livraison |
| x_conditions_achat | Text | Conditions d'achat |
| x_numero_client_chez_frs | Char | N° client chez fournisseur |
| x_responsable_1 | Char | Responsable 1 |
| x_responsable_2 | Char | Responsable 2 |

## Valeurs de sélection

### x_groupe_fournisseur

D'après les données :

| Code | Valeur |
|------|--------|
| asie_inde | ASIE-INDE |
| europe | EUROPE |
| local | LOCAL |
| afrique | AFRIQUE |
| amerique | AMERIQUE |
| oceanie | OCEANIE |
| autres | AUTRES |

**Note** : "AISIE-INDE" dans les données semble être une faute de frappe.

## Pays

### Mapping pays

| Colonne France | Pays Odoo |
|----------------|-----------|
| 0.0 | International (à déterminer selon adresse) |
| 1.0 | France |

Pour les fournisseurs internationaux, le pays sera déduit de :
- L'adresse (si contient "INDIA" → Inde)
- Le groupe fournisseur (ASIE-INDE → Inde)

## Transitaires

Les fournisseurs avec `x_is_transitaire = True` sont des transitaires/transporteurs.

### Identification

```python
# Lors de l'import
if row['Transitaire'] == 1.0 or row['Transitaire'] == '1':
    partner.x_is_transitaire = True
```

### Usage

Sur les commandes d'achat, le champ `x_transitaire` référence un partenaire transitaire.

## Actions à réaliser

- [ ] Créer les champs personnalisés
- [ ] Créer les valeurs de sélection groupe fournisseur
- [ ] Normaliser les données (fautes de frappe)
- [ ] Préparer le mapping pays
- [ ] Développer le script d'import
- [ ] Importer les 999 fournisseurs

## Nettoyage des données

### Problèmes identifiés

| Problème | Solution |
|----------|----------|
| "AISIE-INDE" vs "ASIE-INDE" | Normaliser en "ASIE-INDE" |
| Adresses multilignes | Séparer en street/street2 |
| Pays manquant | Déduire du groupe ou adresse |

### Script de normalisation

```python
def normalize_groupe_fournisseur(value):
    if not value:
        return 'autres'
    value = value.upper().strip()
    if 'INDE' in value or 'ASIE' in value:
        return 'asie_inde'
    elif 'EUROPE' in value:
        return 'europe'
    elif 'LOCAL' in value:
        return 'local'
    else:
        return 'autres'
```

## Voir aussi

- 02_MAPPING/MAPPING_FOURNISSEURS.xlsx
- 03_SCRIPTS_IMPORT/import_fournisseurs.py
