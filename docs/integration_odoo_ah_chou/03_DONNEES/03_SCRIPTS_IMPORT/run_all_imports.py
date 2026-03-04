#!/usr/bin/env python3
"""
Script principal pour exécuter tous les imports - AH CHOU
"""

import sys
from datetime import datetime

from config import DRY_RUN


def print_header():
    """Affiche l'en-tête"""
    print("=" * 60)
    print("   IMPORT DONNÉES AH CHOU vers ODOO")
    print("=" * 60)
    print(f"   Date: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    if DRY_RUN:
        print("   ⚠️  MODE DRY-RUN: Aucune modification réelle")
    print("=" * 60)
    print()


def run_import(name, module):
    """Exécute un import"""
    print(f"\n{'='*60}")
    print(f"   {name.upper()}")
    print(f"{'='*60}\n")
    
    try:
        module.main()
        return True
    except Exception as e:
        print(f"❌ Erreur lors de l'import {name}: {e}")
        return False


def main():
    """Point d'entrée principal"""
    print_header()
    
    # Menu interactif
    print("Que souhaitez-vous importer ?")
    print()
    print("  1. Clients")
    print("  2. Produits")
    print("  3. Fournisseurs")
    print("  4. Plan comptable")
    print("  5. TOUT (dans l'ordre)")
    print("  6. Test connexion Odoo")
    print("  0. Quitter")
    print()
    
    choice = input("Votre choix [1-6, 0]: ").strip()
    
    results = {}
    
    if choice == '1':
        from import_clients import main as import_clients
        import_clients()
        
    elif choice == '2':
        from import_produits import main as import_produits
        import_produits()
        
    elif choice == '3':
        from import_fournisseurs import main as import_fournisseurs
        import_fournisseurs()
        
    elif choice == '4':
        from import_plan_comptable import main as import_plan_comptable
        import_plan_comptable()
        
    elif choice == '5':
        print("\n🚀 Lancement de tous les imports...\n")
        
        # Ordre recommandé:
        # 1. Plan comptable (pour avoir les comptes)
        # 2. Clients (utilise les catégories)
        # 3. Fournisseurs
        # 4. Produits (utilise les catégories)
        
        from import_plan_comptable import main as import_plan_comptable
        from import_clients import main as import_clients
        from import_fournisseurs import main as import_fournisseurs
        from import_produits import main as import_produits
        
        print("\n" + "="*60)
        print("   ÉTAPE 1/4: PLAN COMPTABLE")
        print("="*60)
        import_plan_comptable()
        
        print("\n" + "="*60)
        print("   ÉTAPE 2/4: CLIENTS")
        print("="*60)
        import_clients()
        
        print("\n" + "="*60)
        print("   ÉTAPE 3/4: FOURNISSEURS")
        print("="*60)
        import_fournisseurs()
        
        print("\n" + "="*60)
        print("   ÉTAPE 4/4: PRODUITS")
        print("="*60)
        import_produits()
        
        print("\n" + "="*60)
        print("   ✅ TOUS LES IMPORTS TERMINÉS")
        print("="*60)
        
    elif choice == '6':
        from odoo_client import test_connection
        test_connection()
        
    elif choice == '0':
        print("Au revoir!")
        sys.exit(0)
        
    else:
        print("❌ Choix invalide")
        sys.exit(1)


if __name__ == '__main__':
    main()
