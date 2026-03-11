#!/usr/bin/env python3
"""Verify warehouse config and pickings for S00009."""
import xmlrpc.client

URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USER = "mathieu.loic.hoarau@gmail.com"
PWD = "gbtN0WxuCVjg@g*C"

common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
uid = common.authenticate(DB, USER, PWD, {})
models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

print("=" * 60)
print("1. WAREHOUSE CONFIG")
print("=" * 60)
wh = models.execute_kw(DB, uid, PWD, 'stock.warehouse', 'search_read', [[['code', '=', 'WH']]], {
    'fields': ['name', 'delivery_steps', 'reception_steps', 'pick_type_id', 'out_type_id']
})
for w in wh:
    print(f"  {w['name']}")
    print(f"  delivery_steps: {w['delivery_steps']}")
    print(f"  reception_steps: {w['reception_steps']}")
    print(f"  pick_type_id: {w['pick_type_id']}")
    print(f"  out_type_id: {w['out_type_id']}")

print("\n" + "=" * 60)
print("2. PICKING TYPES")
print("=" * 60)
pts = models.execute_kw(DB, uid, PWD, 'stock.picking.type', 'search_read', 
    [[['warehouse_id', '!=', False]]], {
    'fields': ['name', 'code', 'sequence_code', 'default_location_src_id', 'default_location_dest_id', 'active'],
})
for pt in pts:
    src = pt['default_location_src_id'][1] if pt['default_location_src_id'] else '-'
    dst = pt['default_location_dest_id'][1] if pt['default_location_dest_id'] else '-'
    active = "✅" if pt['active'] else "❌"
    print(f"  {active} {pt['name']} (code={pt['code']}, seq={pt['sequence_code']})")
    print(f"     {src} → {dst}")

print("\n" + "=" * 60)
print("3. SALE ORDER S00009 — PICKINGS")
print("=" * 60)
# Find the sale order
so = models.execute_kw(DB, uid, PWD, 'sale.order', 'search_read', 
    [[['name', '=', 'S00009']]], {
    'fields': ['name', 'state', 'picking_ids', 'partner_id', 'date_order']
})
if so:
    s = so[0]
    print(f"  Order: {s['name']} — state={s['state']} — client={s['partner_id'][1]}")
    print(f"  date: {s['date_order']}")
    print(f"  picking_ids: {s['picking_ids']}")
    
    if s['picking_ids']:
        pickings = models.execute_kw(DB, uid, PWD, 'stock.picking', 'read', [s['picking_ids']], {
            'fields': ['name', 'state', 'picking_type_id', 'location_id', 'location_dest_id', 'origin']
        })
        for p in pickings:
            pt_name = p['picking_type_id'][1] if p['picking_type_id'] else '-'
            src = p['location_id'][1] if p['location_id'] else '-'
            dst = p['location_dest_id'][1] if p['location_dest_id'] else '-'
            print(f"\n  Picking: {p['name']}")
            print(f"    type: {pt_name}")
            print(f"    state: {p['state']}")
            print(f"    {src} → {dst}")
    else:
        print("  No pickings linked!")
else:
    print("  S00009 not found!")

print("\n" + "=" * 60)
print("4. ALL RECENT PICKINGS")
print("=" * 60)
all_picks = models.execute_kw(DB, uid, PWD, 'stock.picking', 'search_read', 
    [[['create_date', '>=', '2026-03-11']]], {
    'fields': ['name', 'state', 'picking_type_id', 'location_id', 'location_dest_id', 'origin'],
    'order': 'create_date desc',
    'limit': 10
})
for p in all_picks:
    pt_name = p['picking_type_id'][1] if p['picking_type_id'] else '-'
    src = p['location_id'][1] if p['location_id'] else '-'
    dst = p['location_dest_id'][1] if p['location_dest_id'] else '-'
    print(f"  {p['name']} ({pt_name}) state={p['state']} origin={p['origin']}")
    print(f"    {src} → {dst}")

# Check routes
print("\n" + "=" * 60)
print("5. STOCK ROUTES (delivery)")
print("=" * 60)
routes = models.execute_kw(DB, uid, PWD, 'stock.route', 'search_read', [[]], {
    'fields': ['name', 'active', 'sale_selectable', 'warehouse_ids'],
    'limit': 20
})
for r in routes:
    active = "✅" if r['active'] else "❌"
    sale = "sale" if r['sale_selectable'] else ""
    print(f"  {active} {r['name']} (warehouses={r['warehouse_ids']}) {sale}")

# Check rules for the delivery route
print("\n" + "=" * 60)
print("6. STOCK RULES for delivery")
print("=" * 60)
rules = models.execute_kw(DB, uid, PWD, 'stock.rule', 'search_read', 
    [[['route_id.name', 'ilike', 'deliver']]], {
    'fields': ['name', 'action', 'picking_type_id', 'location_src_id', 'location_dest_id', 'route_id'],
    'limit': 20
})
if not rules:
    rules = models.execute_kw(DB, uid, PWD, 'stock.rule', 'search_read', 
        [[['route_id.name', 'ilike', 'AH CHOU']]], {
        'fields': ['name', 'action', 'picking_type_id', 'location_src_id', 'location_dest_id', 'route_id'],
        'limit': 20
    })
for r in rules:
    pt = r['picking_type_id'][1] if r['picking_type_id'] else '-'
    src = r['location_src_id'][1] if r['location_src_id'] else '-'
    dst = r['location_dest_id'][1] if r['location_dest_id'] else '-'
    route = r['route_id'][1] if r['route_id'] else '-'
    print(f"  {r['name']} (action={r['action']})")
    print(f"    route: {route}")
    print(f"    picking_type: {pt}")
    print(f"    {src} → {dst}")

print("\nDone!")
