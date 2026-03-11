#!/usr/bin/env python3
"""
Suppression des fournisseurs sur ah-chou1.odoo.com (instance de test)
Usage:
  python3 reset_fournisseurs.py          # DRY-RUN
  python3 reset_fournisseurs.py --exec   # Exécution réelle
"""

import xmlrpc.client
import sys

ODOO_URL = "https://ah-chou1.odoo.com"
ODOO_DB = "ah-chou1"
ODOO_USER = "mathieu.loic.hoarau@gmail.com"
ODOO_PASS = "gbtN0WxuCVjg@g*C"

DRY_RUN = "--exec" not in sys.argv


def connect():
    common = xmlrpc.client.ServerProxy(f"{ODOO_URL}/xmlrpc/2/common")
    uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASS, {})
    if not uid:
        raise Exception("Authentification échouée")
    models = xmlrpc.client.ServerProxy(f"{ODOO_URL}/xmlrpc/2/object")
    print(f"✅ Connecté (uid={uid})")
    return uid, models


def search(models, uid, model, domain, fields=None, limit=None):
    kwargs = {}
    if fields:
        kwargs["fields"] = fields
    if limit:
        kwargs["limit"] = limit
    return models.execute_kw(ODOO_DB, uid, ODOO_PASS, model, "search_read", [domain], kwargs)


def unlink(models, uid, model, ids, label=""):
    if not ids:
        print(f"  Rien à supprimer ({label or model})")
        return
    if DRY_RUN:
        print(f"  [DRY-RUN] Supprimerait {len(ids)} {label or model}")
        return
    batch_size = 50
    for i in range(0, len(ids), batch_size):
        batch = ids[i:i + batch_size]
        try:
            models.execute_kw(ODOO_DB, uid, ODOO_PASS, model, "unlink", [batch])
            print(f"  ✅ Supprimé {len(batch)} {label or model} ({i + len(batch)}/{len(ids)})")
        except Exception as e:
            print(f"  ❌ Erreur batch : {e}")
            for single_id in batch:
                try:
                    models.execute_kw(ODOO_DB, uid, ODOO_PASS, model, "unlink", [[single_id]])
                except Exception as e2:
                    print(f"    ⚠️  ID {single_id} non supprimé : {e2}")


def main():
    if DRY_RUN:
        print("🔍 MODE DRY-RUN")
    else:
        print("🚨 MODE EXÉCUTION")

    uid, models = connect()

    # 1. Fournisseurs (supplier_rank > 0)
    suppliers = search(models, uid, "res.partner",
                       [("supplier_rank", ">", 0)],
                       ["name", "supplier_rank", "ref", "customer_rank"])
    supplier_ids = [s["id"] for s in suppliers]
    print(f"\n🏭 Fournisseurs (supplier_rank > 0) : {len(suppliers)}")
    for s in suppliers:
        flag = " (aussi client)" if s.get("customer_rank", 0) > 0 else ""
        print(f"   [{s.get('ref', '')}] {s['name']} (id={s['id']}){flag}")

    # 2. Catégories de partenaires (res.partner.category = tags)
    categories = search(models, uid, "res.partner.category", [],
                        ["name", "parent_id", "partner_ids"])
    cat_ids = [c["id"] for c in categories]
    print(f"\n🏷️ Catégories/Tags partenaires : {len(categories)}")
    for c in categories:
        nb = len(c.get("partner_ids", []))
        parent = f" (parent: {c['parent_id'][1]})" if c.get("parent_id") else ""
        print(f"   {c['name']}{parent} — {nb} partenaires (id={c['id']})")

    # 3. Contacts restants (ni client ni fournisseur, hors société et admin)
    others = search(models, uid, "res.partner",
                    [("customer_rank", "=", 0), ("supplier_rank", "=", 0),
                     ("is_company", "=", True), ("id", ">", 3)],
                    ["name", "ref"])
    print(f"\n👤 Autres sociétés (ni client ni fournisseur) : {len(others)}")
    for o in others[:10]:
        print(f"   [{o.get('ref', '')}] {o['name']} (id={o['id']})")

    # Résumé
    print(f"\n{'=' * 60}")
    print(f"RÉSUMÉ :")
    print(f"  • {len(suppliers)} fournisseurs")
    print(f"  • {len(categories)} catégories/tags")
    print(f"  • {len(others)} autres sociétés")
    print(f"{'=' * 60}")

    if DRY_RUN:
        print("\n🔍 DRY-RUN terminé. Relancer avec --exec pour supprimer.")
        return

    # Suppression
    print("\n🏭 1/3 — Suppression des fournisseurs...")
    unlink(models, uid, "res.partner", supplier_ids, "fournisseurs")

    print("\n🏷️ 2/3 — Suppression des catégories/tags...")
    unlink(models, uid, "res.partner.category", cat_ids, "catégories")

    print("\n👤 3/3 — Suppression des autres sociétés...")
    other_ids = [o["id"] for o in others]
    unlink(models, uid, "res.partner", other_ids, "autres sociétés")

    # Vérification
    remaining_s = search(models, uid, "res.partner", [("supplier_rank", ">", 0)], ["id"])
    remaining_c = search(models, uid, "res.partner.category", [], ["id"])
    print(f"\n✅ Terminé !")
    print(f"   Fournisseurs restants : {len(remaining_s)}")
    print(f"   Catégories restantes : {len(remaining_c)}")


if __name__ == "__main__":
    main()
