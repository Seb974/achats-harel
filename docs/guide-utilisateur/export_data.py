#!/usr/bin/env python3
"""Export sample data for nomenclature documentation and CSV templates."""
import xmlrpc.client, csv, os

URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USER = "mathieu.loic.hoarau@gmail.com"
PWD = "gbtN0WxuCVjg@g*C"

common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
uid = common.authenticate(DB, USER, PWD, {})
models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

OUT = os.path.dirname(__file__) + "/downloads"
os.makedirs(OUT, exist_ok=True)

# ===== 1. PRODUCTS — full export sample =====
print("Exporting products...")
prod_fields = ['name', 'default_code', 'barcode', 'categ_id', 'standard_price', 'list_price',
               'type', 'tracking', 'use_expiration_date', 'uom_id', 'weight',
               'x_origine', 'x_conditionnement', 'x_gencod', 'x_marque',
               'x_nom_long', 'x_nom_scientifique', 'x_zone_peche', 'x_segment',
               'x_pcb', 'x_poids_brut', 'x_contenu',
               'x_code_interne', 'x_coef_approche', 'x_prix_achat_usd', 'x_taux_usd',
               'x_prix_revient', 'x_prmup', 'x_pv_ttc',
               'x_tarif_t1_ht', 'x_tarif_t2_ht', 'x_tarif_t3_ht',
               'x_tarif_t4_ht', 'x_tarif_t5_ht', 'x_tarif_t6_ht']

prods = models.execute_kw(DB, uid, PWD, 'product.template', 'search_read', [[]], {
    'fields': prod_fields, 'limit': 10, 'order': 'default_code'
})

# Check which custom fields have data
print("\n=== PRODUCT CUSTOM FIELDS USAGE (sur 330 produits) ===")
all_prods = models.execute_kw(DB, uid, PWD, 'product.template', 'search_read', [[]], {
    'fields': [f for f in prod_fields if f.startswith('x_')], 'limit': 330
})
for field in sorted([f for f in prod_fields if f.startswith('x_')]):
    filled = sum(1 for p in all_prods if p.get(field) and p[field] not in [0, 0.0, False, '', None])
    pct = round(filled / len(all_prods) * 100)
    status = "✅ UTILISÉ" if pct > 5 else "❌ VIDE/OBSOLÈTE"
    print(f"  {field}: {filled}/{len(all_prods)} ({pct}%) {status}")

# Write product CSV template
csv_headers_prod = ['default_code', 'name', 'barcode', 'x_gencod', 'categ_id/name',
                    'standard_price', 'type', 'tracking', 'use_expiration_date',
                    'uom_id/name', 'weight', 'x_origine', 'x_conditionnement',
                    'x_marque', 'x_nom_long', 'x_zone_peche', 'x_segment',
                    'x_pcb', 'x_poids_brut', 'x_contenu']
with open(f"{OUT}/trame_import_produits.csv", 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f, delimiter=';')
    w.writerow(csv_headers_prod)
    for p in prods[:5]:
        w.writerow([
            p['default_code'] or '',
            p['name'] or '',
            p['barcode'] or '',
            p.get('x_gencod') or '',
            p['categ_id'][1] if p['categ_id'] else '',
            p['standard_price'] or '',
            p['type'] or '',
            p['tracking'] or '',
            p['use_expiration_date'] or '',
            p['uom_id'][1] if p['uom_id'] else '',
            p['weight'] or '',
            p.get('x_origine') or '',
            p.get('x_conditionnement') or '',
            p.get('x_marque') or '',
            p.get('x_nom_long') or '',
            p.get('x_zone_peche') or '',
            p.get('x_segment') or '',
            p.get('x_pcb') or '',
            p.get('x_poids_brut') or '',
            p.get('x_contenu') or '',
        ])
print(f"  → {OUT}/trame_import_produits.csv")

