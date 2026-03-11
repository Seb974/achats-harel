#!/usr/bin/env python3
"""
Find and disable quotation-related settings in Odoo saas-19.1 (v18).
"""
import xmlrpc.client

URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USER = "mathieu.loic.hoarau@gmail.com"
PWD = "gbtN0WxuCVjg@g*C"

common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
uid = common.authenticate(DB, USER, PWD, {})
models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

# List all sale-related fields in res.config.settings
print("=== Sale-related config settings fields ===")
try:
    fields = models.execute_kw(DB, uid, PWD, 'res.config.settings', 'fields_get', [], {
        'attributes': ['string', 'type']
    })
    sale_fields = {k: v for k, v in fields.items() if any(
        term in k.lower() for term in ['quot', 'sale', 'order', 'confirm']
    )}
    for fname, finfo in sorted(sale_fields.items()):
        print(f"  {fname}: {finfo['string']} ({finfo['type']})")
except Exception as e:
    print(f"Error: {e}")

# Check sale.order fields related to quotation
print("\n=== Sale order quotation-related fields ===")
try:
    so_fields = models.execute_kw(DB, uid, PWD, 'sale.order', 'fields_get', [], {
        'attributes': ['string', 'type']
    })
    quot_fields = {k: v for k, v in so_fields.items() if any(
        term in k.lower() for term in ['quot', 'template', 'valid', 'lock']
    )}
    for fname, finfo in sorted(quot_fields.items()):
        print(f"  {fname}: {finfo['string']} ({finfo['type']})")
except Exception as e:
    print(f"Error: {e}")
