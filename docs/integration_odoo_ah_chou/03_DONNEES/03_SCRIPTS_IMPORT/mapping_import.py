#!/usr/bin/env python3
"""
MAPPING DES CHAMPS POUR IMPORT ODOO
===================================
GEL OI / AH CHOU - Bloc 6 Import des données
"""

# ==============================================================================
# MAPPING FOURNISSEURS (res.partner avec supplier_rank > 0)
# ==============================================================================
MAPPING_FOURNISSEURS = {
    # Excel Column -> Odoo Field
    'Code fournisseur': 'ref',                    # Référence interne
    'Nom fournisseur': 'name',                    # Nom
    'Raison sociale': 'company_name',             # Raison sociale (si différent)
    'Adresse': 'street',                          # Adresse
    'Code postal': 'zip',                         # Code postal
    'Ville': 'city',                              # Ville
    'Responsable 1': 'x_responsable_1',           # Champ personnalisé
    'Responsable 2': 'x_responsable_2',           # Champ personnalisé
    'Téléphone': 'phone',                         # Téléphone
    'N° Fax': 'fax',                              # Fax (si disponible)
    'E-Mail': 'email',                            # Email
    'Site Web': 'website',                        # Site web
    'Grp. Frs': 'x_groupe_fournisseur',           # Groupe fournisseur (selection)
    'N° Client': 'x_numero_client_chez_frs',      # N° client chez fournisseur
    'Commentaires': 'comment',                    # Notes internes
    'N° Cpte. Cpta.': 'x_compte_comptable',       # Compte comptable
    'C. Cpta. Aux.': 'x_compte_auxiliaire',       # Compte auxiliaire
    'Transitaire': 'x_is_transitaire',            # Est transitaire (boolean)
    'Nb Jrs Dispo': 'x_delai_livraison',          # Délai livraison
    'Condi. paiement': 'property_supplier_payment_term_id',  # Conditions paiement
    'Condi. livraison': 'x_incoterm',             # Incoterm
    'Condi. achats': 'x_conditions_achat',        # Conditions d'achat
    'France': 'country_id',                       # Pays (France si coché)
}

# Valeurs par défaut fournisseurs
DEFAULTS_FOURNISSEURS = {
    'supplier_rank': 1,                           # Marquer comme fournisseur
    'is_company': True,                           # Est une société
    'country_id': 75,                             # France par défaut
    'lang': 'fr_FR',                              # Langue française
}

# ==============================================================================
# MAPPING CLIENTS (res.partner avec customer_rank > 0)
# ==============================================================================
MAPPING_CLIENTS = {
    # Excel Column -> Odoo Field
    'Code interne': 'ref',                        # Référence interne
    'Nom Client': 'name',                         # Nom
    'Raison sociale': 'company_name',             # Raison sociale
    'Téléphone': 'phone',                         # Téléphone
    'GSM': 'mobile',                              # Mobile
    'Fax': 'fax',                                 # Fax
    'Responsable 1': 'x_responsable_1',           # Champ personnalisé
    'Responsable 2': 'x_responsable_2',           # Champ personnalisé
    'Nom Gr. clients': 'x_groupe_client',         # Groupe client (selection)
    'Nom Enseigne': 'x_enseigne',                 # Enseigne (selection)
    'Code tarif': 'property_product_pricelist',   # Liste de prix
    'E-Mail': 'email',                            # Email
    'Tx remise': 'x_taux_remise',                 # Taux de remise
    'Tx RFA': 'x_taux_rfa',                       # Taux RFA
    'N° Compta': 'x_compte_comptable',            # Compte comptable
    'Siret': 'siret',                             # SIRET (si module l10n_fr)
    'Code APE': 'ape',                            # Code APE
    'Blocage': 'x_blocage',                       # Blocage (selection)
    'Groupe Fact.': 'x_groupe_facturation',       # Groupe facturation
    'Resp. Cpta.': 'x_resp_compta',               # Responsable compta
    'Tél. Cpta.': 'x_tel_compta',                 # Tél comptabilité
    'Email Cpta.': 'x_email_compta',              # Email comptabilité
    'Code règlement': 'property_payment_term_id', # Conditions paiement
}

# Mapping Code tarif -> ID liste de prix Odoo
MAPPING_TARIFS = {
    '00': 2,   # Prix Catalogue (T1 - 40%)
    '90': 3,   # Tarif Hypermarchés (T2 - 35%)
    '91': 4,   # Tarif Supermarchés (T3 - 30%)
    '92': 5,   # Tarif Grossistes (T4 - 25%)
    '93': 6,   # Tarif Plateformes (T5 - 20%)
    # Ajouter autres correspondances si nécessaire
}

# Valeurs par défaut clients
DEFAULTS_CLIENTS = {
    'customer_rank': 1,                           # Marquer comme client
    'is_company': True,                           # Est une société
    'country_id': 75,                             # France (La Réunion)
    'lang': 'fr_FR',                              # Langue française
}

