# Structure des Données Clients

## Source des données

| Fichier | Feuille | Lignes |
|---------|---------|--------|
| Feuille de calcul sans titre (2).xlsx | trame client | ~500 (5 en exemple) |

## Colonnes source

### Identification

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Code interne | STELOT | ref |
| Nom Client | SOCIETE LOT | name |
| Raison sociale | SOCIETE LOT | - (ou name si différent) |

### Contact

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Téléphone | 0262 30 35 13 | phone |
| Fax | - | - (obsolète) |
| GSM | 0692 21 74 56 | mobile |
| E-Mail | direction@coccimarket.re | email |
| Site Web | magasin@coccimarket.re | website |

### Responsables

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Civilité 1 | M. | x_civilite_1 |
| Responsable 1 | Jean Paul LAI ONG TEUNG | x_responsable_1 |
| Civilité 2 | - | x_civilite_2 |
| Responsable 2 | - | x_responsable_2 |

### Classification (Hiérarchie)

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| N° Gr clients | 000 | x_groupe_client_code |
| Nom Gr. clients | GMS | x_groupe_client |
| N° Enseig. | 180 | x_enseigne_code |
| Nom Enseigne | COCCI MARKET | x_enseigne |
| N° Catégorie | 030 | category_id (via mapping) |
| Nom catégorie | MARCHE | category_id.name |

### Tarification

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Base tarif | 1.0 | property_product_pricelist |
| Code tarif | 00 | x_code_tarif |
| Tx remise | 0.0 | x_taux_remise |
| Tx RFA | 0.0 | x_taux_rfa |
| Prix Net | N | x_prix_net |

### Finances

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Plafond d'encours | 1000.0 | credit_limit |
| Code règlement | 02 | property_payment_term_id |
| Risque | Normal | x_risque |
| Blocage | Oui si dépassement | x_blocage |
| Groupe Fact. | PLUSIEURS BL UNE FACTURE | x_groupe_facturation |

### Comptabilité

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| N° Compta | 01STELOT | x_compte_comptable |
| N° compte vente | - | property_account_receivable_id |
| N° compte achat | - | property_account_payable_id |
| Siret | 440 728 509 | siret |
| Code APE | - | x_code_ape |

### Contact comptabilité

| Colonne | Exemple | Champ Odoo |
|---------|---------|------------|
| Resp. Cpta. | GABRIELLE CASTOR | x_resp_compta |
| Tél. Cpta. | 0262 30 35 13 | x_tel_compta |
| GSM Cpta. | 0693 62 48 75 | x_gsm_compta |
| Email Cpta. | admin@coccimarket.re | x_email_compta |

## Modèle Odoo cible

### res.partner (standard)

| Champ | Type | Usage |
|-------|------|-------|
| name | Char | Nom client |
| ref | Char | Code interne |
| phone | Char | Téléphone |
| mobile | Char | GSM |
| email | Char | Email |
| website | Char | Site web |
| siret | Char | SIRET |
| credit_limit | Float | Plafond encours |
| category_id | Many2many | Catégories |
| property_product_pricelist | Many2one | Liste de prix |
| property_payment_term_id | Many2one | Conditions paiement |
| property_account_receivable_id | Many2one | Compte client |

### Champs personnalisés à créer

| Champ | Type | Label |
|-------|------|-------|
| x_groupe_client | Selection | Groupe client |
| x_enseigne | Selection | Enseigne |
| x_typologie | Selection | Typologie |
| x_code_tarif | Char | Code tarif |
| x_taux_remise | Float | Taux remise % |
| x_taux_rfa | Float | Taux RFA % |
| x_prix_net | Boolean | Prix net |
| x_risque | Selection | Niveau de risque |
| x_blocage | Selection | Type blocage |
| x_groupe_facturation | Char | Groupe facturation |
| x_compte_comptable | Char | N° compte compta |
| x_commercial | Many2one | Commercial attitré |
| x_responsable_1 | Char | Responsable 1 |
| x_responsable_2 | Char | Responsable 2 |
| x_resp_compta | Char | Responsable comptabilité |
| x_tel_compta | Char | Tél. comptabilité |
| x_email_compta | Char | Email comptabilité |

## Valeurs de sélection

### x_groupe_client

| Code | Valeur |
|------|--------|
| gbh | GBH |
| smdis | SMDIS |
| cellule_u | CELLULE U |
| caille | CAILLE |
| distrimascareignes | DISTRIMASCAREIGNES |
| ibl | IBL |
| tk | TK |
| lot | LOT |
| gms | GMS |
| autres | Autres |

### x_enseigne

| Code | Valeur |
|------|--------|
| auchan | AUCHAN |
| carrefour | CARREFOUR |
| carrefour_market | CARREFOUR MARKET |
| carrefour_city | CARREFOUR CITY |
| promocash | PROMOCASH |
| u | U |
| leclerc | LECLERC |
| intermark | INTERMARK |
| run_market | RUN MARKET |
| cocci_market | COCCI MARKET |
| leader_price | LEADER PRICE |
| gel_oi | GEL OI |
| independant | INDEPENDANT |

### x_typologie

| Code | Valeur |
|------|--------|
| hyper | HYPER |
| super | SUPER |
| marche | MARCHE |
| express | EXPRESS |
| cash | CASH |
| autres | AUTRES |

### x_blocage

| Code | Valeur |
|------|--------|
| non | Non dans tous les cas |
| oui_depassement | Oui si dépassement |
| oui_toujours | Oui toujours |

## Mapping conditions de paiement

| Code source | Condition Odoo |
|-------------|----------------|
| 00 | Comptant |
| 02 | 30 jours |
| 03 | 60 jours |

## Actions à réaliser

- [ ] Créer les champs personnalisés dans Odoo
- [ ] Créer les valeurs de sélection
- [ ] Préparer le fichier de mapping
- [ ] Développer le script d'import
- [ ] Tester sur un échantillon
- [ ] Importer tous les clients

## Voir aussi

- 02_MAPPING/MAPPING_CLIENTS.xlsx
- 03_SCRIPTS_IMPORT/import_clients.py
