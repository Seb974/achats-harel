# Contexte Ops & Debug — Achats Harel 4.0

Référence opérationnelle pour le déploiement, le debug et la maintenance.
Ce fichier ne contient pas de secrets — les credentials Odoo sont dans l'entité `Client` en base.

## Serveurs

| Environnement | URL publique | IP | SSH | Répertoire |
|---------------|-------------|-----|-----|------------|
| **Staging** | `staging.creazot.com` | `167.172.191.66` | `ssh root@167.172.191.66` | `/root/achats-harel` |
| **Production** | `ah-chou.creazot.com` | `159.223.23.209` | `ssh root@159.223.23.209` | `/root/achats-harel` |
| **Odoo** | `ah-chou1.odoo.com` | — | — | SaaS (pas d'accès serveur) |

- Auth HTTP staging : `ah-chou` / `ah-chou`
- Branche Git : **`4.0`**
- Remote : `github.com:Seb974/achats-harel.git`

## Services Docker

```bash
docker compose -f compose.yaml -f compose.prod.yaml ps
```

| Service | Image/Rôle | Port interne |
|---------|-----------|-------------|
| `php` | API Symfony + FrankenPHP (Caddy) | 80/443 |
| `pwa` | Next.js 15 (frontend) | 3000 |
| `keycloak` | Keycloak (OIDC) | 8080 |
| `keycloak-database` | PostgreSQL Keycloak | 5432 |
| `database` | PostgreSQL app (non présent sur staging — BDD sur prod) | 5432 |

## Déploiement

### Staging (accès GitHub)

```bash
ssh root@167.172.191.66
cd /root/achats-harel
git pull origin 4.0
docker compose -f compose.yaml -f compose.prod.yaml up -d --build php pwa
```

### Production (PAS d'accès GitHub → git bundle)

```bash
# 1. Sur la machine locale
cd /Users/mhoar/Desktop/achats-harel-4.0
git bundle create /tmp/deploy.bundle HEAD~N..HEAD   # N = nombre de commits

# 2. Transfert
scp /tmp/deploy.bundle root@159.223.23.209:/root/achats-harel/

# 3. Sur le serveur prod
cd /root/achats-harel
git fetch deploy.bundle HEAD:refs/heads/deploy-fix
git merge deploy-fix --no-edit
git branch -d deploy-fix

# 4. Rebuild
docker compose -f compose.yaml -f compose.prod.yaml up -d --build php pwa
```

Les migrations Doctrine s'exécutent automatiquement au démarrage du conteneur `php`.

## Commandes de debug courantes

```bash
# Alias pour compose
DC="docker compose -f compose.yaml -f compose.prod.yaml"

# Logs
$DC logs php --tail=200 -f          # Backend + Caddy
$DC logs pwa --tail=200 -f          # Frontend Next.js
$DC logs keycloak --tail=100        # Auth

# Console Symfony
$DC exec php bin/console debug:router              # Routes API
$DC exec php bin/console doctrine:migrations:status # État migrations
$DC exec php bin/console cache:clear                # Vider cache

# SQL directe
$DC exec php bin/console dbal:run-sql "SELECT id, supplier, odoo_purchase_order_id FROM achat ORDER BY id DESC LIMIT 10"

# État containers
$DC ps --format '{{.Name}}: {{.Status}}'

# Rebuild un seul service (sans toucher aux autres)
$DC up -d --build php --no-deps
$DC up -d --build pwa --no-deps

# Purge Docker (attention : supprime images/volumes non utilisés)
docker system prune -a
```

## Fichiers clés pour le debug

| Fichier | Quand le consulter |
|---------|-------------------|
| `api/src/Service/OdooApiService.php` | Erreurs XML-RPC, problèmes de création PO/picking |
| `api/src/Controller/OdooDataController.php` | Erreurs 4xx/5xx sur `/odoo/*` |
| `api/src/Entity/Client.php` | Vérifier config Odoo (URL, DB, username, apiKey) |
| `api/src/Serializer/MediaObjectNormalizer.php` | Problèmes d'URL documents |
| `pwa/components/admin/achat/AchatsKanban.tsx` | Bugs de transition Kanban |
| `pwa/components/admin/achat/SendToOdooButton.tsx` | Problèmes d'envoi PO depuis page détail |
| `pwa/hooks/useOdoo.ts` | Transformation données Achat → PO Odoo |
| `api/frankenphp/Caddyfile` | Routes statiques, proxy, CORS |
| `compose.prod.yaml` | Variables d'env, volumes, ports |

## Connexion Odoo XML-RPC (debug)

```
URL      : https://ah-chou1.odoo.com
Database : ah-chou1
Username : mathieu.loic.hoarau@gmail.com
Auth     : clé API (stockée dans Client.odooApiKey en base)
```

Pour tester manuellement (Python) :

```python
import xmlrpc.client
url = "https://ah-chou1.odoo.com"
db = "ah-chou1"
username = "mathieu.loic.hoarau@gmail.com"
api_key = "VOTRE_CLE_API"  # Depuis Odoo → Paramètres → Utilisateurs → Clés API

common = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/common")
uid = common.authenticate(db, username, api_key, {})
print(f"UID: {uid}")  # Si False → clé invalide ou utilisateur désactivé
```

## Problèmes connus et résolus

| # | Problème | Cause | Solution |
|---|----------|-------|----------|
| 1 | `Invalid field 'x_devise_achat' in 'purchase.order'` | Champs custom pas encore créés dans Odoo | Champs custom écrits en `write` séparé avec try/catch (non bloquant) |
| 2 | `documents.folder does not exist` | Odoo 19 n'a plus ce modèle | Utiliser `documents.document` avec `type = 'folder'` |
| 3 | `is_folder` ignoré à la création | Champ calculated readonly dans Odoo 19 | Utiliser `type = 'folder'` au lieu de `is_folder = True` |
| 4 | Guide utilisateur 404 | Pas de route Caddy | Ajout `handle /guide-utilisateur/*` dans Caddyfile + volume dans compose.prod |
| 5 | Keycloak `KC_PROXY` deprecated | Variable supprimée dans Keycloak récent | Remplacé par `KC_PROXY_HEADERS: xforwarded` |
| 6 | Keycloak 431 Header Too Large | Cookies accumulés dépassent 8 KB | `KC_HTTP_MAX_HEADER_SIZE: "32768"` + vider cookies navigateur |
| 7 | `coeffApp` ne peut recevoir le focus | `setValue` sur input dans onglet `TabbedForm` inactif | `setValue("coeffApp", val, { shouldValidate: false, shouldTouch: false })` |
| 8 | XML-RPC auth `uid=False` | Utilisation du mot de passe web au lieu de la clé API | Sur Odoo SaaS, XML-RPC exige une **clé API** (pas le mdp web) |
| 9 | PO en doublon dans Odoo | Pas de vérification `odooPurchaseOrderId` avant création | Ajout protection anti-doublon dans Kanban et SendToOdooButton |
| 10 | `skipped_lines` non affiché | Champ retourné par l'API mais pas montré dans la PWA | Alert warning ajouté dans le dialogue résultat |

## État staging vs production

**Staging est en avance** sur production. Fonctionnalités déployées en staging uniquement :

- Intégration GED Odoo (upload/download/delete documents)
- Correction des 7 failles intégration Odoo (F1-F7, F10)
- Champs custom non-bloquants (x_devise_achat, x_prix_achat_devise, x_devise_origine)
- Protection anti-doublon PO
- Picking ID stocké sur Achat
- Fix focus coeffApp dans TabbedForm
- Migration `Version20260325_AddOdooAccessUrl.php`

Pour synchroniser prod : créer un bundle git, transférer via scp, merger et rebuilder.
