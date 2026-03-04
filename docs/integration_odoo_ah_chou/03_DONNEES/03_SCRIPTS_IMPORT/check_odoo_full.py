#!/usr/bin/env python3
"""
Vérification COMPLÈTE de la configuration Odoo - BLOC 1
AH CHOU SARL
"""

import xmlrpc.client
from datetime import datetime

# Configuration
ODOO_URL = 'https://ah-chou1.odoo.com'
ODOO_DB = 'ah-chou1'
ODOO_USER = 'mathieu.loic.hoarau@gmail.com'
ODOO_PASS = 'gbtN0WxuCVjg@g*C'

def connect():
    """Connexion à Odoo"""
    print("=" * 70)
    print("VÉRIFICATION COMPLÈTE BLOC 1 - ODOO AH CHOU")
    print("=" * 70)
    print(f"Instance: {ODOO_URL}")
    print(f"Base: {ODOO_DB}")
    print(f"Date: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print("=" * 70)
    
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    version = common.version()
    print(f"\n✅ Connexion réussie!")
    print(f"   Version: {version.get('server_version', 'inconnue')}")
    
    uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASS, {})
    if not uid:
        raise Exception("Authentification échouée")
    
    print(f"   UID: {uid}")
    
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    return uid, models, version

def execute(models, uid, model, method, *args, **kwargs):
    return models.execute_kw(ODOO_DB, uid, ODOO_PASS, model, method, *args, **kwargs)

def check_company(uid, models):
    """1.1 - Configuration Société"""
    print("\n" + "=" * 70)
    print("1.1 - CONFIGURATION SOCIÉTÉ")
    print("=" * 70)
    
    try:
        companies = execute(models, uid, 'res.company', 'search_read',
            [[]],
            {'fields': ['name', 'street', 'street2', 'city', 'zip', 'country_id', 
                       'currency_id', 'vat', 'email', 'phone', 'website']}
        )
        
        status = {'ok': True, 'issues': []}
        
        for company in companies:
            print(f"\n   Nom: {company.get('name', 'N/A')}")
            
            # Vérifier le nom
            if 'AH CHOU' not in str(company.get('name', '')).upper():
                status['issues'].append("Nom de société à vérifier (attendu: AH CHOU SARL)")
            
            # Adresse
            street = company.get('street', '')
            city = company.get('city', '')
            zip_code = company.get('zip', '')
            print(f"   Adresse: {street or 'Non renseignée'}")
            print(f"   Ville: {zip_code} {city or 'Non renseignée'}")
            
            if not street or not city:
                status['issues'].append("Adresse incomplète")
            
            # Pays
            country = company.get('country_id')
            country_name = country[1] if country else 'Non défini'
            print(f"   Pays: {country_name}")
            
            if not country or 'France' not in country_name:
                status['issues'].append("Pays à définir (France)")
            
            # Devise
            currency = company.get('currency_id')
            currency_name = currency[1] if currency else 'Non définie'
            print(f"   Devise: {currency_name}")
            
            if not currency or 'EUR' not in currency_name:
                status['issues'].append("Devise à vérifier (EUR)")
            
            # TVA
            vat = company.get('vat', '')
            print(f"   N° TVA: {vat or 'Non renseigné'}")
            
            if not vat:
                status['issues'].append("N° TVA intracommunautaire à renseigner")
            
            # Contact
            email = company.get('email', '')
            phone = company.get('phone', '')
            print(f"   Email: {email or 'Non renseigné'}")
            print(f"   Téléphone: {phone or 'Non renseigné'}")
        
        # Résumé
        if status['issues']:
            status['ok'] = False
            print(f"\n   ⚠️ Points à corriger:")
            for issue in status['issues']:
                print(f"      - {issue}")
        else:
            print(f"\n   ✅ Configuration société complète")
        
        return status
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return {'ok': False, 'issues': [str(e)]}

