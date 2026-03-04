# Import du Plan Comptable Cegid

## Source des données

| Fichier | Contenu |
|---------|---------|
| Plan Comptable.xlsx | 910 comptes Cegid Quadra |

## Structure source

```
Numéro | Intitulé | Type | Clé | Collectif | Tel1 | Fax | Ville
```

### Exemples

| Numéro | Intitulé | Type | Collectif |
|--------|----------|------|-----------|
| 01100000 | Clients comptant | C | 41100000 |
| 01200000 | Clients crédits | C | 41100000 |
| 40100000 | Fournisseurs | F | - |
| 60721000 | Achats marchandises | - | - |

## Mapping vers Odoo

### Modèle Odoo : account.account

| Champ source | Champ Odoo | Transformation |
|--------------|------------|----------------|
| Numéro | code | Direct |
| Intitulé | name | Direct |
| Type | account_type | Mapping (voir ci-dessous) |
| Collectif | reconcile | True si auxiliaire |

### Mapping des types

| Type Cegid | Type Odoo |
|------------|-----------|
| C (Client) | asset_receivable |
| F (Fournisseur) | liability_payable |
| 1xx | equity |
| 2xx | asset_non_current |
| 3xx | asset_current |
| 4xx (clients) | asset_receivable |
| 4xx (fournisseurs) | liability_payable |
| 4xx (autres) | liability_current |
| 5xx | asset_current (trésorerie) |
| 6xx | expense |
| 7xx | income |

### Comptes auxiliaires

Les comptes commençant par "01" ou "40" sont des **comptes auxiliaires** (clients/fournisseurs individuels).

**Dans Odoo** : Ces comptes ne sont pas des comptes comptables mais des partenaires avec un compte collectif.

| Compte Cegid | Traitement Odoo |
|--------------|-----------------|
| 01STELOT (Client) | Partenaire avec property_account_receivable_id = 41100000 |
| 082ADILA (Fournisseur) | Partenaire avec property_account_payable_id = 40100000 |

## Script d'import

### Fichier : import_plan_comptable.py

```python
#!/usr/bin/env python3
"""
Import du plan comptable Cegid vers Odoo
"""

import xmlrpc.client
from openpyxl import load_workbook

# Configuration Odoo
ODOO_URL = "https://ah-chou1.odoo.com"
ODOO_DB = "ah-chou1"
ODOO_USER = "mathieu.loic.hoarau@gmail.com"
ODOO_API_KEY = "VOTRE_CLE_API"

# Connexion
common = xmlrpc.client.ServerProxy(f"{ODOO_URL}/xmlrpc/2/common")
uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_API_KEY, {})
models = xmlrpc.client.ServerProxy(f"{ODOO_URL}/xmlrpc/2/object")

def get_account_type(code):
    """Détermine le type de compte selon le code"""
    if code.startswith('1'):
        return 'equity'
    elif code.startswith('2'):
        return 'asset_non_current'
    elif code.startswith('3'):
        return 'asset_current'
    elif code.startswith('41'):
        return 'asset_receivable'
    elif code.startswith('40'):
        return 'liability_payable'
    elif code.startswith('4'):
        return 'liability_current'
    elif code.startswith('5'):
        return 'asset_cash'
    elif code.startswith('6'):
        return 'expense'
    elif code.startswith('7'):
        return 'income'
    else:
        return 'off_balance'

def import_accounts(excel_file):
    """Import les comptes depuis le fichier Excel"""
    
    wb = load_workbook(excel_file, read_only=True)
    ws = wb.active
    
    rows = list(ws.iter_rows(values_only=True))
    headers = rows[5]  # La ligne d'en-tête est à la ligne 6
    
    imported = 0
    skipped = 0
    
    for row in rows[6:]:
        if not row[1]:  # Pas de numéro de compte
            continue
            
        code = str(row[1]).strip()
        name = str(row[2]).strip() if row[2] else code
        
        # Ignorer les comptes auxiliaires (commençant par 01 ou 08)
        if code.startswith('01') or code.startswith('08'):
            skipped += 1
            continue
        
        account_type = get_account_type(code)
        
        # Vérifier si le compte existe
        existing = models.execute_kw(
            ODOO_DB, uid, ODOO_API_KEY,
            'account.account', 'search',
            [[['code', '=', code]]]
        )
        
        if existing:
            print(f"Compte {code} existe déjà, ignoré")
            skipped += 1
            continue
        
        # Créer le compte
        account_data = {
            'code': code,
            'name': name,
            'account_type': account_type,
            'reconcile': code.startswith('4'),  # Lettrable si compte de tiers
        }
        
        try:
            account_id = models.execute_kw(
                ODOO_DB, uid, ODOO_API_KEY,
                'account.account', 'create',
                [account_data]
            )
            print(f"Créé: {code} - {name}")
            imported += 1
        except Exception as e:
            print(f"Erreur {code}: {e}")
    
    print(f"\nImport terminé: {imported} créés, {skipped} ignorés")

if __name__ == "__main__":
    import_accounts("/Users/mhoar/Desktop/GEL OI/Plan Comptable.xlsx")
```

## Procédure d'import

### Pré-requis

1. Installer la localisation française dans Odoo
2. Générer une clé API pour l'utilisateur
3. Installer Python et openpyxl

### Étapes

1. **Vérifier le fichier Excel**
   - Ouvrir et valider la structure
   - Identifier les lignes d'en-tête
   
2. **Adapter le script**
   - Renseigner la clé API
   - Ajuster les numéros de ligne si nécessaire
   
3. **Exécuter l'import**
   ```bash
   python3 import_plan_comptable.py
   ```

4. **Vérifier dans Odoo**
   ```
   Comptabilité > Configuration > Plan comptable
   ```

## Post-import

### Vérifications

- [ ] Tous les comptes de classe 1-7 sont importés
- [ ] Les types sont corrects
- [ ] Les comptes lettrables sont bien configurés

### Comptes à créer manuellement

Certains comptes système peuvent nécessiter une création manuelle :

| Compte | Intitulé | Usage |
|--------|----------|-------|
| 44571 | TVA collectée DOM | TVA ventes |
| 44566 | TVA déductible DOM | TVA achats |
| 512 | Banque | Compte bancaire |
| 531 | Caisse | Espèces |

### Association partenaires

Les comptes auxiliaires (01xxx, 08xxx) doivent être associés aux partenaires :

```python
# Pour chaque client
partner.property_account_receivable_id = compte_41100000
# Pour chaque fournisseur
partner.property_account_payable_id = compte_40100000
```

## Actions à réaliser

- [ ] Exporter et nettoyer le fichier Excel
- [ ] Adapter le script d'import
- [ ] Exécuter l'import sur un environnement de test
- [ ] Valider les comptes importés
- [ ] Créer les comptes manquants
- [ ] Associer les comptes aux partenaires

## Notes

- Le plan comptable Cegid est plus détaillé que nécessaire pour Odoo
- Certains comptes auxiliaires seront gérés via les partenaires
- Une révision du plan peut être envisagée pour simplifier
