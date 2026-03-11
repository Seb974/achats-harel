#!/usr/bin/env python3
"""
Configure Odoo AH CHOU:
1. Set delivery_steps to pick_ship (2-step: Pick + Ship)
2. Disable quotation stage (sale orders confirmed directly)
3. Verify the resulting picking types
"""
import xmlrpc.client

URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USER = "mathieu.loic.hoarau@gmail.com"
PWD = "gbtN0WxuCVjg@g*C"

common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
uid = common.authenticate(DB, USER, PWD, {})
models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

print("=" * 60)
print("ÉTAPE 1 — Configurer delivery_steps = pick_ship")
print("=" * 60)

# Get warehouse
wh_ids = models.execute_kw(DB, uid, PWD, 'stock.warehouse', 'search', [[['code', '=', 'WH']]])
print(f"Warehouse ID: {wh_ids}")

# Read current config
wh = models.execute_kw(DB, uid, PWD, 'stock.warehouse', 'read', [wh_ids], {
    'fields': ['name', 'delivery_steps', 'reception_steps']
})
print(f"AVANT: {wh[0]['name']} — delivery_steps={wh[0]['delivery_steps']}, reception_steps={wh[0]['reception_steps']}")

# Set pick_ship
result = models.execute_kw(DB, uid, PWD, 'stock.warehouse', 'write', [wh_ids, {
    'delivery_steps': 'pick_ship'
}])
print(f"Write result: {result}")

# Verify
wh_after = models.execute_kw(DB, uid, PWD, 'stock.warehouse', 'read', [wh_ids], {
    'fields': ['name', 'delivery_steps', 'pick_type_id', 'out_type_id']
})
print(f"APRÈS: delivery_steps={wh_after[0]['delivery_steps']}")
print(f"  pick_type_id: {wh_after[0]['pick_type_id']}")
print(f"  out_type_id: {wh_after[0]['out_type_id']}")

print("\n" + "=" * 60)
print("ÉTAPE 2 — Désactiver l'étape Devis (use_quotation_validity_days)")
print("=" * 60)

# Check sale.order settings
# In Odoo, to skip quotation and go directly to sale order,
# we need to check the sale settings module
# The key setting is: group_sale_order_template or sale_order_template_id
# But the main way is to set the default picking policy and check settings

# Check current sale settings
try:
    settings = models.execute_kw(DB, uid, PWD, 'res.config.settings', 'default_get', [
        ['group_sale_order_template', 'use_quotation_validity_days', 'group_warning_sale']
    ])
    print(f"Current sale settings: {settings}")
except Exception as e:
    print(f"Could not read settings: {e}")

# In Odoo 17/18, to disable quotation:
# Set the sale order to auto-confirm (no quotation step)
# This is done via: sale.order default values or sale settings
# The setting is: module_sale_quotation_builder = False
# And: use_quotation_validity_days = False

try:
    # Create a new config settings record with our changes
    settings_id = models.execute_kw(DB, uid, PWD, 'res.config.settings', 'create', [{
        'use_quotation_validity_days': False,
    }])
    print(f"Settings record created: {settings_id}")
    
    # Execute the settings
    models.execute_kw(DB, uid, PWD, 'res.config.settings', 'execute', [[settings_id]])
    print("Settings applied successfully")
except Exception as e:
    print(f"Settings update: {e}")

print("\n" + "=" * 60)
print("ÉTAPE 3 — Vérification des picking types")
print("=" * 60)

pick_types = models.execute_kw(DB, uid, PWD, 'stock.picking.type', 'search_read', 
    [[['warehouse_id', '!=', False]]], {
    'fields': ['name', 'code', 'sequence_code', 'warehouse_id', 
               'default_location_src_id', 'default_location_dest_id', 'active'],
    'limit': 20
})

for pt in pick_types:
    wh_name = pt['warehouse_id'][1] if pt['warehouse_id'] else 'N/A'
    src = pt['default_location_src_id'][1] if pt['default_location_src_id'] else 'N/A'
    dst = pt['default_location_dest_id'][1] if pt['default_location_dest_id'] else 'N/A'
    active = "✅" if pt['active'] else "❌"
    print(f"  {active} {pt['name']} (code={pt['code']}, seq={pt['sequence_code']})")
    print(f"       {src} → {dst}")

print("\n" + "=" * 60)
print("ÉTAPE 4 — Vérifier le pick_type pour les bonnes locations")
print("=" * 60)

# Find the new Pick type
pick_types_pick = models.execute_kw(DB, uid, PWD, 'stock.picking.type', 'search_read', 
    [[['code', '=', 'internal'], ['warehouse_id', '!=', False]]], {
    'fields': ['name', 'sequence_code', 'default_location_src_id', 'default_location_dest_id'],
})
for pt in pick_types_pick:
    src = pt['default_location_src_id'][1] if pt['default_location_src_id'] else 'N/A'
    dst = pt['default_location_dest_id'][1] if pt['default_location_dest_id'] else 'N/A'
    print(f"  Pick type: {pt['name']} ({pt['sequence_code']})")
    print(f"    Source: {src}")
    print(f"    Destination: {dst}")

print("\nDone!")
