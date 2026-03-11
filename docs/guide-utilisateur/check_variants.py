#!/usr/bin/env python3
"""Check product variants (shared barcodes) and complete nomenclature."""
import xmlrpc.client
from collections import Counter

URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USER = "mathieu.loic.hoarau@gmail.com"
PWD = "gbtN0WxuCVjg@g*C"

common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
uid = common.authenticate(DB, USER, PWD, {})
models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

# Get ALL product.product (variants) with their barcodes
print("=" * 70)
print("VARIANTES — Produits partageant un même code-barres")
print("=" * 70)

all_variants = models.execute_kw(DB, uid, PWD, 'product.product', 'search_read', [[]], {
    'fields': ['name', 'default_code', 'barcode', 'product_tmpl_id'],
    'limit': 500
})

# Group by barcode
barcode_groups = {}
for v in all_variants:
    bc = v['barcode']
    if bc:
        barcode_groups.setdefault(bc, []).append(v)

shared = {bc: prods for bc, prods in barcode_groups.items() if len(prods) > 1}
print(f"\nTotal variantes: {len(all_variants)}")
print(f"Codes-barres uniques: {len(barcode_groups)}")
print(f"Codes-barres partagés (>1 produit): {len(shared)}")

for bc, prods in list(shared.items())[:10]:
    print(f"\n  Barcode: {bc} — {len(prods)} produits:")
    for p in prods:
        print(f"    [{p['default_code']}] {p['name']}")
        print(f"      template: {p['product_tmpl_id'][1] if p['product_tmpl_id'] else '-'}")

# Categories
print("\n" + "=" * 70)
print("CATÉGORIES PRODUIT")
print("=" * 70)
cats = models.execute_kw(DB, uid, PWD, 'product.category', 'search_read', [[]], {
    'fields': ['name', 'complete_name', 'parent_id'],
    'order': 'complete_name'
})
for c in cats:
    print(f"  {c['complete_name']}")

# Clients sample with custom fields
print("\n" + "=" * 70)
print("CLIENTS — Exemples avec champs custom")
print("=" * 70)
clients = models.execute_kw(DB, uid, PWD, 'res.partner', 'search_read',
    [[['is_company', '=', True], ['customer_rank', '>', 0]]], {
    'fields': ['name', 'ref', 'city', 'phone', 'email', 'property_product_pricelist',
               'property_payment_term_id', 'category_id', 'x_groupe_facturation'],
    'limit': 5
})
for c in clients:
    pl = c['property_product_pricelist'][1] if c['property_product_pricelist'] else '-'
    pt = c['property_payment_term_id'][1] if c['property_payment_term_id'] else '-'
    print(f"  {c['name']} (ref={c['ref']})")
    print(f"    ville={c['city']} tel={c['phone']} email={c['email']}")
    print(f"    liste_prix={pl} paiement={pt}")
    print(f"    groupe_fact={c.get('x_groupe_facturation','-')}")

# Suppliers
print("\n" + "=" * 70)
print("FOURNISSEURS — Exemples avec champs")
print("=" * 70)
suppliers = models.execute_kw(DB, uid, PWD, 'res.partner', 'search_read',
    [[['is_company', '=', True], ['supplier_rank', '>', 0]]], {
    'fields': ['name', 'ref', 'city', 'country_id', 'phone', 'email', 'category_id'],
    'limit': 5
})
for s in suppliers:
    country = s['country_id'][1] if s['country_id'] else '-'
    tags = s.get('category_id', [])
    # Get tag names
    tag_names = []
    if tags:
        tag_data = models.execute_kw(DB, uid, PWD, 'res.partner.category', 'read', [tags], {'fields': ['name']})
        tag_names = [t['name'] for t in tag_data]
    print(f"  {s['name']} (ref={s['ref']})")
    print(f"    pays={country} ville={s['city']}")
    print(f"    tel={s['phone']} email={s['email']}")
    print(f"    tags={tag_names}")

# Counts
total_clients = models.execute_kw(DB, uid, PWD, 'res.partner', 'search_count',
    [[['is_company', '=', True], ['customer_rank', '>', 0]]])
total_suppliers = models.execute_kw(DB, uid, PWD, 'res.partner', 'search_count',
    [[['is_company', '=', True], ['supplier_rank', '>', 0]]])
total_prods = models.execute_kw(DB, uid, PWD, 'product.template', 'search_count', [[]])

print(f"\nTOTAUX: {total_prods} produits, {total_clients} clients, {total_suppliers} fournisseurs")
print(f"Barcodes partagés: {len(shared)}")