def check_taxes(uid, models):
    """1.2 - Taxes TVA DOM"""
    print("\n" + "=" * 70)
    print("1.2 - TAXES TVA DOM")
    print("=" * 70)
    
    try:
        taxes = execute(models, uid, 'account.tax', 'search_read',
            [[]],
            {'fields': ['name', 'amount', 'type_tax_use', 'active'], 'order': 'amount'}
        )
        
        print(f"\n   Taxes trouvées: {len(taxes)}")
        print("\n   {:45} {:8} {:10} {:6}".format("NOM", "TAUX", "TYPE", "ACTIF"))
        print("   " + "-" * 75)
        
        required = {
            '2.1_sale': {'found': False, 'name': 'TVA 2.1% DOM Ventes'},
            '2.1_purchase': {'found': False, 'name': 'TVA 2.1% DOM Achats'},
            '8.5_sale': {'found': False, 'name': 'TVA 8.5% DOM Ventes'},
            '8.5_purchase': {'found': False, 'name': 'TVA 8.5% DOM Achats'},
            '0_sale': {'found': False, 'name': 'Exonéré Ventes'},
            '0_purchase': {'found': False, 'name': 'Exonéré Achats'},
        }
        
        for tax in taxes:
            name = tax.get('name', 'N/A')[:43]
            amount = tax.get('amount', 0)
            tax_type = tax.get('type_tax_use', 'N/A')
            active = '✅' if tax.get('active') else '❌'
            
            print(f"   {name:45} {amount:>6}% {tax_type:10} {active}")
            
            # Vérifier présence
            if abs(amount - 2.1) < 0.01:
                required[f'2.1_{tax_type}']['found'] = True
            elif abs(amount - 8.5) < 0.01:
                required[f'8.5_{tax_type}']['found'] = True
            elif amount == 0:
                required[f'0_{tax_type}']['found'] = True
        
        # Résumé
        print("\n   Taxes DOM requises:")
        all_ok = True
        for key, info in required.items():
            status = '✅' if info['found'] else '❌'
            print(f"   {status} {info['name']}")
            if not info['found']:
                all_ok = False
        
        return {'ok': all_ok, 'taxes': taxes, 'required': required}
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return {'ok': False, 'issues': [str(e)]}

def check_currencies(uid, models):
    """1.3 - Devises"""
    print("\n" + "=" * 70)
    print("1.3 - DEVISES")
    print("=" * 70)
    
    try:
        # Toutes les devises (actives et inactives)
        currencies = execute(models, uid, 'res.currency', 'search_read',
            [[('name', 'in', ['EUR', 'USD'])]],
            {'fields': ['name', 'symbol', 'active', 'rate']}
        )
        
        eur_ok = False
        usd_ok = False
        
        print("\n   {:6} {:6} {:15} {:10}".format("CODE", "SYMB", "STATUT", "TAUX"))
        print("   " + "-" * 40)
        
        for curr in currencies:
            name = curr.get('name', 'N/A')
            symbol = curr.get('symbol', '')
            active = '✅ Actif' if curr.get('active') else '❌ Inactif'
            rate = curr.get('rate', 1.0)
            
            print(f"   {name:6} {symbol:6} {active:15} {rate}")
            
            if name == 'EUR' and curr.get('active'):
                eur_ok = True
            if name == 'USD' and curr.get('active'):
                usd_ok = True
        
        # Si USD n'est pas trouvé, chercher dans toutes les devises
        if not usd_ok:
            all_currencies = execute(models, uid, 'res.currency', 'search_read',
                [[('name', '=', 'USD')]],
                {'fields': ['id', 'name', 'active']}
            )
            if not all_currencies:
                print("\n   ⚠️ USD non disponible dans cette instance")
        
        print(f"\n   Résumé:")
        print(f"   {'✅' if eur_ok else '❌'} EUR (devise principale)")
        print(f"   {'✅' if usd_ok else '⚠️'} USD (pour calculs achats)")
        
        return {'ok': eur_ok, 'eur': eur_ok, 'usd': usd_ok}
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return {'ok': False, 'issues': [str(e)]}

def check_modules(uid, models):
    """1.4 - Modules installés"""
    print("\n" + "=" * 70)
    print("1.4 - MODULES INSTALLÉS")
    print("=" * 70)
    
    required_modules = [
        ('sale_management', 'Ventes', True),
        ('purchase', 'Achats', True),
        ('stock', 'Inventaire', True),
        ('account_accountant', 'Comptabilité', True),
        ('point_of_sale', 'Point de Vente', True),
        ('product_expiry', 'Dates expiration', True),
    ]
    
    all_ok = True
    results = {}
    
    try:
        for tech_name, display_name, required in required_modules:
            modules = execute(models, uid, 'ir.module.module', 'search_read',
                [[('name', '=', tech_name)]],
                {'fields': ['name', 'state', 'shortdesc']}
            )
            
            if modules and modules[0].get('state') == 'installed':
                print(f"   ✅ {display_name} ({tech_name})")
                results[tech_name] = 'installed'
            else:
                state = modules[0].get('state', 'non trouvé') if modules else 'non trouvé'
                print(f"   ❌ {display_name} ({tech_name}) - {state}")
                results[tech_name] = state
                if required:
                    all_ok = False
        
        return {'ok': all_ok, 'modules': results}
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return {'ok': False, 'issues': [str(e)]}

