#!/usr/bin/env python3
"""Check all recent sale orders and their pickings."""
import xmlrpc.client

URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USER = "mathieu.loic.hoarau@gmail.com"
PWD = "gbtN0WxuCVjg@g*C"

common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
uid = common.authenticate(DB, USER, PWD, {})
models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

print("=" * 60)
print("TOUTES LES COMMANDES DE VENTE RÉCENTES")
print("=" * 60)
orders = models.execute_kw(DB, uid, PWD, 'sale.order', 'search_read', [[]], {
    'fields': ['name', 'state', 'picking_ids', 'partner_id', 'date_order', 'create_date'],
    'order': 'create_date desc',
    'limit': 10
})

for s in orders:
    print(f"\n  {s['name']} — état={s['state']} — client={s['partner_id'][1] if s['partner_id'] else 'N/A'}")
    print(f"  créé: {s['create_date']} — date commande: {s['date_order']}")
    print(f"  picking_ids: {s['picking_ids']}")
    
    if s['picking_ids']:
        pickings = models.execute_kw(DB, uid, PWD, 'stock.picking', 'read', [s['picking_ids']], {
            'fields': ['name', 'state', 'picking_type_id', 'location_id', 'location_dest_id']
        })
        for p in pickings:
            pt_name = p['picking_type_id'][1] if p['picking_type_id'] else '-'
            src = p['location_id'][1] if p['location_id'] else '-'
            dst = p['location_dest_id'][1] if p['location_dest_id'] else '-'
            print(f"    → {p['name']} ({pt_name}) état={p['state']}")
            print(f"      {src} → {dst}")
    else:
        print(f"    → Aucun picking (commande en brouillon ?)")

print("\n" + "=" * 60)
print("TOUS LES PICKINGS EXISTANTS")
print("=" * 60)
all_picks = models.execute_kw(DB, uid, PWD, 'stock.picking', 'search_read', [[]], {
    'fields': ['name', 'state', 'picking_type_id', 'location_id', 'location_dest_id', 'origin', 'create_date'],
    'order': 'create_date desc',
    'limit': 15
})
for p in all_picks:
    pt_name = p['picking_type_id'][1] if p['picking_type_id'] else '-'
    src = p['location_id'][1] if p['location_id'] else '-'
    dst = p['location_dest_id'][1] if p['location_dest_id'] else '-'
    print(f"  {p['name']} ({pt_name}) état={p['state']} origin={p['origin']} date={p['create_date']}")
    print(f"    {src} → {dst}")

print("\nDone!")
