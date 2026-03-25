# Contexte de debug — ah-chou.creazot.com (production)

## Infrastructure

| Environnement | URL | IP | SSH |
|---|---|---|---|
| **Production** | `ah-chou.creazot.com` | `159.223.23.209` | `ssh root@159.223.23.209` |
| **Staging** | `staging.creazot.com` | `167.172.191.66` | `ssh root@167.172.191.66` |

Les deux serveurs partagent la **même base PostgreSQL** (hébergée sur le serveur de prod).

## Stack technique

- **Backend** : Symfony / API Platform (PHP 8.x, FrankenPHP)
- **Frontend** : Next.js 14 / React Admin 5
- **Reverse proxy** : Caddy (intégré dans FrankenPHP)
- **Auth** : Keycloak (container Docker)
- **Conteneurisation** : Docker Compose
- **Odoo** : `https://ah-chou1.odoo.com` (saas-19.1 / Odoo 19), connecté via XML-RPC

## Structure Docker

```bash
cd /root/achats-harel
docker compose -f compose.yaml -f compose.prod.yaml ps
```

Services principaux : `php`, `pwa`, `database`, `keycloak`

## Commandes utiles

```bash
# Logs PHP (backend + Caddy)
docker compose -f compose.yaml -f compose.prod.yaml logs php --tail=100

# Logs PWA (Next.js)
docker compose -f compose.yaml -f compose.prod.yaml logs pwa --tail=100

# Exécuter une commande Symfony
docker compose -f compose.yaml -f compose.prod.yaml exec php bin/console <command>

# SQL directe
docker compose -f compose.yaml -f compose.prod.yaml exec php bin/console dbal:run-sql "SELECT ..."

# Rebuild un seul service
docker compose -f compose.yaml -f compose.prod.yaml up -d --build php --no-deps
docker compose -f compose.yaml -f compose.prod.yaml up -d --build pwa --no-deps

# État des containers
docker compose -f compose.yaml -f compose.prod.yaml ps --format '{{.Name}}: {{.Status}}'
```

## Déploiement (local → serveur)

Le serveur n'a **pas** d'accès GitHub. Le déploiement se fait via `git bundle` :

```bash
# Sur la machine locale
cd /Users/mhoar/Desktop/achats-harel-4.0
git bundle create /tmp/deploy.bundle HEAD~N..HEAD  # N = nombre de commits

# Transfert
scp /tmp/deploy.bundle root@159.223.23.209:/root/achats-harel/

# Sur le serveur
cd /root/achats-harel
git fetch deploy.bundle HEAD:refs/heads/deploy-fix
git merge deploy-fix --no-edit
git branch -d deploy-fix

# Rebuild
docker compose -f compose.yaml -f compose.prod.yaml up -d --build php pwa --no-deps
```

## Fichiers clés du projet

| Fichier | Rôle |
|---|---|
| `api/src/Controller/OdooDataController.php` | Proxy Odoo (produits, PO, GED documents) |
| `api/src/Service/OdooApiService.php` | Service XML-RPC Odoo (toutes les méthodes) |
| `api/src/Entity/MediaObject.php` | Entité document (champs: `odooDocumentId`, `odooAccessUrl`) |
| `api/src/Serializer/MediaObjectNormalizer.php` | Génère `contentUrl` (Odoo access_url ou fallback proxy) |
| `pwa/components/admin/achat/AchatsEdit.tsx` | Formulaire édition achat (upload docs, transform) |
| `pwa/app/lib/client.js` | `createMediaObject`, `syncDocument`, `syncDocuments` |
| `api/frankenphp/Caddyfile` | Config Caddy (routes, guide utilisateur) |
| `compose.prod.yaml` | Overrides Docker production |

## Intégration Odoo GED

Les documents sont stockés dans la GED Odoo (pas en local). Points clés :

- **Modèle Odoo 19** : `documents.document` — les dossiers ont `type = 'folder'` (le champ `is_folder` est calculé readonly)
- **Hiérarchie** : `Achats / {Fournisseur} / {PO ou Achat-id} - {Date}`
- **Parent** : champ `folder_id` (many2one vers le dossier parent)
- **URL directe** : champ calculé `access_url` sur `documents.document` (ex: `https://ah-chou1.odoo.com/odoo/documents/xxx`)
- **Upload** : `POST /odoo/attachment/upload` (multipart: file + supplierName + poName + poDate)
- **Download proxy** : `GET /odoo/attachment/{id}/download`
- **Suppression** : `DELETE /odoo/attachment/{id}` (supprime dans Odoo + MediaObject local)

## Connexion Odoo (XML-RPC)

```
URL      : https://ah-chou1.odoo.com
Database : ah-chou1
Username : mathieu.loic.hoarau@gmail.com
API Key  : ac2f53c600679ace89993a296c2002e0b6b945e4
Version  : saas-19.1 (Odoo 19)
```

Endpoints XML-RPC :
- Auth : `{url}/xmlrpc/2/common` → `authenticate`
- Data : `{url}/xmlrpc/2/object` → `execute_kw`

## Problèmes connus et résolus

1. **`documents.folder` n'existe pas** → Odoo 19 n'utilise plus ce modèle. Utiliser `documents.document` avec `type = 'folder'`
2. **`is_folder` ignoré à la création** → C'est un champ calculé readonly. Utiliser `type = 'folder'` à la place
3. **Guide utilisateur 404** → Ajout d'un `handle /guide-utilisateur/*` dans le Caddyfile + volume mount dans compose.prod.yaml
4. **MissingCSRF login** → Problème de cookies client, pas serveur
5. **Keycloak KC_PROXY** → Remplacé par `KC_PROXY_HEADERS: xforwarded` dans compose.prod.yaml
6. **Keycloak 431 Request Header Or Cookie Too Large** → Cookies accumulés dépassent la limite par défaut (8 KB). Fix : vider les cookies navigateur + `KC_HTTP_MAX_HEADER_SIZE: "32768"` dans compose

## État actuel staging vs production

**Staging est en avance** sur production avec les fonctionnalités suivantes non déployées en prod :
- Intégration GED Odoo (upload/download/delete documents)
- Champs `odooDocumentId` et `odooAccessUrl` sur MediaObject
- Migration `Version20260325_AddOdooAccessUrl.php`
- Suppression propagée des documents vers Odoo
- Upload toujours vers Odoo (même sans PO)

Pour synchroniser prod avec staging, il faudra :
1. Créer un bundle avec tous les commits d'avance
2. Transférer et merger sur le serveur prod
3. Rebuilder les containers php + pwa
4. La migration DB s'exécutera automatiquement au démarrage
