#!/usr/bin/env python3
"""Set Direction (Paul Pieuvre) to admin profile, and verify all user rights."""
import xmlrpc.client

URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USER = "mathieu.loic.hoarau@gmail.com"
PWD = "gbtN0WxuCVjg@g*C"

common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
uid = common.authenticate(DB, USER, PWD, {})
models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

# Find res.users fields
print("=== res.users group field ===")
uf = models.execute_kw(DB, uid, PWD, 'res.users', 'fields_get', [], {'attributes': ['string', 'type']})
group_fields = {k: v for k, v in uf.items() if 'group' in k.lower() or 'role' in k.lower()}
for k, v in sorted(group_fields.items()):
    print(f"  {k}: {v['string']} ({v['type']})")

# Find all group IDs by xml_id
print("\n=== Finding groups by xml_id ===")
xml_ids = [
    'sales_team.group_sale_salesman',
    'sales_team.group_sale_salesman_all_leads',
    'sales_team.group_sale_manager',
    'purchase.group_purchase_user',
    'purchase.group_purchase_manager',
    'stock.group_stock_user',
    'stock.group_stock_manager',
    'account.group_account_readonly',
    'account.group_account_invoice',
    'account.group_account_user',
    'account.group_account_manager',
    'base.group_system',
    'base.group_erp_manager',
]

group_map = {}
for xid in xml_ids:
    module, name = xid.split('.')
    refs = models.execute_kw(DB, uid, PWD, 'ir.model.data', 'search_read', [
        [['module', '=', module], ['name', '=', name], ['model', '=', 'res.groups']]
    ], {'fields': ['res_id'], 'limit': 1})
    if refs:
        gid = refs[0]['res_id']
        grp = models.execute_kw(DB, uid, PWD, 'res.groups', 'read', [[gid]], {'fields': ['name']})
        group_map[xid] = gid
        print(f"  {xid} → ID={gid} ({grp[0]['name']})")
    else:
        print(f"  {xid} → NOT FOUND")

# Find users
print("\n=== Test users ===")
logins = ['paul.pieuvre@ahchou.re', 'sarah.dine@ahchou.re', 'sam.oussah@ahchou.re',
          'gilles.merou@ahchou.re', 'marc.hareng@ahchou.re']
test_users = models.execute_kw(DB, uid, PWD, 'res.users', 'search_read',
    [[['login', 'in', logins]]], {
    'fields': ['name', 'login', 'group_ids']
})
for u in test_users:
    print(f"\n  {u['name']} ({u['login']}) — user_id={u['id']}")
    if u.get('group_ids'):
        grps = models.execute_kw(DB, uid, PWD, 'res.groups', 'read', [u['group_ids']], {'fields': ['name']})
        for g in sorted(grps, key=lambda x: x['name']):
            if any(kw in g['name'].lower() for kw in ['sale', 'vente', 'purchase', 'achat', 'stock', 'inventa',
                                                        'account', 'compta', 'factur', 'admin', 'system', 'access', 'settings']):
                print(f"    [{g['id']}] {g['name']}")

print("\nDone!")
