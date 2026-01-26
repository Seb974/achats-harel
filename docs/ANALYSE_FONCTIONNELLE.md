# Analyse Fonctionnelle - Achats Harel 4.0

> Document généré automatiquement le 25 janvier 2026

## 1. Présentation du projet

### 1.1 Vue d'ensemble

**Achats Harel 4.0** est une application de gestion d'achats multi-devises développée sur le framework **API Platform 4.0.5**. Elle permet la gestion complète du cycle d'achat avec intégration de systèmes externes (Harel, BNF, taux de change).

### 1.2 Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Backend | PHP/Symfony | 7.1 |
| Framework API | API Platform | 4.0.5 |
| ORM | Doctrine | 3.2 |
| Frontend | Next.js | 14.2.10 |
| UI Framework | React Admin | 5.1.1 |
| Authentification | Keycloak (OIDC) | - |
| Base de données | PostgreSQL | 16 |
| Temps réel | Mercure | - |
| Serveur web | Caddy/FrankenPHP | - |

---

## 2. Architecture fonctionnelle

### 2.1 Diagramme de contexte

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Achats Harel 4.0                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐       │
│   │   Frontend   │────▶│   API REST   │────▶│  PostgreSQL  │       │
│   │   (Next.js)  │     │  (Symfony)   │     │              │       │
│   └──────────────┘     └──────────────┘     └──────────────┘       │
│          │                    │                                      │
│          │                    │                                      │
│   ┌──────────────┐     ┌──────────────┐                             │
│   │   Keycloak   │     │   Mercure    │                             │
│   │    (OIDC)    │     │  (WebSocket) │                             │
│   └──────────────┘     └──────────────┘                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
          │                      │
          ▼                      ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    API Harel    │     │  UniRateAPI     │     │   Webhook Wix   │
│   (Produits)    │     │ (Taux change)   │     │   (Achats)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 2.2 Modules fonctionnels

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MODULES APPLICATIFS                          │
├────────────────┬────────────────┬────────────────┬─────────────────┤
│   ACHATS       │   FINANCES     │  CONFIGURATION │  INTÉGRATIONS   │
├────────────────┼────────────────┼────────────────┼─────────────────┤
│ • Création     │ • Dépenses     │ • Clients      │ • API Harel     │
│ • Items        │ • Paiements    │ • Statuts      │ • Taux change   │
│ • Taxes        │ • Exports      │ • Devises      │ • Webhook Wix   │
│ • Documents    │ • PDF/CSV      │ • Taxes        │ • Microtrak     │
│ • Couverture   │                │ • Utilisateurs │                 │
└────────────────┴────────────────┴────────────────┴─────────────────┘
```

---

## 3. Modèle de données

### 3.1 Entités principales

#### Achat (Entité centrale)
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique |
| date | DateTime | Date de l'achat |
| deliveryDate | DateTime | Date de livraison |
| supplier | String | Fournisseur |
| baseCurrency | String | Devise source |
| targetCurrency | String | Devise cible |
| exchangeRate | Float | Taux de change |
| totalHT | Float | Total hors taxes |
| covering | Float | Taux de couverture |

**Relations :**
- `items` (OneToMany) → Item
- `status` (ManyToOne) → Status
- `documents` (OneToMany) → MediaObject
- `categoryTaxes` (OneToMany) → CategoryTax
- `taxes` (ManyToMany) → Tax
- `otherCosts` (OneToMany) → OtherCost
- `coveringCosts` (OneToMany) → CoveringCost

#### Item (Ligne d'achat)
| Champ | Type | Description |
|-------|------|-------------|
| productId | String | ID produit Harel |
| product | String | Nom du produit |
| packagingId | String | ID conditionnement |
| packaging | String | Conditionnement |
| categoryId | String | ID catégorie |
| category | String | Catégorie |
| quantity | Float | Quantité |
| weight | Float | Poids |
| incomingUnitPrice | Float | Prix unitaire entrant |
| outGoingUnitPriceHT | Float | Prix unitaire sortant HT |
| approchCoeff | Float | Coefficient d'approche |
| costPriceHT | Float | Prix de revient HT |

#### Client (Configuration multi-tenant)
| Champ | Type | Description |
|-------|------|-------------|
| name | String | Nom du client |
| slug | String | Identifiant URL |
| email | String | Email contact |
| logo | File | Logo entreprise |
| favicon | File | Favicon |
| color | String | Couleur thème |
| timezone | String | Fuseau horaire |
| mainCurrency | String | Devise principale |
| harelApiKey | String | Clé API Harel |
| harelUrl | String | URL API Harel |
| exchangeRateApiKey | String | Clé API taux change |
| hasCategoryTaxes | Boolean | Taxes par catégorie |
| hasGlobalTaxes | Boolean | Taxes globales |
| hasCoeffApp | Boolean | Coefficient d'approche |

#### Expense (Dépense)
| Champ | Type | Description |
|-------|------|-------------|
| date | DateTime | Date de la dépense |
| beneficiaire | String | Bénéficiaire |
| libelle | String | Libellé |
| tva | Float | TVA |
| totalHT | Float | Total HT |
| totalTTC | Float | Total TTC |

### 3.2 Diagramme des relations

```
                    ┌─────────────┐
                    │   Client    │
                    └──────┬──────┘
                           │ (config globale)
                           ▼
