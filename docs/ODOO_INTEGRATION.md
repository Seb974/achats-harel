# Intégration Odoo

Ce document décrit l'intégration de l'application avec Odoo pour la gestion des produits, fournisseurs et demandes de devis.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  Backend Symfony │────▶│   Odoo Online   │
│  (React Admin)  │     │  (Proxy Odoo)    │     │ (XML-RPC API)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Configuration

### 1. Configuration du Client

Dans l'interface d'administration, éditez le client et configurez :

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Source de données** | Sélectionner "Odoo" | `odoo` |
| **URL Odoo** | URL de l'instance Odoo | `https://citybike16.odoo.com` |
| **Base de données** | Nom de la base Odoo | `citybike16` |
| **Utilisateur Odoo** | Email ou login | `admin@example.com` |
| **Clé API Odoo** | Clé API ou mot de passe | `votre_cle_api` |

### 2. Génération de la clé API Odoo

1. Connectez-vous à Odoo
2. Allez dans **Paramètres** > **Utilisateurs**
3. Sélectionnez votre utilisateur
4. Onglet **Clés API** > **Nouvelle clé API**
5. Copiez la clé générée

### 3. Migration de la base de données

Exécutez la migration Doctrine :

```bash
cd api
php bin/console doctrine:migrations:migrate
```

## Endpoints API

### Test de connexion
```
GET /odoo/test
```
Vérifie que la connexion à Odoo fonctionne.

### Produits
```
GET /odoo/products?limit=100&offset=0
GET /odoo/products/{id}
```
Récupère les produits avec leurs packagings et catégories.

### Fournisseurs
```
GET /odoo/suppliers?limit=100&offset=0
```
Récupère la liste des fournisseurs.

### Création de RFQ (Request For Quotation)
```
POST /odoo/rfq
Content-Type: application/json

{
  "supplier_id": 123,
  "lines": [
    {
      "product_id": 1,
      "quantity": 10,
      "price_unit": 25.50,
      "name": "Description optionnelle"
    }
  ],
  "origin": "ACHAT-2024-001",
  "notes": "Notes pour le fournisseur"
}
```

### Création de commande fournisseur confirmée (Purchase Order)
```
POST /odoo/purchase-order
Content-Type: application/json

{
  "supplier_id": 123,
  "lines": [
    {
      "product_id": 1,
      "product_qty": 4000,
      "price_unit": 2.39538,
      "product_uom": 1,
      "name": "ANC000 Anchois - Conditionnement: 200 Carton de 20"
    }
  ],
  "origin": "EXP-2024-001",
  "date_order": "2024-01-26 10:00:00",
  "date_planned": "2024-02-15",
  "notes": "Notes détaillées avec informations de l'achat HAREL"
}
```

