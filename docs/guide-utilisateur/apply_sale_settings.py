#!/usr/bin/env python3
"""
Disable quotation stage in Odoo:
- No quotation validity (skip devis expiration)
- No online signature/payment required
- No quotation templates
- Set sale orders to lock on confirm
"""
import xmlrpc.client

URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USER = "mathieu.loic.hoarau@gmail.com"
PWD = "gbtN0WxuCVjg@g*C"

common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
uid = common.authenticate(DB, USER, PWD, {})
models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

print("=== Applying sale settings ===")

settings_vals = {
    'quotation_validity_days': 0,
    'portal_confirmation_sign': False,
    'portal_confirmation_pay': False,
    'group_sale_order_template': False,
}

try:
    settings_id = models.execute_kw(DB, uid, PWD, 'res.config.settings', 'create', [settings_vals])
    print(f"Settings record created: {settings_id}")
    models.execute_kw(DB, uid, PWD, 'res.config.settings', 'execute', [[settings_id]])
    print("Settings applied successfully!")
except Exception as e:
    print(f"Error applying settings: {e}")

# Verify
print("\n=== Verification ===")
try:
    vals = models.execute_kw(DB, uid, PWD, 'res.config.settings', 'create', [{}])
    current = models.execute_kw(DB, uid, PWD, 'res.config.settings', 'read', [[vals]], {
        'fields': ['quotation_validity_days', 'portal_confirmation_sign', 
                   'portal_confirmation_pay', 'group_sale_order_template']
    })
    print(f"quotation_validity_days: {current[0]['quotation_validity_days']}")
    print(f"portal_confirmation_sign: {current[0]['portal_confirmation_sign']}")
    print(f"portal_confirmation_pay: {current[0]['portal_confirmation_pay']}")
    print(f"group_sale_order_template: {current[0]['group_sale_order_template']}")
except Exception as e:
    print(f"Verification error: {e}")

# Final check: warehouse delivery steps
print("\n=== Warehouse final state ===")
wh = models.execute_kw(DB, uid, PWD, 'stock.warehouse', 'search_read', [[['code', '=', 'WH']]], {
    'fields': ['name', 'delivery_steps', 'reception_steps', 'pick_type_id', 'out_type_id']
})
for w in wh:
    print(f"  {w['name']}: delivery={w['delivery_steps']}, reception={w['reception_steps']}")
    print(f"  pick_type: {w['pick_type_id']}")
    print(f"  out_type: {w['out_type_id']}")

# Show picking types with the new Pick
print("\n=== All picking types ===")
pts = models.execute_kw(DB, uid, PWD, 'stock.picking.type', 'search_read', 
    [[['warehouse_id', '!=', False]]], {
    'fields': ['name', 'code', 'sequence_code', 'default_location_src_id', 'default_location_dest_id'],
})
for pt in pts:
    src = pt['default_location_src_id'][1] if pt['default_location_src_id'] else '-'
    dst = pt['default_location_dest_id'][1] if pt['default_location_dest_id'] else '-'
    print(f"  {pt['name']} ({pt['sequence_code']}) : {src} → {dst}")

print("\nDone!")