# ===== 2. CLIENTS =====
print("\nExporting clients...")
# Get all custom fields on res.partner
partner_fields = models.execute_kw(DB, uid, PWD, 'res.partner', 'fields_get', [], {
    'attributes': ['string', 'type']
})
custom_partner = {k: v for k, v in partner_fields.items() if k.startswith('x_')}
print(f"\nChamps personnalisés res.partner: {len(custom_partner)}")
for k, v in sorted(custom_partner.items()):
    print(f"  {k}: {v['string']} ({v['type']})")

client_read_fields = ['name', 'ref', 'is_company', 'street', 'street2', 'city', 'zip',
                      'country_id', 'phone', 'email',
                      'property_product_pricelist', 'property_payment_term_id',
                      'category_id', 'customer_rank']
# Add existing custom fields
for cf in custom_partner:
    client_read_fields.append(cf)

clients = models.execute_kw(DB, uid, PWD, 'res.partner', 'search_read',
    [[['is_company', '=', True], ['customer_rank', '>', 0]]], {
    'fields': client_read_fields, 'limit': 10
})

# Check custom field usage on clients
all_clients = models.execute_kw(DB, uid, PWD, 'res.partner', 'search_read',
    [[['is_company', '=', True], ['customer_rank', '>', 0]]], {
    'fields': list(custom_partner.keys()), 'limit': 500
})
print(f"\n=== CLIENT CUSTOM FIELDS USAGE (sur {len(all_clients)} clients) ===")
for field in sorted(custom_partner.keys()):
    filled = sum(1 for c in all_clients if c.get(field) and c[field] not in [0, 0.0, False, '', None])
    pct = round(filled / max(len(all_clients), 1) * 100)
    status = "✅" if pct > 5 else "❌"
    print(f"  {field}: {filled}/{len(all_clients)} ({pct}%) {status}")

# Write client CSV
csv_headers_client = ['name', 'ref', 'is_company', 'street', 'city', 'zip', 'country_id/name',
                      'phone', 'email', 'property_product_pricelist/name',
                      'property_payment_term_id/name', 'x_groupe_facturation']
with open(f"{OUT}/trame_import_clients.csv", 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f, delimiter=';')
    w.writerow(csv_headers_client)
    for c in clients[:5]:
        w.writerow([
            c['name'] or '',
            c['ref'] or '',
            'True',
            c['street'] or '',
            c['city'] or '',
            c['zip'] or '',
            c['country_id'][1] if c['country_id'] else 'France',
            c['phone'] or '',
            c['email'] or '',
            c['property_product_pricelist'][1] if c['property_product_pricelist'] else '',
            c['property_payment_term_id'][1] if c['property_payment_term_id'] else '',
            c.get('x_groupe_facturation') or '',
        ])
print(f"  → {OUT}/trame_import_clients.csv")

# ===== 3. CONTACTS (persons linked to companies) =====
print("\nExporting contacts...")
contacts = models.execute_kw(DB, uid, PWD, 'res.partner', 'search_read',
    [[['is_company', '=', False], ['parent_id', '!=', False]]], {
    'fields': ['name', 'parent_id', 'function', 'phone', 'email', 'type'],
    'limit': 10
})
csv_headers_contact = ['name', 'parent_id/name', 'type', 'function', 'phone', 'email']
with open(f"{OUT}/trame_import_contacts.csv", 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f, delimiter=';')
    w.writerow(csv_headers_contact)
    for c in contacts[:5]:
        w.writerow([
            c['name'] or '',
            c['parent_id'][1] if c['parent_id'] else '',
            c['type'] or 'contact',
            c['function'] or '',
            c['phone'] or '',
            c['email'] or '',
        ])
    if not contacts:
        w.writerow(['Jean Dupont', 'DISTRINOV', 'contact', 'Directeur', '0262 12 34 56', 'jean@distrinov.re'])
        w.writerow(['Marie Martin', 'DISTRINOV', 'contact', 'Comptable', '0693 45 67 89', 'marie@distrinov.re'])
