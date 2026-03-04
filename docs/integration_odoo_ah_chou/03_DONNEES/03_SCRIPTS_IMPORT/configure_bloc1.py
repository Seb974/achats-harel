#!/usr/bin/env python3
"""
Configuration BLOC 1 - Odoo AH CHOU
Création des éléments manquants via API XML-RPC
"""

import xmlrpc.client
from datetime import datetime

# Configuration
ODOO_URL = 'https://ah-chou1.odoo.com'
ODOO_DB = 'ah-chou1'
ODOO_USER = 'mathieu.loic.hoarau@gmail.com'
ODOO_PASS = 'gbtN0WxuCVjg@g*C'

# Mode simulation (True = pas d'écriture)
DRY_RUN = False

def connect():
    """Connexion à Odoo"""
    print("=" * 60)
    print("CONFIGURATION BLOC 1 - ODOO AH CHOU")
    print("=" * 60)
    print(f"Instance: {ODOO_URL}")
    print(f"Date: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    if DRY_RUN:
        print("⚠️  MODE SIMULATION - Pas d'écriture")
    print("=" * 60)
    
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASS, {})
    
    if not uid:
        raise Exception("Authentification échouée")
    
    print(f"\n✅ Connecté (UID: {uid})")
    
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    return uid, models

def execute(models, uid, model, method, *args, **kwargs):
    """Exécute une méthode sur un modèle"""
    return models.execute_kw(ODOO_DB, uid, ODOO_PASS, model, method, *args, **kwargs)

def create_dom_taxes(uid, models):
    """Crée les taxes TVA DOM"""
    print("\n" + "-" * 60)
    print("CRÉATION TAXES TVA DOM")
    print("-" * 60)
    
    # Récupérer les comptes comptables de TVA
    # Rechercher les comptes 445 (TVA)
    try:
        accounts = execute(models, uid, 'account.account', 'search_read',
            [[('code', 'like', '445')]],
            {'fields': ['id', 'code', 'name']}
        )
        print(f"\n   Comptes TVA trouvés: {len(accounts)}")
        for acc in accounts:
            print(f"   - {acc['code']}: {acc['name']}")
    except Exception as e:
        print(f"   ⚠️ Impossible de lire les comptes: {e}")
        accounts = []
    
    # Définition des taxes à créer
    taxes_to_create = [
        {
            'name': 'TVA 2.1% DOM (Ventes)',
            'amount': 2.1,
            'type_tax_use': 'sale',
            'amount_type': 'percent',
            'description': 'TVA réduite DOM',
        },
        {
            'name': 'TVA 2.1% DOM (Achats)',
            'amount': 2.1,
            'type_tax_use': 'purchase',
            'amount_type': 'percent',
            'description': 'TVA réduite DOM',
        },
        {
            'name': 'TVA 8.5% DOM (Ventes)',
            'amount': 8.5,
            'type_tax_use': 'sale',
            'amount_type': 'percent',
            'description': 'TVA normale DOM',
        },
        {
            'name': 'TVA 8.5% DOM (Achats)',
            'amount': 8.5,
            'type_tax_use': 'purchase',
            'amount_type': 'percent',
            'description': 'TVA normale DOM',
        },
    ]
    
    created = 0
    for tax_data in taxes_to_create:
        # Vérifier si la taxe existe déjà
        existing = execute(models, uid, 'account.tax', 'search',
            [[('name', '=', tax_data['name'])]]
        )
        
        if existing:
            print(f"   ⏭️  {tax_data['name']} existe déjà")
            continue
        
        if DRY_RUN:
            print(f"   [DRY-RUN] Créerait: {tax_data['name']}")
        else:
            try:
                tax_id = execute(models, uid, 'account.tax', 'create', [tax_data])
                print(f"   ✅ Créé: {tax_data['name']} (ID: {tax_id})")
                created += 1
            except Exception as e:
                print(f"   ❌ Erreur {tax_data['name']}: {e}")
    
    print(f"\n   Total créé: {created}")
    return created

