#!/usr/bin/env python3
"""
Configuration pour les scripts d'import Odoo - AH CHOU
"""

# Configuration Odoo
ODOO_CONFIG = {
    'url': 'https://ah-chou1.odoo.com',
    'database': 'ah-chou1',
    'username': 'mathieu.loic.hoarau@gmail.com',
    'api_key': 'VOTRE_CLE_API_ICI',  # À remplacer après génération dans Odoo
}

# Chemin vers le fichier Excel source
EXCEL_FILE = '/Users/mhoar/Desktop/python/BOX_FRAISPEI/INPUT/Recapitulatif/Feuille de calcul sans titre (2).xlsx'

# Fichiers additionnels
PLAN_COMPTABLE_FILE = '/Users/mhoar/Desktop/GEL OI/Plan Comptable.xlsx'

# Mapping des groupes clients
GROUPE_CLIENT_MAPPING = {
    'GBH': 'gbh',
    'SMDIS': 'smdis',
    'CELLULE U': 'cellule_u',
    'CAILLE': 'caille',
    'DISTRIMASCAREIGNES': 'distrimascareignes',
    'IBL': 'ibl',
    'TK': 'tk',
    'LOT': 'lot',
    'GMS': 'gms',
}

# Mapping des enseignes
ENSEIGNE_MAPPING = {
    'AUCHAN': 'auchan',
    'CARREFOUR': 'carrefour',
    'CARREFOUR MARKET': 'carrefour_market',
    'CARREFOUR CITY': 'carrefour_city',
    'PROMOCASH': 'promocash',
    'U': 'u',
    'LECLERC': 'leclerc',
    'INTERMARK': 'intermark',
    'RUN MARKET': 'run_market',
    'COCCI MARKET': 'cocci_market',
    'LEADER PRICE': 'leader_price',
    'GEL OI': 'gel_oi',
    'INDEPENDANT': 'independant',
}

# Mapping des typologies
TYPOLOGIE_MAPPING = {
    'HYPER': 'hyper',
    'SUPER': 'super',
    'MARCHE': 'marche',
    'EXPRESS': 'express',
    'CASH': 'cash',
    'AUTRES': 'autres',
}

# Mapping des catégories clients
CATEGORIE_CLIENT_MAPPING = {
    'GMS': 'GMS',
    'PLATE FORME': 'PLATE-FORME',
    'PLATE-FORME': 'PLATE-FORME',
    'GROSSISTE': 'GROSSISTE',
    'CHR': 'CHR',
    'DIVERS': 'DIVERS',
}

# Mapping des groupes fournisseurs
GROUPE_FOURNISSEUR_MAPPING = {
    'ASIE-INDE': 'asie_inde',
    'AISIE-INDE': 'asie_inde',  # Correction faute de frappe
    'ASIE -INDE': 'asie_inde',
    'EUROPE': 'europe',
    'LOCAL': 'local',
    'AFRIQUE': 'afrique',
    'AMERIQUE': 'amerique',
    'OCEANIE': 'oceanie',
}

# Mapping des familles produits
FAMILLE_PRODUIT_MAPPING = {
    'PECHE': 'Pêche',
    'PÊCHE': 'Pêche',
    'CONDIMENT': 'Condiment',
    'CONDIMENTS': 'Condiment',
    'SNACKING VAPEUR': 'Snacking Vapeur',
    'SNACKING FRITURE': 'Snacking Friture',
}

# Mapping TVA
TVA_MAPPING = {
    2.1: 'TVA 2.1% DOM',
    8.5: 'TVA 8.5% DOM',
    0.0: 'Exonéré',
    0: 'Exonéré',
}

# Conditions de paiement
CONDITION_PAIEMENT_MAPPING = {
    '00': 'Comptant',
    '01': '15 jours',
    '02': '30 jours',
    '03': '60 jours',
}

# Mode dry-run (True = pas d'écriture dans Odoo)
DRY_RUN = True

# Limite d'import (None = tout importer)
IMPORT_LIMIT = None  # Mettre un nombre pour tester (ex: 10)

# Logging
LOG_LEVEL = 'INFO'  # DEBUG, INFO, WARNING, ERROR
