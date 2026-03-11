#!/usr/bin/env python3
"""Check product, client, supplier nomenclature in Odoo."""
import xmlrpc.client

URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USER = "mathieu.loic.hoarau@gmail.com"
PWD = "gbtN0WxuCVjg@g*C"

common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
uid = common.authenticate(DB, USER, PWD, {})
models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

# ===== PRODUCTS =====
print("=" * 70)
print("PRODUITS — Structure et exemples")
print("=" * 70)

# Get product fields
prod_fields = models.execute_kw(DB, uid, PWD, 'product.template', 'fields_get', [], {
    'attributes': ['string', 'type']
})
key_fields = ['name', 'default_code', 'barcode', 'categ_id', 'list_price', 'standard_price',
              'type', 'tracking', 'use_expiration_date', 'uom_id', 'weight',
              'x_origine', 'x_conditionnement', 'x_poids_net']
print("\nChamps clés produit:")
for f in key_fields:
    if f in prod_fields:
        print(f"  {f}: {prod_fields[f]['string']} ({prod_fields[f]['type']})")

# Custom fields
custom = {k: v for k, v in prod_fields.items() if k.startswith('x_')}
print(f"\nChamps personnalisés (x_): {len(custom)}")
for k, v in sorted(custom.items()):
    print(f"  {k}: {v['string']} ({v['type']})")

# Sample products
print("\nExemples de produits:")
prods = models.execute_kw(DB, uid, PWD, 'product.template', 'search_read', [[]], {
    'fields': ['name', 'default_code', 'barcode', 'categ_id', 'standard_price', 'list_price',
               'type', 'tracking', 'uom_id', 'product_variant_count'],
    'limit': 5,
    'order': 'default_code'
})
for p in prods:
    print(f"  [{p['default_code']}] {p['name']}")
    print(f"    barcode={p['barcode']} categ={p['categ_id'][1] if p['categ_id'] else '-'}")
    print(f"    prix_achat={p['standard_price']} type={p['type']} tracking={p['tracking']}")
    print(f"    variantes={p['product_variant_count']}")

# Products with multiple variants (barcode shared)
print("\nProduits avec variantes > 1:")
multi = models.execute_kw(DB, uid, PWD, 'product.template', 'search_read', 
    [[['product_variant_count', '>', 1]]], {
    'fields': ['name', 'default_code', 'barcode', 'product_variant_count', 'product_variant_ids'],
    'limit': 5
})
for p in multi:
    print(f"  [{p['default_code']}] {p['name']} — {p['product_variant_count']} variantes")
    print(f"    barcode template: {p['barcode']}")
    # Get variants
    variants = models.execute_kw(DB, uid, PWD, 'product.product', 'read', [p['product_variant_ids']], {
        'fields': ['name', 'default_code', 'barcode', 'product_template_variant_value_ids']
    })
    for v in variants:
        print(f"      var: [{v['default_code']}] {v['name']} barcode={v['barcode']}")

# ===== CLIENTS =====
print("\n" + "=" * 70)
print("CLIENTS — Structure et exemples")
print("=" * 70)

client_fields = models.execute_kw(DB, uid, PWD, 'res.partner', 'fields_get', [], {
    'attributes': ['string', 'type']
})
key_client = ['name', 'ref', 'is_company', 'company_type', 'street', 'city', 'zip',
              'phone', 'mobile', 'email', 'property_product_pricelist',
              'property_payment_term_id', 'category_id',
              'x_zone_livraison', 'x_jour_livraison', 'x_tournee', 'x_groupe_facturation']
print("\nChamps clés client:")
for f in key_client:
    if f in client_fields:
        print(f"  {f}: {client_fields[f]['string']} ({client_fields[f]['type']})")

custom_client = {k: v for k, v in client_fields.items() if k.startswith('x_')}
print(f"\nChamps personnalisés client (x_): {len(custom_client)}")
for k, v in sorted(custom_client.items()):
    print(f"  {k}: {v['string']} ({v['type']})")

# Sample clients
print("\nExemples de clients:")
clients = models.execute_kw(DB, uid, PWD, 'res.partner', 'search_read', 
    [[['is_company', '=', True], ['customer_rank', '>', 0]]], {
    'fields': ['name', 'ref', 'city', 'phone', 'email', 'property_product_pricelist',
               'property_payment_term_id', 'category_id'],
    'limit': 5
})
for c in clients:
    pl = c['property_product_pricelist'][1] if c['property_product_pricelist'] else '-'
    pt = c['property_payment_term_id'][1] if c['property_payment_term_id'] else '-'
    tags = [t for t in (c.get('category_id') or [])]
    print(f"  {c['name']} (ref={c['ref']}) — {c['city']}")
    print(f"    pricelist={pl} payment={pt} tags={tags}")

# ===== FOURNISSEURS =====
print("\n" + "=" * 70)
print("FOURNISSEURS — Structure et exemples")
print("=" * 70)

print("\nExemples de fournisseurs:")
suppliers = models.execute_kw(DB, uid, PWD, 'res.partner', 'search_read', 
    [[['is_company', '=', True], ['supplier_rank', '>', 0]]], {
    'fields': ['name', 'ref', 'city', 'country_id', 'phone', 'email', 'category_id'],
    'limit': 5
})
for s in suppliers:
    country = s['country_id'][1] if s['country_id'] else '-'
    print(f"  {s['name']} (ref={s['ref']}) — {country}")
    print(f"    phone={s['phone']} email={s['email']}")

# Count totals
total_prods = models.execute_kw(DB, uid, PWD, 'product.template', 'search_count', [[]])
total_clients = models.execute_kw(DB, uid, PWD, 'res.partner', 'search_count', 
    [[['is_company', '=', True], ['customer_rank', '>', 0]]])
total_suppliers = models.execute_kw(DB, uid, PWD, 'res.partner', 'search_count', 
    [[['is_company', '=', True], ['supplier_rank', '>', 0]]])
total_variants = models.execute_kw(DB, uid, PWD, 'product.template', 'search_count', 
    [[['product_variant_count', '>', 1]]])

print(f"\n{'=' * 70}")
print(f"TOTAUX: {total_prods} produits, {total_clients} clients, {total_suppliers} fournisseurs")
print(f"Produits avec variantes multiples: {total_variants}")
print(f"{'=' * 70}")
