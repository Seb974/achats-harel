#!/usr/bin/env python3
"""
Script pour vérifier l'import du plan comptable dans Odoo
Via l'API XML-RPC
"""

import xmlrpc.client
import sys
from getpass import getpass

# Configuration
URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USERNAME = "mathieu.loic.hoarau@gmail.com"

print("=" * 80)
print("VÉRIFICATION DU PLAN COMPTABLE DANS ODOO")
print("=" * 80)
print()
print(f"Instance: {URL}")
print(f"Base de données: {DB}")
print(f"Utilisateur: {USERNAME}")
print()

# Demander le mot de passe
PASSWORD = getpass("Entrez votre mot de passe Odoo: ")

try:
    print()
    print("Connexion à Odoo...")
    
    # Authentification
    common = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/common')
    try:
        version = common.version()
        print(f"✓ Connexion établie")
        print(f"  Version Odoo: {version.get('server_version', 'N/A')}")
        print(f"  Series: {version.get('server_serie', 'N/A')}")
    except Exception as e:
        print(f"✓ Connexion établie (version non disponible)")
    
    uid = common.authenticate(DB, USERNAME, PASSWORD, {})
    if not uid:
        print()
        print("❌ ÉCHEC DE L'AUTHENTIFICATION")
        print()
        print("Vérifiez:")
        print("  - Le nom de la base de données")
        print("  - Le nom d'utilisateur")
        print("  - Le mot de passe")
        sys.exit(1)
    
    print(f"✓ Authentification réussie (UID: {uid})")
    print()
    
    # Connexion au modèle
    models = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/object')
    
    print("=" * 80)
    print("STATISTIQUES DU PLAN COMPTABLE")
    print("=" * 80)
    print()
    
    # Compter tous les comptes
    all_accounts = models.execute_kw(
        DB, uid, PASSWORD,
        'account.account', 'search_read',
        [[]],
        {'fields': ['code', 'name', 'account_type', 'reconcile']}
    )
    
    total_count = len(all_accounts)
    print(f"📊 Nombre total de comptes: {total_count}")
    print()
    
    # Statistiques par type
    from collections import Counter
    type_counts = Counter(acc['account_type'] for acc in all_accounts)
    
    print("Distribution par type de compte:")
    print("-" * 80)
    for acc_type, count in sorted(type_counts.items(), key=lambda x: -x[1]):
        percentage = (count / total_count) * 100
        print(f"  {acc_type:35s} : {count:4d} comptes ({percentage:5.1f}%)")
    
    print()
    print("=" * 80)
    print("VÉRIFICATION DES COMPTES CLÉS")
    print("=" * 80)
    print()
    
    # Comptes clés à vérifier
    key_accounts = {
        '40100000': {
            'name': 'Fournisseurs',
            'expected_type': 'liability_payable',
            'expected_reconcile': True
        },
        '41100000': {
            'name': 'Clients',
            'expected_type': 'asset_receivable',
            'expected_reconcile': True
        },
        '41600000': {
            'name': 'Clients douteux',
            'expected_type': 'asset_receivable',
            'expected_reconcile': True
        },
        '60710000': {
            'name': 'Achats march exo',
            'expected_type': 'expense',
            'expected_reconcile': False
        },
        '70700000': {
            'name': 'Ventes exo libre service',
            'expected_type': 'income',
            'expected_reconcile': False
        },
        '10100000': {
            'name': 'Capital',
            'expected_type': 'equity',
            'expected_reconcile': False
        }
    }
    
    results = []
    
    for code, expected in key_accounts.items():
        print(f"Recherche du compte {code} ({expected['name']})...")
        
        # Chercher le compte
        account = next((acc for acc in all_accounts if acc['code'] == code), None)
        
        if not account:
            print(f"  ❌ COMPTE NON TROUVÉ")
            results.append({
                'code': code,
                'found': False,
                'status': 'NOT_FOUND'
            })
        else:
            # Vérifier le type
            type_ok = account['account_type'] == expected['expected_type']
            reconcile_ok = account['reconcile'] == expected['expected_reconcile']
            
            print(f"  ✓ Compte trouvé:")
            print(f"    Nom: {account['name']}")
            print(f"    Type: {account['account_type']}", end="")
            if type_ok:
                print(" ✓")
            else:
                print(f" ❌ (attendu: {expected['expected_type']})")
            
            print(f"    Lettrage: {account['reconcile']}", end="")
            if reconcile_ok:
                print(" ✓")
            else:
                print(f" ❌ (attendu: {expected['expected_reconcile']})")
            
            all_ok = type_ok and reconcile_ok
            results.append({
                'code': code,
                'found': True,
                'all_ok': all_ok,
                'type_ok': type_ok,
                'reconcile_ok': reconcile_ok,
                'actual_type': account['account_type'],
                'actual_reconcile': account['reconcile']
            })
        
        print()
    
    print("=" * 80)
    print("RÉSUMÉ DE LA VÉRIFICATION")
    print("=" * 80)
    print()
    
    found_count = sum(1 for r in results if r['found'])
    ok_count = sum(1 for r in results if r.get('all_ok', False))
    
    print(f"Comptes clés vérifiés: {len(results)}")
    print(f"Comptes trouvés: {found_count}/{len(results)}")
    print(f"Comptes avec config correcte: {ok_count}/{found_count if found_count > 0 else 0}")
    print()
    
    if total_count >= 390:
        print("✅ Le plan comptable semble complet (>= 390 comptes)")
    else:
        print(f"⚠️  Le plan comptable semble incomplet ({total_count} < 390 comptes)")
    
    if ok_count == found_count == len(results):
        print("✅ Tous les comptes clés sont correctement configurés")
    else:
        print("⚠️  Certains comptes ont des problèmes de configuration")
    
    print()
    print("=" * 80)
    print("EXEMPLES DE COMPTES")
    print("=" * 80)
    print()
    
    # Afficher quelques exemples
    print("Quelques comptes dans le plan comptable:")
    print("-" * 80)
    for account in all_accounts[:20]:
        reconcile_marker = " [R]" if account['reconcile'] else ""
        print(f"  {account['code']:12s} | {account['name']:40s} | {account['account_type']:25s}{reconcile_marker}")
    
    if len(all_accounts) > 20:
        print(f"  ... et {len(all_accounts) - 20} autres comptes")
    
    print()
    print("=" * 80)
    print("VÉRIFICATION TERMINÉE")
    print("=" * 80)
    print()
    
    # Sauvegarder les résultats dans un fichier
    from datetime import datetime
    with open('verification_plan_comptable_resultat.txt', 'w', encoding='utf-8') as f:
        f.write("VÉRIFICATION DU PLAN COMPTABLE ODOO\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Date: {datetime.now()}\n")
        f.write(f"Instance: {URL}\n")
        f.write(f"Base: {DB}\n")
        f.write(f"Utilisateur: {USERNAME}\n\n")
        
        f.write(f"Nombre total de comptes: {total_count}\n\n")
        
        f.write("Distribution par type:\n")
        for acc_type, count in sorted(type_counts.items(), key=lambda x: -x[1]):
            percentage = (count / total_count) * 100
            f.write(f"  {acc_type:35s} : {count:4d} comptes ({percentage:5.1f}%)\n")
        
        f.write("\n\nComptes clés vérifiés:\n")
        for code, expected in key_accounts.items():
            result = next((r for r in results if r['code'] == code), None)
            if result and result['found']:
                status = "✓ OK" if result['all_ok'] else "✗ Problème"
                f.write(f"  {code}: {status}\n")
            else:
                f.write(f"  {code}: ✗ Non trouvé\n")
        
        f.write("\n\nTous les comptes:\n")
        for account in sorted(all_accounts, key=lambda x: x['code']):
            reconcile_marker = " [R]" if account['reconcile'] else ""
            f.write(f"{account['code']:12s} | {account['name']:50s} | {account['account_type']:25s}{reconcile_marker}\n")
    
    print("Résultats sauvegardés dans: verification_plan_comptable_resultat.txt")
    print()

except xmlrpc.client.Fault as fault:
    print()
    print(f"❌ ERREUR XML-RPC: {fault.faultString}")
    print()
    print("Causes possibles:")
    print("  - L'API XML-RPC n'est pas activée sur cette instance Odoo Online")
    print("  - Droits d'accès insuffisants")
    print("  - Nom de base de données incorrect")
    print()
    print("Pour Odoo Online, l'API XML-RPC est souvent désactivée.")
    print("Vous devrez vérifier manuellement via l'interface web.")
    sys.exit(1)

except Exception as e:
    print()
    print(f"❌ ERREUR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