def activate_usd(uid, models):
    """Active la devise USD"""
    print("\n" + "-" * 60)
    print("ACTIVATION DEVISE USD")
    print("-" * 60)
    
    # Rechercher USD
    usd = execute(models, uid, 'res.currency', 'search_read',
        [[('name', '=', 'USD')]],
        {'fields': ['id', 'name', 'active', 'rate']}
    )
    
    if not usd:
        print("   ❌ Devise USD non trouvée dans le système")
        return False
    
    usd = usd[0]
    
    if usd['active']:
        print(f"   ✅ USD déjà actif (ID: {usd['id']})")
        return True
    
    if DRY_RUN:
        print(f"   [DRY-RUN] Activerait USD (ID: {usd['id']})")
        return True
    
    try:
        execute(models, uid, 'res.currency', 'write', [[usd['id']], {'active': True}])
        print(f"   ✅ USD activé (ID: {usd['id']})")
        return True
    except Exception as e:
        print(f"   ❌ Erreur activation USD: {e}")
        return False

def create_pricelists(uid, models):
    """Crée les listes de prix T1-T6"""
    print("\n" + "-" * 60)
    print("CRÉATION LISTES DE PRIX")
    print("-" * 60)
    
    # Récupérer l'ID de EUR
    eur = execute(models, uid, 'res.currency', 'search',
        [[('name', '=', 'EUR')]]
    )
    eur_id = eur[0] if eur else None
    
    pricelists = [
        {'name': 'Tarif Base', 'sequence': 1},
        {'name': 'Tarif T1', 'sequence': 2},
        {'name': 'Tarif T2', 'sequence': 3},
        {'name': 'Tarif T3', 'sequence': 4},
        {'name': 'Tarif T4', 'sequence': 5},
        {'name': 'Tarif T5', 'sequence': 6},
        {'name': 'Tarif T6', 'sequence': 7},
    ]
    
    created = 0
    for pl_data in pricelists:
        # Vérifier si existe
        existing = execute(models, uid, 'product.pricelist', 'search',
            [[('name', '=', pl_data['name'])]]
        )
        
        if existing:
            print(f"   ⏭️  {pl_data['name']} existe déjà")
            continue
        
        if eur_id:
            pl_data['currency_id'] = eur_id
        
        if DRY_RUN:
            print(f"   [DRY-RUN] Créerait: {pl_data['name']}")
        else:
            try:
                pl_id = execute(models, uid, 'product.pricelist', 'create', [pl_data])
                print(f"   ✅ Créé: {pl_data['name']} (ID: {pl_id})")
                created += 1
            except Exception as e:
                print(f"   ❌ Erreur {pl_data['name']}: {e}")
    
    print(f"\n   Total créé: {created}")
    return created

def create_payment_terms(uid, models):
    """Crée les conditions de paiement"""
    print("\n" + "-" * 60)
    print("CRÉATION CONDITIONS DE PAIEMENT")
    print("-" * 60)
    
    terms = [
        {'name': 'Comptant', 'note': 'Paiement immédiat'},
        {'name': '15 jours', 'note': 'Paiement à 15 jours'},
        {'name': '30 jours', 'note': 'Paiement à 30 jours'},
        {'name': '60 jours', 'note': 'Paiement à 60 jours'},
    ]
    
    created = 0
    for term_data in terms:
        existing = execute(models, uid, 'account.payment.term', 'search',
            [[('name', '=', term_data['name'])]]
        )
        
        if existing:
            print(f"   ⏭️  {term_data['name']} existe déjà")
            continue
        
        if DRY_RUN:
            print(f"   [DRY-RUN] Créerait: {term_data['name']}")
        else:
            try:
                term_id = execute(models, uid, 'account.payment.term', 'create', [term_data])
                print(f"   ✅ Créé: {term_data['name']} (ID: {term_id})")
                created += 1
            except Exception as e:
                print(f"   ❌ Erreur {term_data['name']}: {e}")
    
    print(f"\n   Total créé: {created}")
    return created

def main():
    """Point d'entrée principal"""
    try:
        uid, models = connect()
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return
    
    # Exécuter les configurations
    taxes_created = create_dom_taxes(uid, models)
    usd_activated = activate_usd(uid, models)
    pricelists_created = create_pricelists(uid, models)
    terms_created = create_payment_terms(uid, models)
    
    # Résumé
    print("\n" + "=" * 60)
    print("RÉSUMÉ CONFIGURATION BLOC 1")
    print("=" * 60)
    print(f"   Taxes créées: {taxes_created}")
    print(f"   USD activé: {'✅' if usd_activated else '❌'}")
    print(f"   Listes de prix créées: {pricelists_created}")
    print(f"   Conditions paiement créées: {terms_created}")
    
    if DRY_RUN:
        print("\n⚠️  MODE SIMULATION - Relancer avec DRY_RUN = False pour appliquer")
    else:
        print("\n✅ Configuration BLOC 1 terminée!")
    
    print("=" * 60)

if __name__ == '__main__':
    main()