def check_pricelists(uid, models):
    """Bonus - Listes de prix"""
    print("\n" + "=" * 70)
    print("LISTES DE PRIX")
    print("=" * 70)
    
    try:
        pricelists = execute(models, uid, 'product.pricelist', 'search_read',
            [[]],
            {'fields': ['name', 'currency_id', 'active', 'sequence']}
        )
        
        print(f"\n   Total: {len(pricelists)}")
        
        required = ['Tarif Base', 'Tarif T1', 'Tarif T2', 'Tarif T3', 'Tarif T4', 'Tarif T5', 'Tarif T6']
        found = {r: False for r in required}
        
        for pl in pricelists:
            name = pl.get('name', 'N/A')
            active = '✅' if pl.get('active') else '❌'
            print(f"   {active} {name}")
            
            for req in required:
                if req.lower() in name.lower():
                    found[req] = True
        
        print("\n   Listes requises:")
        all_ok = True
        for req, is_found in found.items():
            print(f"   {'✅' if is_found else '❌'} {req}")
            if not is_found:
                all_ok = False
        
        return {'ok': all_ok, 'pricelists': pricelists}
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return {'ok': False}

def check_payment_terms(uid, models):
    """Bonus - Conditions de paiement"""
    print("\n" + "=" * 70)
    print("CONDITIONS DE PAIEMENT")
    print("=" * 70)
    
    try:
        terms = execute(models, uid, 'account.payment.term', 'search_read',
            [[]],
            {'fields': ['name', 'active']}
        )
        
        print(f"\n   Total: {len(terms)}")
        
        required = ['Comptant', '15 jours', '30 jours', '60 jours']
        found = {r: False for r in required}
        
        for term in terms:
            name = term.get('name', 'N/A')
            active = '✅' if term.get('active') else '❌'
            print(f"   {active} {name}")
            
            for req in required:
                if req.lower() in name.lower():
                    found[req] = True
        
        print("\n   Conditions requises:")
        all_ok = True
        for req, is_found in found.items():
            print(f"   {'✅' if is_found else '❌'} {req}")
            if not is_found:
                all_ok = False
        
        return {'ok': all_ok, 'terms': terms}
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return {'ok': False}

def main():
    """Point d'entrée principal"""
    try:
        uid, models, version = connect()
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return
    
    # Vérifications
    company = check_company(uid, models)
    taxes = check_taxes(uid, models)
    currencies = check_currencies(uid, models)
    modules = check_modules(uid, models)
    pricelists = check_pricelists(uid, models)
    payment_terms = check_payment_terms(uid, models)
    
    # Résumé final
    print("\n" + "=" * 70)
    print("RÉSUMÉ BLOC 1")
    print("=" * 70)
    
    print("\n   {:40} {:10}".format("ÉLÉMENT", "STATUT"))
    print("   " + "-" * 55)
    print(f"   {'1.1 Configuration Société':40} {'✅ OK' if company.get('ok') else '⚠️ À compléter'}")
    print(f"   {'1.2 Taxes TVA DOM':40} {'✅ OK' if taxes.get('ok') else '⚠️ Manquantes'}")
    print(f"   {'1.3 Devises (EUR/USD)':40} {'✅ OK' if currencies.get('ok') else '⚠️ USD à activer'}")
    print(f"   {'1.4 Modules':40} {'✅ OK' if modules.get('ok') else '⚠️ Manquants'}")
    print(f"   {'Listes de prix':40} {'✅ OK' if pricelists.get('ok') else '⚠️ Manquantes'}")
    print(f"   {'Conditions paiement':40} {'✅ OK' if payment_terms.get('ok') else '⚠️ Manquantes'}")
    
    # Actions requises
    actions = []
    if not company.get('ok'):
        actions.extend(company.get('issues', ['Compléter infos société']))
    if not taxes.get('ok'):
        actions.append('Créer taxes DOM manquantes')
    if not currencies.get('usd'):
        actions.append('Activer USD (si disponible)')
    if not modules.get('ok'):
        missing = [k for k, v in modules.get('modules', {}).items() if v != 'installed']
        actions.append(f"Installer modules: {', '.join(missing)}")
    
    if actions:
        print("\n   ⚠️ Actions requises:")
        for i, action in enumerate(actions, 1):
            print(f"      {i}. {action}")
    else:
        print("\n   ✅ BLOC 1 COMPLET!")
    
    print("\n" + "=" * 70)

if __name__ == '__main__':
    main()
