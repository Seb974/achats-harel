#!/usr/bin/env python3
"""
Vérification de la configuration Odoo - BLOC 1
AH CHOU SARL
"""

import xmlrpc.client
import json
from datetime import datetime

# Configuration
ODOO_URL = 'https://ah-chou1.odoo.com'
ODOO_DB = 'ah-chou1'
ODOO_USER = 'mathieu.loic.hoarau@gmail.com'
ODOO_PASS = 'gbtN0WxuCVjg@g*C'

def connect():
    """Connexion à Odoo"""
    print("=" * 60)
    print("VÉRIFICATION CONFIGURATION ODOO - BLOC 1")
    print("=" * 60)
    print(f"Instance: {ODOO_URL}")
    print(f"Base: {ODOO_DB}")
    print(f"Date: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print("=" * 60)
    
    try:
        common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
        version = common.version()
        print(f"\n✅ Connexion réussie!")
        print(f"   Version Odoo: {version.get('server_version', 'inconnue')}")
        print(f"   Série: {version.get('server_serie', 'inconnue')}")
        
        uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASS, {})
        if uid:
            print(f"   UID utilisateur: {uid}")
        else:
            print("❌ Authentification échouée")
            return None, None
        
        models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
        return uid, models
        
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return None, None

def check_company(uid, models):
    """Vérifie la configuration de la société"""
    print("\n" + "-" * 60)
    print("1.1 - CONFIGURATION SOCIÉTÉ")
    print("-" * 60)
    
    try:
        companies = models.execute_kw(
            ODOO_DB, uid, ODOO_PASS,
            'res.company', 'search_read',
            [[]],
            {'fields': ['name', 'street', 'city', 'zip', 'country_id', 'currency_id', 'vat', 'siret']}
        )
        
        for company in companies:
            print(f"\n   Société: {company.get('name', 'N/A')}")
            print(f"   Adresse: {company.get('street', 'N/A')}")
            print(f"   Ville: {company.get('zip', '')} {company.get('city', 'N/A')}")
            print(f"   Pays: {company.get('country_id', ['', 'N/A'])[1] if company.get('country_id') else 'N/A'}")
            print(f"   Devise: {company.get('currency_id', ['', 'N/A'])[1] if company.get('currency_id') else 'N/A'}")
            print(f"   TVA: {company.get('vat', 'Non renseigné')}")
            print(f"   SIRET: {company.get('siret', 'Non renseigné')}")
            
        return companies
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return []

def check_taxes(uid, models):
    """Vérifie les taxes configurées"""
    print("\n" + "-" * 60)
    print("1.2 - TAXES TVA")
    print("-" * 60)
    
    try:
        taxes = models.execute_kw(
            ODOO_DB, uid, ODOO_PASS,
            'account.tax', 'search_read',
            [[]],
            {'fields': ['name', 'amount', 'type_tax_use', 'active'], 'order': 'amount'}
        )
        
        print(f"\n   Total taxes trouvées: {len(taxes)}")
        print("\n   {:40} {:10} {:10} {:8}".format("NOM", "TAUX", "TYPE", "ACTIF"))
        print("   " + "-" * 70)
        
        dom_taxes = {'2.1_vente': False, '2.1_achat': False, 
                     '8.5_vente': False, '8.5_achat': False,
                     '0_vente': False, '0_achat': False}
        
        for tax in taxes:
            name = tax.get('name', 'N/A')[:38]
            amount = tax.get('amount', 0)
            tax_type = tax.get('type_tax_use', 'N/A')
            active = '✅' if tax.get('active') else '❌'
            
            print(f"   {name:40} {amount:>8}% {tax_type:10} {active}")
            
            # Vérifier les taxes DOM
            name_lower = name.lower()
            if '2.1' in str(amount) or '2,1' in name_lower:
                if tax_type == 'sale':
                    dom_taxes['2.1_vente'] = True
                elif tax_type == 'purchase':
                    dom_taxes['2.1_achat'] = True
            if '8.5' in str(amount) or '8,5' in name_lower:
                if tax_type == 'sale':
                    dom_taxes['8.5_vente'] = True
                elif tax_type == 'purchase':
                    dom_taxes['8.5_achat'] = True
            if amount == 0:
                if tax_type == 'sale':
                    dom_taxes['0_vente'] = True
                elif tax_type == 'purchase':
                    dom_taxes['0_achat'] = True
        
        print("\n   Taxes DOM requises:")
        print(f"   - TVA 2.1% Vente:  {'✅ Présente' if dom_taxes['2.1_vente'] else '❌ À créer'}")
        print(f"   - TVA 2.1% Achat:  {'✅ Présente' if dom_taxes['2.1_achat'] else '❌ À créer'}")
        print(f"   - TVA 8.5% Vente:  {'✅ Présente' if dom_taxes['8.5_vente'] else '❌ À créer'}")
        print(f"   - TVA 8.5% Achat:  {'✅ Présente' if dom_taxes['8.5_achat'] else '❌ À créer'}")
        print(f"   - Exonéré Vente:   {'✅ Présente' if dom_taxes['0_vente'] else '❌ À créer'}")
        print(f"   - Exonéré Achat:   {'✅ Présente' if dom_taxes['0_achat'] else '❌ À créer'}")
        
        return taxes, dom_taxes
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return [], {}