print(f"  → {OUT}/trame_import_contacts.csv")

# ===== 4. FOURNISSEURS =====
print("\nExporting suppliers...")
suppliers = models.execute_kw(DB, uid, PWD, 'res.partner', 'search_read',
    [[['is_company', '=', True], ['supplier_rank', '>', 0]]], {
    'fields': ['name', 'ref', 'street', 'city', 'zip', 'country_id',
               'phone', 'email', 'category_id'],
    'limit': 10
})

# Get tag names
all_tags = models.execute_kw(DB, uid, PWD, 'res.partner.category', 'search_read', [[]], {
    'fields': ['name'], 'limit': 50
})
tag_map = {t['id']: t['name'] for t in all_tags}
print(f"  Tags disponibles: {[t['name'] for t in all_tags]}")

csv_headers_supplier = ['name', 'ref', 'is_company', 'street', 'city', 'zip', 'country_id/name',
                        'phone', 'email', 'category_id/name']
with open(f"{OUT}/trame_import_fournisseurs.csv", 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f, delimiter=';')
    w.writerow(csv_headers_supplier)
    for s in suppliers[:5]:
        tags = ','.join(tag_map.get(tid, '') for tid in (s['category_id'] or []))
        w.writerow([
            s['name'] or '',
            s['ref'] or '',
            'True',
            s['street'] or '',
            s['city'] or '',
            s['zip'] or '',
            s['country_id'][1] if s['country_id'] else '',
            s['phone'] or '',
            s['email'] or '',
            tags,
        ])
print(f"  → {OUT}/trame_import_fournisseurs.csv")

# ===== 5. PRODUCT VARIANTS — barcode analysis =====
print("\n" + "=" * 70)
print("ANALYSE VARIANTES / BARCODES")
print("=" * 70)
all_v = models.execute_kw(DB, uid, PWD, 'product.product', 'search_read', [[]], {
    'fields': ['name', 'default_code', 'barcode', 'product_tmpl_id',
               'product_template_attribute_value_ids', 'attribute_line_ids'],
    'limit': 500
})
print(f"Total product.product (variants): {len(all_v)}")

# Check x_gencod sharing
all_t = models.execute_kw(DB, uid, PWD, 'product.template', 'search_read', [[]], {
    'fields': ['name', 'default_code', 'barcode', 'x_gencod'],
    'limit': 500
})
gencod_groups = {}
for t in all_t:
    gc = t.get('x_gencod')
    if gc:
        gencod_groups.setdefault(gc, []).append(t)
shared_gencod = {gc: ts for gc, ts in gencod_groups.items() if len(ts) > 1}
print(f"x_gencod uniques: {len(gencod_groups)}")
print(f"x_gencod partagés (>1 produit): {len(shared_gencod)}")
for gc, ts in list(shared_gencod.items())[:5]:
    print(f"\n  Gencod {gc} — {len(ts)} produits:")
    for t in ts:
        print(f"    [{t['default_code']}] {t['name']} (barcode={t['barcode']})")

# Same barcode analysis
barcode_groups = {}
for t in all_t:
    bc = t.get('barcode')
    if bc:
        barcode_groups.setdefault(bc, []).append(t)
shared_bc = {bc: ts for bc, ts in barcode_groups.items() if len(ts) > 1}
print(f"\nbarcode uniques: {len(barcode_groups)}")
print(f"barcode partagés (>1 template): {len(shared_bc)}")
for bc, ts in list(shared_bc.items())[:5]:
    print(f"\n  Barcode {bc} — {len(ts)} produits:")
    for t in ts:
        print(f"    [{t['default_code']}] {t['name']} (x_gencod={t.get('x_gencod')})")

# Check attribute lines
attrs = models.execute_kw(DB, uid, PWD, 'product.attribute', 'search_read', [[]], {
    'fields': ['name', 'create_variant'], 'limit': 20
})
print(f"\nAttributs de variantes: {attrs}")

print("\nDone!")