# ==============================================================================
# MAPPING PRODUITS (product.template)
# ==============================================================================
MAPPING_PRODUITS = {
    # Excel Column -> Odoo Field
    'N° Interne': 'default_code',                 # Référence interne
    'Ean 13': 'barcode',                          # Code-barres EAN13
    'Désignation': 'name',                        # Nom du produit
    'Nom long': 'x_nom_long',                     # Nom long personnalisé
    'Contenu': 'x_contenu',                       # Contenu (poids/volume)
    'Condt.': 'x_conditionnement',                # Conditionnement
    'PCB': 'x_pcb',                               # PCB
    'Poids brut': 'x_poids_brut',                 # Poids brut
    'Poids net': 'weight',                        # Poids net (champ standard)
    'Tx. TVA': 'taxes_id',                        # Taxe de vente
    'PV HT': 'list_price',                        # Prix de vente HT
    'PR HT': 'standard_price',                    # Prix d'achat/coût
    'PRMUP': 'x_prmup',                           # PRMUP
    'Coef. App.': 'x_coef_approche',              # Coefficient approche
    'T1 HT': 'x_tarif_t1_ht',                     # Tarif T1
    'T2 HT': 'x_tarif_t2_ht',                     # Tarif T2
    'T3 HT': 'x_tarif_t3_ht',                     # Tarif T3
    'T4 HT': 'x_tarif_t4_ht',                     # Tarif T4
    'T5 HT': 'x_tarif_t5_ht',                     # Tarif T5
    'T6 HT': 'x_tarif_t6_ht',                     # Tarif T6
    'Marque': 'x_marque',                         # Marque
    'Origine': 'x_origine',                       # Origine
    'Segments': 'categ_id',                       # Catégorie (à mapper)
    'Ean 13': 'x_gencod',                         # Gencod (doublon pour champ perso)
}

# Mapping Segments -> ID catégorie Odoo
MAPPING_CATEGORIES = {
    'APERO': 5,          # GEL OI / APERO & SNACKING
    'SNACKING': 5,       # GEL OI / APERO & SNACKING
    'MARIN': 6,          # GEL OI / PRODUITS MARINS
    'POISSON': 6,        # GEL OI / PRODUITS MARINS
    'CRUSTACE': 6,       # GEL OI / PRODUITS MARINS
    'PLAT': 7,           # GEL OI / PLATS PREPARES
    'TRAITEUR': 8,       # GEL OI / TRAITEUR
    'SURGELE': 9,        # GEL OI / SURGELES
    'VIANDE': 10,        # GEL OI / VIANDES
}

# Valeurs par défaut produits
DEFAULTS_PRODUITS = {
    'detailed_type': 'product',                   # Article stockable
    'tracking': 'lot',                            # Suivi par lots
    'sale_ok': True,                              # Peut être vendu
    'purchase_ok': True,                          # Peut être acheté
    'categ_id': 4,                                # GEL OI par défaut
}

# ==============================================================================
# FONCTIONS UTILITAIRES
# ==============================================================================

def clean_value(value):
    """Nettoie une valeur Excel"""
    if value is None:
        return None
    if isinstance(value, str):
        value = value.strip()
        if value == '' or value.lower() in ['n/a', 'na', '-', 'none']:
            return None
    return value

def parse_float(value):
    """Parse une valeur flottante"""
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    try:
        value = str(value).replace(',', '.').replace(' ', '').replace('€', '')
        return float(value)
    except:
        return 0.0

def parse_boolean(value):
    """Parse une valeur booléenne"""
    if value is None:
        return False
    if isinstance(value, bool):
        return value
    str_val = str(value).lower().strip()
    return str_val in ['oui', 'yes', 'true', '1', 'x', 'o']

def map_groupe_fournisseur(value):
    """Mappe le groupe fournisseur vers la valeur selection"""
    if not value:
        return None
    mapping = {
        'AMERIQUE': 'amerique',
        'ASIE': 'asie',
        'EPICES': 'epices',
        'FRANCE': 'france',
        'FRAIS LOCAL': 'frais_local',
        'GROSSISTE FRANCE': 'grossiste_france',
        'MADAGASCAR': 'madagascar',
        'OCEAN INDIEN': 'ocean_indien',
        'PACKAGING': 'packaging',
        'SERVICE': 'service',
        'TRANSITAIRE': 'transitaire',
    }
    return mapping.get(str(value).upper().strip())

def map_groupe_client(value):
    """Mappe le groupe client vers la valeur selection"""
    if not value:
        return None
    mapping = {
        'CHR': 'chr',
        'GMS': 'gms',
        'GROSSISTE': 'grossiste',
        'DIVERS': 'divers',
    }
    return mapping.get(str(value).upper().strip())

if __name__ == '__main__':
    print("Mapping de champs pour import Odoo")
    print(f"Fournisseurs: {len(MAPPING_FOURNISSEURS)} champs mappés")
    print(f"Clients: {len(MAPPING_CLIENTS)} champs mappés")
    print(f"Produits: {len(MAPPING_PRODUITS)} champs mappés")
