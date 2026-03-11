#!/usr/bin/env python3
"""
Apply access rights matrix:
  Admin (Mathieu)     : Ventes=Complet  Achats=Complet     Stock=Complet     Compta=Complet
  Commercial (Sarah,Sam): Ventes=Ses docs Achats=Non       Stock=Non         Compta=Non
  Direction (Paul)    : Ventes=Ses docs Achats=Utilisateur Stock=Utilisateur Compta=Lecture
  Comptable (Gilles)  : Ventes=Tous docs Achats=Utilisateur Stock=Utilisateur Compta=Complet
  Logistique (Marc)   : Ventes=Non      Achats=Non         Stock=Complet     Compta=Non
"""
import xmlrpc.client

URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USER = "mathieu.loic.hoarau@gmail.com"
PWD = "gbtN0WxuCVjg@g*C"

common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
uid = common.authenticate(DB, USER, PWD, {})
models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

# Group IDs (from previous discovery)
G = {
    'sale_own':      35,  # Sales: User: Own Documents Only
    'sale_all':      36,  # Sales: User: All Documents
    'sale_admin':    37,  # Sales: Administrator
    'purchase_user': 60,  # Purchase: User
    'purchase_admin':61,  # Purchase: Administrator
    'stock_user':    64,  # Stock: User
    'stock_admin':   65,  # Stock: Administrator
    'account_read':  24,  # Account: Read-only
    'account_invoice':25, # Account: Invoicing
    'account_user':  27,  # Account: Bookkeeper
    'account_admin': 28,  # Account: Administrator
    'system_admin':  4,   # Settings / Administrator
    'access_rights': 2,   # Access Rights
}

# All sale/purchase/stock/account groups to clear before setting
ALL_GROUPS = [35, 36, 37, 60, 61, 64, 65, 24, 25, 27, 28]

# User IDs
USERS = {
    'paul':   7,   # Direction
    'sarah':  5,   # Commercial
    'sam':    6,   # Commercial
    'gilles': 8,   # Comptable
    'marc':   9,   # Logistique
}

# Rights matrix: user -> groups to ADD
RIGHTS = {
    'paul':   [G['sale_own'], G['purchase_user'], G['stock_user'], G['account_read']],
    'sarah':  [G['sale_own']],
    'sam':    [G['sale_own']],
    'gilles': [G['sale_all'], G['purchase_user'], G['stock_user'], G['account_admin']],
    'marc':   [G['stock_admin']],
}

for username, user_id in USERS.items():
    desired = RIGHTS[username]
    to_remove = [g for g in ALL_GROUPS if g not in desired]
    
    print(f"\n{'='*50}")
    print(f"Configuring {username} (user_id={user_id})")
    print(f"  Adding groups: {desired}")
    print(f"  Removing groups: {to_remove}")
    
    # Remove unwanted groups (4 = unlink)
    # Add wanted groups (4 = link is wrong, 6 = set, 3 = unlink)
    # Use (3, id) to remove and (4, id) to add
    cmds = []
    for gid in to_remove:
        cmds.append((3, gid))  # Remove
    for gid in desired:
        cmds.append((4, gid))  # Add
    
    try:
        result = models.execute_kw(DB, uid, PWD, 'res.users', 'write', [[user_id], {
            'group_ids': cmds
        }])
        print(f"  Result: {result}")
    except Exception as e:
        print(f"  ERROR: {e}")

# Verify
print(f"\n{'='*60}")
print("VERIFICATION")
print(f"{'='*60}")

for username, user_id in USERS.items():
    user = models.execute_kw(DB, uid, PWD, 'res.users', 'read', [[user_id]], {
        'fields': ['name', 'group_ids']
    })
    grps = models.execute_kw(DB, uid, PWD, 'res.groups', 'read', [user[0]['group_ids']], {
        'fields': ['id', 'name']
    })
    print(f"\n  {user[0]['name']}:")
    for g in sorted(grps, key=lambda x: x['name']):
        if g['id'] in ALL_GROUPS:
            print(f"    ✅ [{g['id']}] {g['name']}")

print("\nDone!")
