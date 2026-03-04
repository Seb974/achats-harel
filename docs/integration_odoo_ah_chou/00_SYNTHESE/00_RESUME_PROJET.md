# DOSSIER D'INTÉGRATION ODOO - AH CHOU SARL

## Informations générales

| Élément | Valeur |
|---------|--------|
| **Client** | AH CHOU SARL |
| **Activité** | Distribution de produits surgelés (La Réunion) |
| **Instance Odoo** | https://ah-chou1.odoo.com/odoo |
| **Version** | Odoo 19 Enterprise |
| **Date début projet** | Février 2026 |

## Périmètre fonctionnel

### Modules Odoo à activer

| Module | Priorité | Statut |
|--------|----------|--------|
| Ventes (sale) | ⭐⭐⭐ | À configurer |
| Achats (purchase) | ⭐⭐⭐ | À configurer |
| Stock (stock) | ⭐⭐⭐ | À configurer |
| Comptabilité (account) | ⭐⭐⭐ | À configurer |
| Point de Vente (point_of_sale) | ⭐⭐ | À configurer |
| CRM | ⭐ | Optionnel |

### Intégrations externes

| Système | Type | Flux |
|---------|------|------|
| Module Achats Harel 4.0 | API REST | Odoo → App (produits) / App → Odoo (commandes) |
| Cegid Quadra | Import plan comptable | 910 comptes à reprendre |

## Architecture cible

```
┌─────────────────────────────────────────────────────────────────┐
│                        ODOO 19 ENTERPRISE                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │
│  │ VENTES  │  │ ACHATS  │  │  STOCK  │  │ COMPTA  │  │  POS  │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └───┬───┘ │
│       │            │            │            │           │      │
│       └────────────┴────────────┴────────────┴───────────┘      │
│                              │                                   │
│                      ┌───────┴───────┐                          │
│                      │   DASHBOARDS  │                          │
│                      └───────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ API XML-RPC
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MODULE ACHATS HAREL 4.0                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  CALCULETTE : Calcul PR avec coef approche, parité USD  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Flux : Récupère produits/fournisseurs Odoo                     │
│         Calcule PR en EUR                                        │
│         Crée commandes d'achat dans Odoo                        │
└─────────────────────────────────────────────────────────────────┘
```

## Données à importer

| Type | Source | Quantité | Format |
|------|--------|----------|--------|
| Clients | trame client | ~500 | Excel |
| Articles | Trame articles | 377 | Excel |
| Fournisseurs | TRAME FRS | 999 | Excel |
| Plan comptable | Cegid Quadra | 910 | Excel |

## Livrables

1. **Paramétrage Odoo documenté** - Configuration complète de chaque module
2. **Scripts d'import** - Python pour charger les données
3. **Mapping des champs** - Correspondance Excel source → Odoo
4. **Dashboards** - Indicateurs ventes/achats/stock
5. **Documentation utilisateur** - Par profil
6. **Scénarios de test** - Validation fonctionnelle

## Planning des phases

| Phase | Contenu |
|-------|---------|
| **Phase 1** | Paramétrage général (société, localisation, TVA) |
| **Phase 2** | Structure données (catégories, UoM, groupes) |
| **Phase 3** | Import données (clients, articles, fournisseurs) |
| **Phase 4** | Configuration modules (ventes, achats, stock) |
| **Phase 5** | Dashboards et reporting |
| **Phase 6** | Utilisateurs et droits |
| **Phase 7** | Tests et validation |
| **Phase 8** | Mise en production |

## Contacts

| Rôle | Contact |
|------|---------|
| Client | AH CHOU SARL |
| Intégrateur | CREAZOT |
| Admin Odoo | mathieu.loic.hoarau@gmail.com |
