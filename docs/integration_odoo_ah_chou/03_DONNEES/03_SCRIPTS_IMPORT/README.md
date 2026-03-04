# Scripts d'Import - AH CHOU vers Odoo

## Prérequis

### Python
```bash
python3 --version  # Python 3.8+
```

### Dépendances
```bash
pip install openpyxl
```

### Configuration

1. **Générer une clé API dans Odoo:**
   - Aller dans Paramètres > Utilisateurs
   - Sélectionner l'utilisateur
   - Onglet "Clés API" > Nouvelle clé
   - Copier la clé générée

2. **Modifier config.py:**
   ```python
   ODOO_CONFIG = {
       'url': 'https://ah-chou1.odoo.com',
       'database': 'ah-chou1',
       'username': 'mathieu.loic.hoarau@gmail.com',
       'api_key': 'VOTRE_CLE_API_ICI',
   }
   ```

3. **Mode Dry-Run (recommandé pour les tests):**
   ```python
   DRY_RUN = True   # Pas d'écriture réelle
   DRY_RUN = False  # Import réel
   ```

## Structure des fichiers

```
03_SCRIPTS_IMPORT/
├── config.py              # Configuration globale
├── odoo_client.py         # Client XML-RPC Odoo
├── import_clients.py      # Import des clients
├── import_produits.py     # Import des produits
├── import_fournisseurs.py # Import des fournisseurs
├── import_plan_comptable.py # Import plan comptable
├── run_all_imports.py     # Script principal (menu)
└── README.md              # Ce fichier
```

## Utilisation

### Option 1: Menu interactif
```bash
cd 03_SCRIPTS_IMPORT
python3 run_all_imports.py
```

### Option 2: Import individuel
```bash
python3 import_clients.py
python3 import_produits.py
python3 import_fournisseurs.py
python3 import_plan_comptable.py
```

### Option 3: Test connexion
```bash
python3 odoo_client.py
```

## Ordre recommandé des imports

1. **Plan comptable** - Pour avoir les comptes 
2. **Clients** - Utilise les catégories créées automatiquement
3. **Fournisseurs**
4. **Produits** - Utilise les catégories créées automatiquement

## Avant de lancer les imports

### Prérequis Odoo

Avant l'import réel, ces éléments doivent être créés dans Odoo :

#### Champs personnalisés clients (res.partner)
- x_groupe_client (Selection)
- x_enseigne (Selection)
- x_taux_remise (Float)
- x_taux_rfa (Float)
- x_blocage (Selection)
- x_compte_comptable (Char)
- x_responsable_1 (Char)
- x_responsable_2 (Char)
- x_resp_compta (Char)
- x_tel_compta (Char)
- x_email_compta (Char)
- x_groupe_facturation (Char)

#### Champs personnalisés produits (product.template)
- x_code_interne (Char)
- x_nom_long (Char)
- x_contenu (Float)
- x_conditionnement (Float)
- x_coef_approche (Float)
- x_zone_peche (Char)
- x_nom_scientifique (Char)
- x_origine (Char)
- x_marque (Char)
- x_tarif_t1_ht à x_tarif_t6_ht (Float)

#### Champs personnalisés fournisseurs (res.partner)
- x_code_interne (Char)
- x_groupe_fournisseur (Selection)
- x_is_transitaire (Boolean)
- x_delai_livraison (Integer)
- x_incoterm (Char)
- x_conditions_achat (Text)

#### Listes de prix
- Tarif Base
- Tarif T1 à T6

#### Taxes
- TVA 2.1% DOM (ventes et achats)
- TVA 8.5% DOM (ventes et achats)
- Exonéré

#### Conditions de paiement
- Comptant
- 30 jours
- 60 jours

## Logs

Les scripts affichent des logs en temps réel :
- INFO : Progression
- DEBUG : Détail des créations/MAJ
- ERROR : Erreurs

Pour plus de détails, modifiez le niveau de log dans le script :
```python
logging.basicConfig(level=logging.DEBUG)
```

## Dépannage

### Erreur "Authentification échouée"
- Vérifier l'URL, la base, le username
- Régénérer la clé API

### Erreur "Champ x_xxx non trouvé"
- Créer le champ personnalisé dans Odoo avant l'import

### Erreur "Taxe non trouvée"
- Créer les taxes TVA DOM dans Odoo

### Import lent
- Réduire `IMPORT_LIMIT` pour tester
- Utiliser `DRY_RUN = True` pour simuler

## Statistiques

À la fin de chaque import, un résumé s'affiche :
```
==================================================
RÉSULTATS IMPORT CLIENTS
==================================================
  Total lignes     : 500
  Créés            : 450
  Mis à jour       : 30
  Ignorés          : 15
  Erreurs          : 5
==================================================
```
