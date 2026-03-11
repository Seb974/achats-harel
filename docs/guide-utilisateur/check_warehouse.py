#!/usr/bin/env python3
"""Check warehouse delivery steps configuration in Odoo."""
import xmlrpc.client

URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USER = "mathieu.loic.hoarau@gmail.com"
PWD = "gbtN0WxuCVjg@g*C"

common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
uid = common.authenticate(DB, USER, PWD, {})
models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

# Warehouse config
warehouses = models.execute_kw(DB, uid, PWD, 'stock.warehouse', 'search_read', [[]], {
    'fields': ['name', 'code', 'delivery_steps', 'reception_steps'],
    'limit': 10
})
print("=== WAREHOUSES ===")
for wh in warehouses:
    print(f"  {wh['name']} ({wh['code']})")
    print(f"    delivery_steps: {wh['delivery_steps']}")
    print(f"    reception_steps: {wh['reception_steps']}")

# Picking types
pick_types = models.execute_kw(DB, uid, PWD, 'stock.picking.type', 'search_read', [[]], {
    'fields': ['name', 'code', 'sequence_code', 'warehouse_id', 'default_location_src_id', 'default_location_dest_id'],
    'limit': 20
})
print("\n=== PICKING TYPES ===")
for pt in pick_types:
    wh_name = pt['warehouse_id'][1] if pt['warehouse_id'] else 'N/A'
    src = pt['default_location_src_id'][1] if pt['default_location_src_id'] else 'N/A'
    dst = pt['default_location_dest_id'][1] if pt['default_location_dest_id'] else 'N/A'
    print(f"  {pt['name']} (code={pt['code']}, seq={pt['sequence_code']})")
    print(f"    warehouse: {wh_name}")
    print(f"    {src} → {dst}")