def check_currencies(uid, models):
    """Vérifie les devises configurées"""
    print("\n" + "-" * 60)
    print("1.3 - DEVISES")
    print("-" * 60)
    
    try:
        currencies = models.execute_kw(
            ODOO_DB, uid, ODOO_PASS,
            'res.currency', 'search_read',
            [[('name', 'in', ['EUR', 'USD'])]],
            {'fields': ['name', 'symbol', 'active', 'rate']}
        )
        
        eur_active = False
        usd_active = False
        
        for curr in currencies:
            name = curr.get('name', 'N/A')
            symbol = curr.get('symbol', '')
            active = '✅ Actif' if curr.get('active') else '❌ Inactif'
            rate = curr.get('rate', 1.0)
            
            print(f"\n   {name} ({symbol})")
            print(f"   - Statut: {active}")
            print(f"   - Taux: {rate}")
            
            if name == 'EUR':
                eur_active = curr.get('active', False)
            if name == 'USD':
                usd_active = curr.get('active', False)
        
        print("\n   Résumé:")
        print(f"   - EUR: {'✅ OK' if eur_active else '❌ À activer'}")
        print(f"   - USD: {'✅ OK' if usd_active else '❌ À activer'}")
        
        return currencies, eur_active, usd_active
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return [], False, False

def check_modules(uid, models):
    """Vérifie les modules installés"""
    print("\n" + "-" * 60)
    print("1.4 - MODULES INSTALLÉS")
    print("-" * 60)
    
    required_modules = [
        ('sale_management', 'Ventes'),
        ('purchase', 'Achats'),
        ('stock', 'Inventaire'),
        ('account_accountant', 'Comptabilité'),
        ('point_of_sale', 'Point de Vente'),
        ('product_expiry', 'Dates expiration'),
    ]
    
    try:
        for tech_name, display_name in required_modules:
            modules = models.execute_kw(
                ODOO_DB, uid, ODOO_PASS,
                'ir.module.module', 'search_read',
                [[('name', '=', tech_name)]],
                {'fields': ['name', 'state', 'shortdesc']}
            )
            
            if modules and modules[0].get('state') == 'installed':
                print(f"   ✅ {display_name} ({tech_name})")
            else:
                state = modules[0].get('state', 'non trouvé') if modules else 'non trouvé'
                print(f"   ❌ {display_name} ({tech_name}) - État: {state}")
                
    except Exception as e:
        print(f"   ❌ Erreur: {e}")

def check_pricelists(uid, models):
    """Vérifie les listes de prix"""
    print("\n" + "-" * 60)
    print("BONUS - LISTES DE PRIX")
    print("-" * 60)
    
    try:
        pricelists = models.execute_kw(
            ODOO_DB, uid, ODOO_PASS,
            'product.pricelist', 'search_read',
            [[]],
            {'fields': ['name', 'currency_id', 'active']}
        )
        
        print(f"\n   Listes de prix trouvées: {len(pricelists)}")
        for pl in pricelists:
            active = '✅' if pl.get('active') else '❌'
            currency = pl.get('currency_id', ['', 'N/A'])[1] if pl.get('currency_id') else 'N/A'
            print(f"   {active} {pl.get('name', 'N/A')} ({currency})")
            
        # Vérifier les listes T1-T6
        required = ['Tarif Base', 'Tarif T1', 'Tarif T2', 'Tarif T3', 'Tarif T4', 'Tarif T5', 'Tarif T6']
        existing_names = [pl.get('name', '').lower() for pl in pricelists]
        
        print("\n   Listes requises:")
        for req in required:
            found = any(req.lower() in name for name in existing_names)
            print(f"   {'✅' if found else '❌'} {req}")
            
    except Exception as e:
        print(f"   ❌ Erreur: {e}")

def main():
    """Point d'entrée principal"""
    uid, models = connect()
    
    if not uid or not models:
        print("\n❌ Impossible de continuer sans connexion")
        return
    
    check_company(uid, models)
    taxes, dom_taxes = check_taxes(uid, models)
    currencies, eur_active, usd_active = check_currencies(uid, models)
    check_modules(uid, models)
    check_pricelists(uid, models)
    
    # Résumé final
    print("\n" + "=" * 60)
    print("RÉSUMÉ BLOC 1")
    print("=" * 60)
    
    issues = []
    if not all(dom_taxes.values()):
        missing = [k for k, v in dom_taxes.items() if not v]
        issues.append(f"Taxes DOM manquantes: {', '.join(missing)}")
    if not usd_active:
        issues.append("USD non activé")
    
    if issues:
        print("\n⚠️  Actions requises:")
        for issue in issues:
            print(f"   - {issue}")
    else:
        print("\n✅ Configuration BLOC 1 complète!")
    
    print("\n" + "=" * 60)

if __name__ == '__main__':
    main()
