#!/usr/bin/env python3
"""
Remise à zéro de la base clients sur ah-chou1.odoo.com (instance de test)
Supprime : commandes de vente, pickings, factures, puis clients.

Usage:
  python3 reset_clients.py          # Mode DRY-RUN (affiche sans supprimer)
  python3 reset_clients.py --exec   # Mode exécution réelle
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


def do_action(models, uid, model, method, ids):
    if not ids:
        return True
    try:
        return models.execute_kw(ODOO_DB, uid, ODOO_PASS, model, method, [ids])
    except Exception as e:
        print(f"    ⚠️  {method} sur {model} {ids[:5]}... : {e}")
        return False


def unlink(models, uid, model, ids, label=""):
    if not ids:
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
            print(f"  ❌ Erreur suppression {model} batch {i}: {e}")
            # Essayer un par un
            for single_id in batch:
                try:
                    models.execute_kw(ODOO_DB, uid, ODOO_PASS, model, "unlink", [[single_id]])
                except Exception as e2:
                    print(f"    ⚠️  ID {single_id} non supprimé : {e2}")


def main():
    if DRY_RUN:
        print("=" * 60)
        print("🔍 MODE DRY-RUN — Aucune suppression ne sera effectuée")
        print("   Relancer avec --exec pour exécuter réellement")
        print("=" * 60)
    else:
        print("=" * 60)
        print("🚨 MODE EXÉCUTION — Les données seront SUPPRIMÉES")
        print("=" * 60)

    uid, models = connect()

    # 1. Inventaire des clients
    customers = search(models, uid, "res.partner",
                       [("customer_rank", ">", 0)],
                       ["name", "customer_rank", "ref"])
    customer_ids = [c["id"] for c in customers]
    print(f"\n👥 Clients trouvés : {len(customers)}")
    for c in customers[:10]:
        print(f"   [{c.get('ref', '')}] {c['name']} (id={c['id']})")
    if len(customers) > 10:
        print(f"   ... et {len(customers) - 10} autres")

    # 2. Commandes de vente liées
    sales = search(models, uid, "sale.order", [], ["name", "state", "partner_id"])
    sale_ids = [s["id"] for s in sales]
    print(f"\n📋 Commandes de vente : {len(sales)}")
    for s in sales:
        print(f"   {s['name']} — {s['state']} — {s['partner_id'][1] if s['partner_id'] else '?'}")

    # 3. Pickings / Transferts
    pickings = search(models, uid, "stock.picking", [], ["name", "state", "origin"])
    picking_ids = [p["id"] for p in pickings]
    print(f"\n📦 Pickings/Transferts : {len(pickings)}")
    for p in pickings[:15]:
        print(f"   {p['name']} — {p['state']} — origine: {p.get('origin', '?')}")
    if len(pickings) > 15:
        print(f"   ... et {len(pickings) - 15} autres")

    # 4. Factures
    invoices = search(models, uid, "account.move",
                      [("move_type", "in", ["out_invoice", "out_refund"])],
                      ["name", "state", "partner_id", "move_type"])
    invoice_ids = [i["id"] for i in invoices]
    print(f"\n💰 Factures clients : {len(invoices)}")
    for i in invoices:
        print(f"   {i['name']} — {i['state']} — {i.get('move_type', '')}")

    # 5. Lignes de commande
    sale_lines = search(models, uid, "sale.order.line",
                        [("order_id", "in", sale_ids)] if sale_ids else [("id", "=", 0)],
                        ["id"])
    sale_line_ids = [l["id"] for l in sale_lines]
    print(f"\n📝 Lignes de commande : {len(sale_lines)}")

    # 6. Stock moves
    moves = search(models, uid, "stock.move",
                   [("picking_id", "in", picking_ids)] if picking_ids else [("id", "=", 0)],
                   ["id"])
    move_ids = [m["id"] for m in moves]
    print(f"\n🔄 Mouvements de stock : {len(moves)}")

    print("\n" + "=" * 60)
    print("RÉSUMÉ DE LA SUPPRESSION :")
    print(f"  • {len(sales)} commandes de vente")
    print(f"  • {len(sale_lines)} lignes de commande")
    print(f"  • {len(pickings)} pickings/transferts")
    print(f"  • {len(moves)} mouvements de stock")
    print(f"  • {len(invoices)} factures")
    print(f"  • {len(customers)} clients")
    print("=" * 60)

    if DRY_RUN:
        print("\n🔍 DRY-RUN : rien n'a été supprimé.")
        print("   Pour exécuter : python3 reset_clients.py --exec")
        return

    # --- EXÉCUTION ---
    print("\n🚀 Début de la suppression...")

    # Étape 1 : Annuler les commandes
    print("\n📋 1/6 — Annulation des commandes de vente...")
    for s in sales:
        if s["state"] not in ("cancel", "draft"):
            do_action(models, uid, "sale.order", "action_cancel", [s["id"]])
    # Remettre en brouillon
    draft_sales = search(models, uid, "sale.order", [("state", "=", "cancel")], ["id"])
    for s in draft_sales:
        do_action(models, uid, "sale.order", "action_draft", [s["id"]])

    # Étape 2 : Annuler les pickings
    print("\n📦 2/6 — Annulation des pickings...")
    for p in pickings:
        if p["state"] not in ("cancel", "draft"):
            do_action(models, uid, "stock.picking", "action_cancel", [p["id"]])

    # Étape 3 : Supprimer les mouvements de stock
    print("\n🔄 3/6 — Suppression des mouvements de stock...")
    # Annuler d'abord
    if move_ids:
        do_action(models, uid, "stock.move", "action_cancel", move_ids)
    unlink(models, uid, "stock.move", move_ids, "mouvements de stock")

    # Étape 4 : Supprimer les pickings
    print("\n📦 4/6 — Suppression des pickings...")
    unlink(models, uid, "stock.picking", picking_ids, "pickings")

    # Étape 5 : Supprimer les commandes
    print("\n📋 5/6 — Suppression des commandes de vente...")
    # Re-fetch pour avoir le bon état
    updated_sales = search(models, uid, "sale.order", [], ["id", "state"])
    updated_sale_ids = [s["id"] for s in updated_sales]
    unlink(models, uid, "sale.order", updated_sale_ids, "commandes")

    # Étape 6 : Supprimer les clients
    print("\n👥 6/6 — Suppression des clients...")
    unlink(models, uid, "res.partner", customer_ids, "clients")

    print("\n✅ Remise à zéro terminée !")
    # Vérification
    remaining = search(models, uid, "res.partner",
                       [("customer_rank", ">", 0)], ["id"])
    print(f"   Clients restants : {len(remaining)}")


if __name__ == "__main__":
    main()
