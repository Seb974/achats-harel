# Analyse Technique Complète - Achats Harel 4.0

**Date d'analyse** : 25 janvier 2026  
**Version du projet** : 4.0.5

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Analyse API Backend (PHP/Symfony)](#2-analyse-api-backend-phpsymfony)
3. [Analyse PWA Frontend (Next.js/React)](#3-analyse-pwa-frontend-nextjsreact)
4. [Analyse Infrastructure DevOps](#4-analyse-infrastructure-devops)
5. [Recommandations prioritaires](#5-recommandations-prioritaires)
6. [Plan d'action](#6-plan-daction)

---

## 1. Vue d'ensemble

### Stack technique

| Couche | Technologies |
|--------|-------------|
| **Backend** | PHP 8.3, Symfony 7.1, API Platform 4.0.5, Doctrine ORM 3.2 |
| **Frontend** | Next.js 14.2, React 18.3, TypeScript 5.5, React Admin 5.1 |
| **Base de données** | PostgreSQL 15 |
| **Authentification** | Keycloak (OIDC/OAuth2), NextAuth 5.0 |
| **Temps réel** | Mercure |
| **Infrastructure** | Kubernetes (GKE), Helm, Docker, GitHub Actions |

### Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        GKE Kubernetes                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐    │
│  │   PWA       │   │   API       │   │     Keycloak        │    │
│  │ (Next.js)   │   │ (Symfony)   │   │     (OIDC)          │    │
│  │  Port 3000  │   │  Port 80    │   │     Port 8080       │    │
│  └──────┬──────┘   └──────┬──────┘   └──────────┬──────────┘    │
│         │                 │                      │               │
│         │    ┌────────────┴──────────┐          │               │
│         └────┤     PostgreSQL        ├──────────┘               │
│              │     Port 5432         │                          │
│              └───────────────────────┘                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Nginx Ingress                         │    │
│  │              + Cert-Manager (Let's Encrypt)              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Analyse API Backend (PHP/Symfony)

### 2.1 Architecture du code

L'API suit une architecture Symfony standard avec API Platform :

```
api/
├── bin/                    # Scripts console Symfony
├── config/                 # Configuration (bundles, packages, routes)
│   ├── packages/          # Configurations par bundle (23 fichiers YAML)
│   └── routes/            # Définitions de routes
├── migrations/             # Migrations Doctrine (12 fichiers)
├── public/                # Point d'entrée web
├── src/
│   ├── Command/           # Commandes console (4 commandes)
│   ├── Controller/        # Contrôleurs personnalisés (7 contrôleurs)
│   ├── DataTransformer/   # Transformateurs de données
│   ├── Doctrine/          # Extensions Doctrine (filtres, extensions)
│   ├── Dto/               # Data Transfer Objects
│   ├── Encoder/           # Décodeurs personnalisés
│   ├── Entity/            # Entités Doctrine (16 entités)
│   ├── EventSubscriber/   # Abonnés aux événements (2 subscribers)
│   ├── Repository/        # Repositories Doctrine (16 repositories)
│   ├── Security/          # Sécurité (providers, voters, handlers)
│   ├── Serializer/        # Normalizers personnalisés (3 normalizers)
│   └── Service/           # Services métier (7 services)
├── templates/             # Templates Twig (6 templates)
└── tests/                 # Tests (unitaires et fonctionnels)
```

### 2.2 Patterns utilisés

- **Repository Pattern** : repositories Doctrine pour chaque entité
- **Service Layer** : logique métier dans `Service/`
- **DTO Pattern** : `ClientInput` pour la validation
- **Data Transformer** : `ClientInputDataTransformer` pour la transformation
- **Event Subscribers** : `StatusEditionSubscriber`, `EntitiesMetaSubscriber`
- **Custom Filters** : filtres Doctrine personnalisés pour API Platform
- **Security Voters** : système de permissions avec voters OIDC

### 2.3 Dépendances principales

#### Framework et API
- Symfony 7.1.*
- API Platform 4.0.5
- Doctrine ORM 3.2.2
- PHP 8.3+

#### Bundles principaux
- `api-platform/symfony` : API REST/GraphQL
- `doctrine/doctrine-bundle` : ORM
- `symfony/security-bundle` : Authentification/autorisation
- `symfony/mercure-bundle` : Temps réel (Mercure)
- `web-token/jwt-bundle` : JWT
- `nelmio/cors-bundle` : CORS
- `vich/uploader-bundle` : Upload de fichiers
- `liip/imagine-bundle` : Traitement d'images
- `dompdf/dompdf` : Génération PDF

#### Outils de développement
- PHPUnit 11.3.5
- PHPStan 1.12.3
- Symfony Maker Bundle
- Doctrine Fixtures Bundle

### 2.4 Entités/modèles principaux

**16 entités Doctrine identifiées :**

#### Entités principales
| Entité | Description |
|--------|-------------|
| `Achat` | Commande d'achat (date, fournisseur, devises, taux de change, statut) |
| `Item` | Ligne d'achat (produit, quantité, prix, emballage) |
| `Expense` | Dépense (date, bénéficiaire, libellé, détails de paiement) |
| `Client` | Client multi-tenant (configuration, API keys, devises) |

#### Entités de référence
| Entité | Description |
|--------|-------------|
| `Status` | Statut des achats (code, libellé, couleur) |
| `Currency` | Devises |
| `Tax` / `TaxType` / `CategoryTax` | Taxes |
| `Nature` | Nature des dépenses |
| `User` | Utilisateur (UUID, email, rôles Keycloak) |

### 2.5 Controllers et endpoints API

#### Controllers personnalisés (7)
1. `ClientDataController` : Proxy vers API Harel (produits, fournisseurs)
2. `CreateClientController` : Création de clients avec upload
3. `ExportController` : Export CSV/PDF
4. `ExchangeRateController` : Gestion des taux de change
5. `MicrotrakProxyController` : Proxy vers Microtrak
6. `ShopController` : Webhooks Wix
7. `UploadClientAssetController` : Upload d'assets clients

#### Formats supportés
- JSON-LD (`application/ld+json`)
- JSON (`application/json`)
- Multipart (`multipart/form-data`) pour uploads

### 2.6 Sécurité

- Provider personnalisé : `App\Security\Core\UserProvider`
- Firewall stateless avec OIDC
- Voters personnalisés : `OidcVoter`, `OidcRoleVoter`, `OidcTokenPermissionVoter`
- Rôles : `OIDC_USER`, `OIDC_ADMIN`
- Handler de token : `OidcDiscoveryTokenHandler`

### 2.7 Tests API

```
tests/
├── Api/                    # Tests fonctionnels API
│   ├── Admin/             # Tests admin (Book, Review, User)
│   ├── Security/          # Tests sécurité
│   └── schemas/           # Schémas JSON pour validation
├── Doctrine/              # Tests Doctrine
├── Security/              # Tests sécurité
├── Serializer/            # Tests sérialisation
└── State/                 # Tests state processors
```

### 2.8 Points forts API

1. ✅ Architecture claire : séparation Entity/Repository/Service/Controller
2. ✅ Utilisation d'API Platform : génération automatique d'endpoints
3. ✅ Sécurité : OIDC/Keycloak, voters personnalisés
4. ✅ Type safety : PHP 8.3, types stricts, attributs
5. ✅ Multi-tenant : support via `ClientGetter`
6. ✅ Temps réel : Mercure activé

### 2.9 Points d'amélioration API

| Priorité | Point | Recommandation |
|----------|-------|----------------|
| 🔴 Haute | Repositories vides | Ajouter des méthodes de requête réutilisables |
| 🔴 Haute | Couverture tests limitée | Augmenter les tests unitaires pour les services |
| 🟡 Moyenne | Controllers volumineux | Refactoriser `ExportController` |
| 🟡 Moyenne | Cache absent | Ajouter un cache pour les données de référence |
| 🟢 Basse | Code commenté | Nettoyer `AchatRepository` |

---

## 3. Analyse PWA Frontend (Next.js/React)

### 3.1 Architecture du code

```
pwa/
├── app/                    # App Router Next.js (pages et routes)
│   ├── admin/             # Page admin principale
│   ├── api/auth/          # Routes API NextAuth
│   ├── lib/               # Utilitaires et actions serveur
│   └── providers.tsx      # Providers React Query
├── components/            # Composants React
│   ├── admin/             # Composants admin (CRUD)
│   ├── common/            # Composants réutilisables
│   ├── dashboard/         # Composants dashboard
│   └── passenger/         # Composants passagers
├── config/                # Configuration (entrypoint, Keycloak)
├── utils/                 # Utilitaires (dataAccess, Mercure)
├── types/                 # Types TypeScript
├── styles/                # Styles globaux
└── public/                # Assets statiques
```

### 3.2 Dépendances principales

#### Framework et core
- Next.js 14.2.10 (App Router)
- React 18.3.1
- TypeScript 5.5.4

#### UI et styling
- Tailwind CSS 3.4.9
- Material-UI (@mui/material 5.16.7)
- React Admin 5.1.1
- NextUI (@nextui-org/react 2.4.1)
- Framer Motion 11.2.10
- ApexCharts 3.45.2

#### Gestion d'état et données
- TanStack React Query 5.51.23
- React Hook Form 7.53.0
- Formik 2.4.6
- Zod 3.22.2

#### Authentification
- NextAuth 5.0.0-beta.16 (Keycloak)

### 3.3 Composants React principaux

#### Composants Admin (CRUD)
Organisation par ressource avec pattern standard :
- `*List.tsx` : Liste avec pagination
- `*Create.tsx` : Formulaire de création
- `*Edit.tsx` : Formulaire d'édition
- `*Show.tsx` : Vue détaillée

#### Ressources principales
- `achat/` : Gestion des achats
- `client/` : Gestion clients
- `prestation/` : Prestations avec formulaires complexes
- `expense/` : Dépenses
- `status/` : Statuts
- `tax/`, `taxType/` : Taxes
- `currency/` : Devises

### 3.4 Gestion d'état

#### TanStack React Query
- Configuration : `staleTime: 5s`, DevTools activés
- Hydration streaming avec `@tanstack/react-query-next-experimental`

#### Context API
1. `SessionContextProvider` : Session NextAuth
2. `ClientProvider` : Données client avec cache
3. `CustomFieldsProvider` : Champs personnalisés

### 3.5 Styling

| Technologie | Usage |
|-------------|-------|
| Tailwind CSS | Styling principal |
| Material-UI | Composants React Admin |
| CSS global | Styles de base |

### 3.6 Points forts PWA

1. ✅ Architecture modulaire claire
2. ✅ Types TypeScript présents
3. ✅ Authentification robuste (NextAuth + Keycloak)
4. ✅ Support temps réel (Mercure)
5. ✅ Docker optimisé
6. ✅ Structure cohérente des composants admin

### 3.7 Points d'amélioration PWA

| Priorité | Point | Recommandation |
|----------|-------|----------------|
| 🔴 Critique | Duplication dépendances | Retirer `react-query` (ancienne version) |
| 🔴 Critique | TypeScript | Activer `strict: true` |
| 🔴 Haute | Tests absents | Ajouter des tests unitaires (Jest/Vitest) |
| 🟡 Moyenne | Gestion d'état | Migrer tous les appels API vers React Query |
| 🟡 Moyenne | Styling mixte | Standardiser (Tailwind ou MUI) |
| 🟢 Basse | `reactStrictMode` | Activer dans `next.config.js` |

---

## 4. Analyse Infrastructure DevOps

### 4.1 Workflows GitHub Actions

| Workflow | Déclencheur | Description |
|----------|-------------|-------------|
| `ci.yml` | Push/PR sur main | Tests, build Docker, PHPUnit, PHPStan, Playwright |
| `cd.yml` | Tags, PR avec label `deploy` | Build et push vers GAR, déploiement GKE |
| `deploy.yml` | Réutilisable | Déploiement Helm sur Kubernetes |
| `security.yml` | Planifié (dimanche) | Scan Trivy des images Docker |
| `check.yml` | Réutilisable | Tests k6 post-déploiement |
| `cleanup.yml` | - | Nettoyage des ressources |
| `upgrade-api-platform.yml` | Manuel | Mise à jour API Platform |

### 4.2 Configuration Helm

#### Chart principal
- Version : 4.0.5
- Dépendances : PostgreSQL, External-DNS, Keycloak (Bitnami)

#### Templates Kubernetes
- **Deployment PHP** : FrankenPHP avec healthchecks
- **Deployment PWA** : Next.js standalone
- **Ingress** : Nginx + cert-manager (Let's Encrypt)
- **HPA** : Autoscaling CPU (1-100 réplicas)
- **Secrets** : Génération automatique
- **CronJob** : Fixtures quotidiennes

### 4.3 Fichiers Docker

#### API Dockerfile
- Base : FrankenPHP (PHP 8.3) avec SHA256 pinning
- Extensions : APCu, BCMath, Intl, OPcache, GD, Imagick, PDO PostgreSQL
- Multi-stage : dev et prod optimisés

#### PWA Dockerfile
- Base : Node.js 21 Alpine
- PNPM 9 avec Corepack
- Build Next.js standalone
- Utilisateur non-root (sécurité)

### 4.4 Configuration Kubernetes

| Composant | Configuration |
|-----------|---------------|
| Services | ClusterIP (PHP:80, PWA:3000, Keycloak:8080) |
| Ingress | Nginx + cert-manager |
| HPA | CPU 50%, 1-100 réplicas |
| Stockage | PostgreSQL/Keycloak: 1Gi PVC |
| Secrets | Helm Secrets, base64 |

### 4.5 Points forts DevOps

1. ✅ SHA256 pinning des images de base
2. ✅ Scan de vulnérabilités avec Trivy
3. ✅ Authentification OIDC pour GCP
4. ✅ Healthchecks sur tous les pods
5. ✅ Arrêt gracieux (preStop hooks)
6. ✅ Cache Docker optimisé
7. ✅ TLS automatique (Let's Encrypt)
8. ✅ External-DNS pour gestion DNS

### 4.6 Points d'amélioration DevOps

| Priorité | Point | Recommandation |
|----------|-------|----------------|
| 🔴 Critique | Mots de passe par défaut | Changer dans `values.yaml` pour prod |
| 🔴 Haute | Secrets non chiffrés | Utiliser GCP Secret Manager ou Vault |
| 🟡 Moyenne | NetworkPolicy absent | Ajouter pour isolation réseau |
| 🟡 Moyenne | PodDisruptionBudget absent | Configurer pour haute disponibilité |
| 🟡 Moyenne | Monitoring absent | Configurer Prometheus/Grafana |
| 🟢 Basse | CronJob fixtures | Vérifier nécessité en production |

---

## 5. Recommandations prioritaires

### 🔴 Critiques (à faire immédiatement)

1. **Dépendances dupliquées** : Retirer `react-query` du PWA
2. **TypeScript strict** : Activer `strict: true` dans `tsconfig.json`
3. **Secrets production** : Ne jamais utiliser les mots de passe par défaut
4. **Gestion des secrets** : Migrer vers un secret manager (Vault, GCP Secret Manager)

### 🟡 Importantes (à planifier)

5. **Tests unitaires** : Augmenter la couverture API et PWA
6. **React Query** : Centraliser tous les appels API
7. **NetworkPolicy** : Isolation réseau Kubernetes
8. **Monitoring** : Prometheus + Grafana + alerting
9. **Refactoring controllers** : Séparer les responsabilités
10. **Cache données** : Implémenter pour les données de référence

### 🟢 Améliorations (quand possible)

11. **Documentation API** : Améliorer la documentation OpenAPI
12. **Styling** : Standardiser sur une seule solution
13. **Code commenté** : Nettoyer les repositories
14. **PodDisruptionBudget** : Haute disponibilité

---

## 6. Plan d'action

### Phase 1 : Court terme (1-2 semaines)

- [ ] Nettoyer les dépendances dupliquées (PWA)
- [ ] Activer TypeScript strict
- [ ] Configurer les secrets de production
- [ ] Ajouter les tests unitaires critiques

### Phase 2 : Moyen terme (1-2 mois)

- [ ] Migrer vers React Query pour tous les appels API
- [ ] Refactoriser les controllers volumineux
- [ ] Implémenter NetworkPolicy Kubernetes
- [ ] Mettre en place Prometheus/Grafana
- [ ] Ajouter des tests d'intégration

### Phase 3 : Long terme (3+ mois)

- [ ] Optimiser les requêtes Doctrine (N+1)
- [ ] Standardiser le système de design
- [ ] Implémenter un système de logging centralisé
- [ ] Documentation technique complète
- [ ] Considérer l'ajout d'événements métier

---

## Conclusion

Le projet **Achats Harel 4.0** est bien structuré avec une stack moderne et des pratiques DevOps solides. L'architecture est claire, la sécurité est en place avec OIDC/Keycloak, et le déploiement Kubernetes est automatisé.

**Points forts :**
- Architecture moderne (API Platform + Next.js)
- CI/CD complet avec GitHub Actions
- Sécurité OIDC/Keycloak
- Temps réel avec Mercure
- Infrastructure Kubernetes robuste

**Axes d'amélioration prioritaires :**
- Couverture de tests
- Gestion centralisée des appels API
- Configuration TypeScript stricte
- Monitoring et observabilité

Le projet est prêt pour la production avec les ajustements de sécurité et de configuration recommandés.