Cette endpoint crée directement une **commande confirmée** (état "purchase") avec :
- Les quantités en **unités de base** (mainQuantity)
- Les **prix de revient** calculés (incluant coûts d'approche et taxes)
- Des notes détaillées contenant toutes les informations de l'achat original

### Catégories
```
GET /odoo/categories
```

### Unités de mesure
```
GET /odoo/uom
```

## Mapping des données

### Produits HAREL → Odoo

| Champ HAREL | Champ Odoo |
|-------------|------------|
| `id` | `id` |
| `code` | `default_code` |
| `label` | `name` |
| `category` | `categ_id` |
| `availableQuantity` | `qty_available` |
| `packagings` | `packaging_ids` (relation) |

### Format de réponse produit

```json
{
  "id": 376,
  "code": "WAN000",
  "label": "Wantane Crevette 240g Vietnam",
  "category": {
    "id": 3,
    "name": "CRUSTACE"
  },
  "availableQuantity": 100,
  "packagings": [
    {
      "id": 376,
      "name": "Colis 25 u",
      "unit_factor": 25,
      "unit": "unit"
    }
  ],
  "unitPrice": 15.50,
  "stockManagement": true,
  "deleted": false
}
```

## Utilisation Frontend

### Hook useOdoo

```tsx
import { useOdoo } from '../hooks/useOdoo';

const MyComponent = () => {
  const { 
    isOdooConfigured, 
    dataSource,
    loading,
    createRFQ,
    getProducts,
    getSuppliers 
  } = useOdoo();

  // Vérifier si Odoo est configuré
  if (!isOdooConfigured) {
    return <Alert>Odoo non configuré</Alert>;
  }

  // Créer un RFQ
  const handleCreateRFQ = async () => {
    const result = await createRFQ({
      supplier_id: 123,
      lines: [{ product_id: 1, quantity: 10, price_unit: 25.50 }],
      origin: 'ACHAT-001'
    });
    
    if (result.success) {
      console.log('RFQ créé:', result.rfq_name);
    }
  };
};
```

### Composant SendToOdooButton

```tsx
import { SendToOdooButton } from '../components/admin/achat/SendToOdooButton';

// Dans AchatShow ou AchatsEdit
<SendToOdooButton label="Envoyer vers Odoo" />
```

### Test de connexion

Le formulaire de configuration client inclut un bouton "Tester la connexion Odoo" qui vérifie :
- La connexion au serveur
- L'authentification
- La version d'Odoo

## Fichiers créés/modifiés

### Backend (API)

| Fichier | Description |
|---------|-------------|
| `src/Service/OdooApiService.php` | Service XML-RPC pour Odoo |
| `src/Controller/OdooDataController.php` | Contrôleur proxy API |
| `src/Entity/Client.php` | Ajout des champs Odoo |
| `migrations/Version20260125_AddOdooFields.php` | Migration DB |

### Frontend (PWA)

| Fichier | Description |
|---------|-------------|
| `components/admin/Admin.tsx` | DataProvider avec support Odoo |
| `components/admin/client/ClientsEdit.tsx` | Formulaire avec champs Odoo |
| `components/admin/client/ClientsCreate.tsx` | Formulaire création avec Odoo |
| `components/admin/client/OdooConnectionTest.tsx` | Bouton test connexion |
| `components/admin/achat/SendToOdooButton.tsx` | Bouton envoi vers Odoo |
| `hooks/useOdoo.ts` | Hook personnalisé Odoo |

## Flux de travail typique

1. **Configuration** : Configurer les paramètres Odoo dans le client
2. **Test** : Tester la connexion avec le bouton dédié
3. **Produits** : Les produits sont automatiquement chargés depuis Odoo
4. **Fournisseurs** : Les fournisseurs sont listés depuis Odoo
5. **Achat** : Créer un achat avec calcul du coût de revient
6. **Envoi** : Utiliser "Envoyer vers Odoo" pour créer une commande confirmée
7. **Odoo** : La commande est directement disponible dans Achats > Bons de commande

## Calcul du prix de revient

Le prix de revient envoyé à Odoo est calculé selon la formule suivante :

```
Prix de revient = (Total HT × Coeff. approche + Taxes catégorie + Taxes globales) / Quantité unités de base
```

Ce calcul prend en compte :
- **Coefficient d'approche** : Coûts de transport, douanes, couverture de change
- **Taxes par catégorie** : Taxes spécifiques à chaque catégorie de produits
- **Taxes globales** : Taxes appliquées à l'ensemble de l'achat
- **Méthode de répartition** : Par quantité, coût ou poids (configurable par client)

## Dépannage

### Erreur d'authentification
- Vérifier l'URL Odoo (sans slash final)
- Vérifier le nom de la base de données
- Vérifier que l'utilisateur a les droits API
- Régénérer la clé API si nécessaire

### Produits non trouvés
- Vérifier que les produits sont marqués "achetables" dans Odoo
- Vérifier les droits d'accès de l'utilisateur

### RFQ non créé
- Vérifier que le fournisseur existe dans Odoo
- Vérifier que les produits existent dans Odoo
- Vérifier les droits sur le module Achats

## Support

Pour toute question sur l'intégration Odoo, contactez l'équipe de développement.