┌─────────┐        ┌─────────────┐        ┌─────────┐
│ Status  │◀───────│    Achat    │───────▶│  Tax    │
└─────────┘        └──────┬──────┘        └────┬────┘
                          │                     │
          ┌───────────────┼───────────────┐     │
          ▼               ▼               ▼     ▼
    ┌──────────┐   ┌────────────┐   ┌──────────────┐
    │   Item   │   │ OtherCost  │   │ CategoryTax  │
    └──────────┘   └────────────┘   └──────────────┘
          │               │
          ▼               ▼
    ┌──────────┐   ┌──────────────┐
    │ Product  │   │ CoveringCost │
    │ (Harel)  │   └──────────────┘
    └──────────┘

┌───────────────┐        ┌─────────────────┐
│    Expense    │───────▶│  PaymentDetail  │
└───────────────┘        └─────────────────┘
        │
        ▼
┌───────────────┐
│  MediaObject  │
└───────────────┘
```

---

## 4. Fonctionnalités détaillées

### 4.1 Module Achats

#### 4.1.1 Création d'un achat

**Processus :**
1. Sélection du fournisseur (via API Harel)
2. Choix des devises (source/cible)
3. Récupération automatique du taux de change
4. Ajout des items (produits Harel)
5. Calcul automatique des taxes
6. Application du coefficient d'approche
7. Gestion des coûts additionnels
8. Upload des documents justificatifs

**Formules de calcul :**
```
Prix converti = Prix × Taux de change
Prix avec coefficient = Prix converti × (1 + Coefficient d'approche)
Total HT = Σ(Quantité × Prix unitaire)
Total taxes = Total HT × Taux de taxe
Total TTC = Total HT + Total taxes
```

#### 4.1.2 Gestion des taxes

**Deux modes :**
- **Taxes par catégorie** : Taxes différentes selon la catégorie de produit
- **Taxes globales** : Taux uniforme sur tout l'achat

**Configuration :**
- Types de taxes personnalisables
- Taux configurables par client
- Calcul automatique des montants

#### 4.1.3 Coûts de couverture

Permet de gérer les variations de taux de change :
- Enregistrement des achats de devises
- Calcul du taux de couverture moyen
- Impact sur le prix de revient

#### 4.1.4 Workflow et statuts

| Statut | Code | Couleur | Description |
|--------|------|---------|-------------|
| Brouillon | draft | Gris | En cours de création |
| En attente | pending | Orange | Soumis pour validation |
| Validé | validated | Vert | Approuvé |
| Annulé | cancelled | Rouge | Annulé |

### 4.2 Module Dépenses

#### 4.2.1 Gestion des dépenses

**Fonctionnalités :**
- Création de dépenses avec bénéficiaire
- Détails de paiement multiples (modes de paiement)
- Upload de justificatifs
- Calcul automatique des totaux

#### 4.2.2 Modes de paiement

- Virement bancaire
- Carte bancaire
- Espèces
- Chèque
- Autres

### 4.3 Module Exports

#### 4.3.1 Formats supportés

| Format | Extension | Description |
|--------|-----------|-------------|
| CSV | .csv | Export tableur |
| PDF | .pdf | Document formaté |

#### 4.3.2 Filtres disponibles

- Plage de dates
- Fournisseur
- Statut
- Mode de paiement
- Montant (min/max)

### 4.4 Module Configuration

#### 4.4.1 Configuration client (Multi-tenant)

**Personnalisation visuelle :**
- Logo entreprise
- Favicon
- Couleur thème

**Configuration fonctionnelle :**
- Devises disponibles
- Types de taxes
- Labels personnalisés
- Fuseau horaire

**Intégrations :**
- Clé API Harel
- URL API Harel
- Clé API taux de change

#### 4.4.2 Gestion des utilisateurs

**Rôles :**
- `OIDC_USER` : Utilisateur standard
- `OIDC_ADMIN` : Administrateur

**Attributs :**
- Email
- Prénom / Nom
- ID Keycloak
- Rôles

---

## 5. Intégrations externes

### 5.1 API Harel

**Fonctionnalité :** Récupération des produits et fournisseurs

**Endpoints proxy :**
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/harel/products` | GET | Liste des produits |
| `/harel/products/{id}` | GET | Détail d'un produit |
| `/harel/products/custom_fields` | GET | Champs personnalisés |
| `/harel/suppliers` | GET | Liste des fournisseurs |

**Authentification :** Header `X-AUTH-TOKEN`

### 5.2 API de taux de change (UniRateAPI)

**Fonctionnalité :** Récupération des taux de change

**Endpoint :**
```
GET /exchange_rate/{base}/{target}/{date}
```

**Exemple :**
```
GET /exchange_rate/EUR/USD/2026-01-25
→ { "rate": 1.0823 }
```

### 5.3 Webhook Wix

**Fonctionnalité :** Réception d'achats depuis Wix

**Endpoint :**
```
POST /wix/purchase
```

**Sécurité :** Validation HMAC SHA-256

**Traitement :**
1. Validation du webhook
2. Création d'un prépaiement via factory
3. Envoi de confirmation

### 5.4 Microtrak

**Fonctionnalité :** Suivi de position (tracking)

**Endpoint proxy :**
```
GET /admin/microtrak/position/{id}
```

---

## 6. Architecture technique

### 6.1 Backend (API)

#### Structure des dossiers
```
api/
├── config/                 # Configuration Symfony
│   ├── packages/          # Bundles
│   ├── routes/            # Routes
│   └── services.yaml      # Services
├── migrations/            # Migrations Doctrine
├── src/
│   ├── Controller/        # Contrôleurs personnalisés
│   ├── DataTransformer/   # Transformateurs de données
│   ├── Entity/            # Entités Doctrine (16)
│   ├── EventSubscriber/   # Événements
│   ├── Factory/           # Factories
│   ├── Filter/            # Filtres Doctrine
│   ├── Repository/        # Repositories
│   ├── Security/          # Sécurité OIDC
│   └── Service/           # Services métier (6)
└── tests/                 # Tests unitaires/fonctionnels
```

#### Services métier
| Service | Responsabilité |
|---------|----------------|
| ClientGetter | Récupération du client actif |
| FileUploader | Upload et traitement d'images |
| PdfGenerator | Génération de documents PDF |
| ExportFilterManager | Gestion des exports |
| DynamicMailerFactory | Configuration email par client |
| ExportUtils | Utilitaires d'export |

### 6.2 Frontend (PWA)

#### Structure des dossiers
```
pwa/
├── app/                    # App Router Next.js
│   ├── admin/             # Interface admin
│   ├── api/auth/          # Routes NextAuth
│   └── lib/               # Utilitaires métier
├── components/
│   ├── admin/             # Composants React Admin (33+)
│   ├── common/            # Composants réutilisables
│   └── dashboard/         # Dashboard
├── config/                # Configuration
├── types/                 # Types TypeScript (15)
└── utils/                 # Utilitaires
```

#### Composants React Admin
| Ressource | Create | Edit | List | Show |
|-----------|--------|------|------|------|
| Achats | ✅ | ✅ | ✅ | ✅ |
| Items | ✅ | ✅ | ✅ | - |
| Clients | ✅ | ✅ | ✅ | ✅ |
| Expenses | ✅ | ✅ | ✅ | ✅ |
| Taxes | ✅ | ✅ | ✅ | - |
| Statuses | ✅ | ✅ | ✅ | - |
| Currencies | ✅ | ✅ | ✅ | - |
| Users | - | ✅ | ✅ | ✅ |

### 6.3 Authentification (Keycloak)

#### Flux OIDC
```
┌─────────┐     ┌─────────┐     ┌──────────┐
│ Browser │────▶│ Next.js │────▶│ Keycloak │
└─────────┘     └─────────┘     └──────────┘
     │               │                │
     │  1. Login     │                │
     │──────────────▶│                │
     │               │  2. Redirect   │
     │               │───────────────▶│
     │               │                │
     │               │  3. Auth Code  │
     │               │◀───────────────│
     │               │                │
     │               │  4. Token      │
     │               │───────────────▶│
     │               │◀───────────────│
     │               │                │
     │  5. Session   │                │
     │◀──────────────│                │
```

#### Rôles et permissions
| Rôle | Accès |
|------|-------|
| OIDC_USER | Lecture/Écriture sur ressources propres |
| OIDC_ADMIN | Accès complet, gestion utilisateurs |

### 6.4 Temps réel (Mercure)

#### Utilisation
- Mise à jour en temps réel des listes
- Notifications de modifications
- Synchronisation multi-utilisateurs

#### Configuration
```
Mercure Hub: /.well-known/mercure
Topics: /achats, /expenses, etc.
```

---

## 7. Infrastructure et déploiement

### 7.1 Architecture Kubernetes

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cluster GKE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────┐   ┌─────────┐   ┌──────────┐   ┌─────────────┐   │
│   │   API   │   │   PWA   │   │ Keycloak │   │ PostgreSQL  │   │
│   │ (Caddy) │   │(Next.js)│   │          │   │             │   │
│   │ Pod x N │   │ Pod x N │   │  Pod x 1 │   │   Pod x 1   │   │
│   └────┬────┘   └────┬────┘   └────┬─────┘   └──────┬──────┘   │
│        │             │             │                 │          │
│   ┌────┴─────────────┴─────────────┴─────────────────┴────┐    │
│   │                    Service Layer                       │    │
│   └────────────────────────────┬──────────────────────────┘    │
│                                │                                 │
│   ┌────────────────────────────┴──────────────────────────┐    │
│   │                     Ingress (Nginx)                     │    │
│   └────────────────────────────┬──────────────────────────┘    │
│                                │                                 │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                          ┌──────┴──────┐
                          │  Cloudflare │
                          │    (DNS)    │
                          └─────────────┘
```

### 7.2 Pipelines CI/CD

| Pipeline | Déclencheur | Actions |
|----------|-------------|---------|
| CI | Push/PR | Tests, Lint, Build |
| CD | Tag/Label deploy | Build images, Deploy GKE |
| Security | Schedule | Analyse vulnérabilités |
| Cleanup | PR close | Suppression environnements |

### 7.3 Scaling

| Service | Min | Max | Cible CPU |
|---------|-----|-----|-----------|
| API | 1 | 100 | 50% |
| PWA | 1 | 100 | 50% |
| Keycloak | 1 | 1 | - |
| PostgreSQL | 1 | 1 | - |

---

## 8. Cas d'utilisation

### 8.1 Création d'un achat

**Acteur :** Utilisateur authentifié

**Préconditions :**
- Utilisateur connecté
- Client configuré avec API Harel

**Scénario principal :**
1. L'utilisateur accède à "Nouvel achat"
2. Il sélectionne le fournisseur
3. Il choisit les devises source et cible
4. Le système récupère le taux de change
5. L'utilisateur ajoute des produits
6. Le système calcule les totaux automatiquement
7. L'utilisateur applique les taxes
8. L'utilisateur enregistre l'achat

**Postconditions :**
- Achat créé avec statut "Brouillon"
- Items associés créés
- Taxes calculées

### 8.2 Export des dépenses

**Acteur :** Administrateur

**Préconditions :**
- Utilisateur avec rôle ADMIN
- Dépenses existantes

**Scénario principal :**
1. L'administrateur accède aux dépenses
2. Il applique les filtres souhaités
3. Il sélectionne le format (CSV/PDF)
4. Le système génère le fichier
5. Le fichier est téléchargé

---

## 9. Décisions d'architecture (ADR)

### ADR-0000 : Champs des livres
**Décision :** Dupliquer les champs `title` et `author` depuis l'API BNF pour le filtrage local.

### ADR-0001 : Sauvegarde données BNF
**Décision :** Utiliser un State Processor API Platform plutôt qu'un Entity Listener Doctrine.

### ADR-0002 : Collection IRI pour reviews
**Décision :** Exposer l'IRI de la collection plutôt que les données complètes pour éviter le sur-fetching.

### ADR-0003 : Mise à jour temps réel
**Décision :** Utiliser Mercure pour les communications temps réel.

### ADR-0004 : Données utilisateur
**Décision :** Synchroniser les utilisateurs entre Keycloak et l'API lors de l'authentification.

---

## 10. Annexes

### 10.1 Glossaire

| Terme | Définition |
|-------|------------|
| HT | Hors Taxes |
| TTC | Toutes Taxes Comprises |
| OIDC | OpenID Connect |
| ADR | Architecture Decision Record |
| PWA | Progressive Web App |
| Coefficient d'approche | Marge appliquée au prix d'achat |
| Covering | Couverture de change |

### 10.2 Endpoints API

```
GET    /achats                 Liste des achats
POST   /achats                 Créer un achat
GET    /achats/{id}            Détail d'un achat
PUT    /achats/{id}            Modifier un achat
DELETE /achats/{id}            Supprimer un achat

GET    /expenses               Liste des dépenses
POST   /expenses               Créer une dépense
GET    /expenses/{id}          Détail d'une dépense

GET    /harel/products         Produits Harel
GET    /harel/suppliers        Fournisseurs Harel

GET    /exchange_rate/{b}/{t}/{d}  Taux de change

GET    /exports/{entity}       Export CSV/PDF
```

### 10.3 Variables d'environnement

| Variable | Description |
|----------|-------------|
| DATABASE_URL | URL PostgreSQL |
| MERCURE_URL | URL Hub Mercure |
| OIDC_SERVER_URL | URL Keycloak |
| TRUSTED_PROXIES | Proxies de confiance |
| CORS_ALLOW_ORIGIN | Origines CORS |

---

*Document généré par analyse automatique du code source.*
