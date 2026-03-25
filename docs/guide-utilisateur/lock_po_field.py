#!/usr/bin/env python3
"""
Script to create custom fields on purchase.order and purchase.order.line in Odoo via XML-RPC.

Fields created:
  - purchase.order: x_locked_by_app (boolean) — marks POs created by the app
  - purchase.order: x_devise_achat (char) — original purchase currency
  - purchase.order.line: x_prix_achat_devise (float) — unit price in original currency
  - purchase.order.line: x_devise_origine (char) — original currency code

Usage:
  python3 lock_po_field.py                           # uses defaults below
  python3 lock_po_field.py --api-key <YOUR_API_KEY>  # override the API key
  ODOO_API_KEY=xxx python3 lock_po_field.py          # or via env var
"""

import argparse
import os
import xmlrpc.client

URL = "https://ah-chou1.odoo.com"
DB = "ah-chou1"
USERNAME = "mathieu.loic.hoarau@gmail.com"
DEFAULT_PASSWORD = "gbtN0WxuCVjg@g*C"

FIELDS_TO_CREATE = [
    {
        "model": "purchase.order",
        "name": "x_locked_by_app",
        "field_type": "boolean",
        "field_description": "Verrouillé par l'application",
    },
    {
        "model": "purchase.order",
        "name": "x_devise_achat",
        "field_type": "char",
        "field_description": "Devise d'achat d'origine",
        "size": 6,
    },
    {
        "model": "purchase.order.line",
        "name": "x_prix_achat_devise",
        "field_type": "float",
        "field_description": "Prix d'achat unitaire (devise origine)",
    },
    {
        "model": "purchase.order.line",
        "name": "x_devise_origine",
        "field_type": "char",
        "field_description": "Devise d'origine de l'achat",
        "size": 6,
    },
]


def main():
    parser = argparse.ArgumentParser(description="Create custom Odoo fields via XML-RPC")
    parser.add_argument("--api-key", default=None, help="Odoo API key (overrides env/default)")
    args = parser.parse_args()

    password = args.api_key or os.environ.get("ODOO_API_KEY") or DEFAULT_PASSWORD

    common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
    uid = common.authenticate(DB, USERNAME, password, {})
    if not uid:
        print("ERROR: Authentication failed.")
        print("  Odoo.com SaaS requires an API key (not the web password) for XML-RPC.")
        print("  Generate one at: Odoo → Settings → Users → API Keys")
        print("  Then run:  python3 lock_po_field.py --api-key <YOUR_KEY>")
        return

    print(f"Authenticated as uid={uid}")
    models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

    for field_def in FIELDS_TO_CREATE:
        model = field_def["model"]
        name = field_def["name"]

        existing = models.execute_kw(
            DB, uid, password,
            "ir.model.fields", "search_read",
            [[
                ("model", "=", model),
                ("name", "=", name),
            ]],
            {"fields": ["id", "name", "field_description"], "limit": 1},
        )

        if existing:
            print(f"SKIP  {model}.{name} — already exists (id={existing[0]['id']})")
            continue

        model_ids = models.execute_kw(
            DB, uid, password,
            "ir.model", "search",
            [[("model", "=", model)]],
        )
        if not model_ids:
            print(f"ERROR model '{model}' not found in ir.model")
            continue

        vals = {
            "model_id": model_ids[0],
            "name": name,
            "field_description": field_def["field_description"],
            "ttype": field_def["field_type"],
            "store": True,
        }
        if field_def["field_type"] == "char" and "size" in field_def:
            vals["size"] = field_def["size"]

        try:
            new_id = models.execute_kw(
                DB, uid, password,
                "ir.model.fields", "create",
                [vals],
            )
            print(f"OK    {model}.{name} created (id={new_id})")
        except Exception as exc:
            print(f"ERROR creating {model}.{name}: {exc}")

    print("\nDone.")


if __name__ == "__main__":
    main()
