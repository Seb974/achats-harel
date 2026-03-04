# Intégration Module Achats Harel 4.0

## Vue d'ensemble

Le module **Achats Harel 4.0** est une application web PWA qui fonctionne comme une "calculette" pour les achats internationaux. Il reste en place et communique avec Odoo via API.

### Rôle de l'application

1. **Récupérer** les données maîtres depuis Odoo (produits, fournisseurs, UoM)
2. **Calculer** le prix de revient en EUR avec :
   - Prix d'achat en USD
   - Parité EUR/USD
   - Coefficient d'approche (frais, transit, douane)
3. **Créer** les commandes d'achat dans Odoo en EUR

## Architecture technique

### Stack App Achats

| Composant | Technologie |
|-----------|-------------|
| Frontend | React (PWA) |
| Backend | Symfony PHP |
| Base de données | PostgreSQL |
| Authentification | Keycloak (OIDC) |
| Hébergement | Docker / VPS |

### Communication avec Odoo

| Protocole | XML-RPC |
|-----------|---------|
| Endpoint | https://ah-chou1.odoo.com/xmlrpc/2/ |
| Authentification | API Key |

## API Odoo utilisée

### Fichiers clés

```
api/src/Service/OdooApiService.php    # Client XML-RPC
api/src/Controller/OdooDataController.php  # Proxy API
pwa/hooks/useOdoo.ts                  # Hook React
```

### Méthodes disponibles

#### Lecture données

| Méthode | Modèle Odoo | Champs |
|---------|-------------|--------|
| getProducts() | product.product | id, name, uom_id, uom_ids, list_price, standard_price |
| getProduct(id) | product.product | Détail complet |
| getSuppliers() | res.partner | id, name (fournisseurs) |
| getCategories() | product.category | id, name |
| getUoms() | uom.uom | id, name, factor |

#### Écriture données

| Méthode | Modèle Odoo | Action |
|---------|-------------|--------|
| createRFQ() | purchase.order | Crée brouillon |
| createPurchaseOrder() | purchase.order | Crée et confirme |
| confirmRFQ() | purchase.order | Confirme brouillon |

### Exemple de code

```php
// OdooApiService.php - Création commande
public function createPurchaseOrder(int $supplierId, array $lines, array $options = []): array
{
    $orderData = [
        'partner_id' => $supplierId,
        'state' => 'draft',
        'date_order' => $options['date_order'] ?? date('Y-m-d H:i:s'),
    ];
    
    if (!empty($options['notes'])) {
        $orderData['note'] = $options['notes'];  // Odoo 19: 'note' pas 'notes'
    }
    
    $orderId = $this->create('purchase.order', $orderData);
    
    foreach ($lines as $line) {
        $lineData = [
            'order_id' => $orderId,
            'product_id' => $line['product_id'],
            'product_qty' => $line['product_qty'],
            'price_unit' => $line['price_unit'],
        ];
        
        if (!empty($line['product_uom'])) {
            $lineData['product_uom_id'] = $line['product_uom'];  // Odoo 19
        }
        
        $this->create('purchase.order.line', $lineData);
    }
    
    $this->confirmRFQ($orderId);
    
    return ['order_id' => $orderId, 'state' => 'purchase'];
}
```

## Flux de calcul Prix de Revient

### Données d'entrée (App Achats)

| Champ | Description | Exemple |
|-------|-------------|---------|
| Prix USD/kg | Prix fournisseur | 2.50 |
| Prix USD/UVC | Prix par unité | 5.00 |
| Parité EUR/USD | Taux de change | 0.92 |
| Coef frais | Frais annexes | 1.15 |
| Coef total approche | Coefficient global | 1.35 |

### Formule

```
PR (EUR) = Prix USD × Parité EUR/USD × Coef total approche
```

### Exemple

```
Prix USD/UVC: 5.00
Parité: 0.92
Coef approche: 1.35

PR EUR = 5.00 × 0.92 × 1.35 = 6.21 EUR
```

### Code de calcul (useOdoo.ts)

```typescript
const calculateCostPrices = (
  achat: Achat,
  items: Item[]
): { item: Item; costPriceHT: number }[] => {
  const exchangeRate = achat.exchangeRate || 1;
  const approachCoef = achat.approachCoef || 1;
  
  return items.map(item => {
    const basePrice = item.incomingUnitPrice || 0;
    const costPriceHT = basePrice * exchangeRate * approachCoef;
    
    return {
      item,
      costPriceHT: Math.round(costPriceHT * 100) / 100
    };
  });
};
```

## Configuration client Odoo

### Entité Client (App Achats)

Chaque client de l'app a sa propre configuration Odoo :

| Champ | Description |
|-------|-------------|
| odooUrl | URL instance Odoo |
| odooDatabase | Nom base Odoo |
| odooUsername | Utilisateur API |
| odooApiKey | Clé API |
| dataSource | 'odoo' ou 'local' |

### Configuration AH CHOU

```
odooUrl: https://ah-chou1.odoo.com
odooDatabase: ah-chou1
odooUsername: mathieu.loic.hoarau@gmail.com
odooApiKey: [À générer dans Odoo]
dataSource: odoo
```

## Notes de version Odoo 19

| Changement | Odoo 18 | Odoo 19 |
|------------|---------|---------|
| Notes commande | notes | note |
| UoM ligne achat | product_uom | product_uom_id |
| Conditionnements | product.packaging | uom_ids (many2many vers uom.uom) |

## Tests API

### Test connexion

```bash
curl -X POST https://ah-chou1.odoo.com/xmlrpc/2/common \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0"?>
<methodCall>
  <methodName>version</methodName>
</methodCall>'
```

### Test authentification

Via l'application :
```
GET /api/odoo/test
Header: X-Client-Id: [client_id]
```

## Actions à réaliser

- [ ] Générer la clé API dans Odoo pour l'utilisateur
- [ ] Configurer le client AH CHOU dans l'App Achats
- [ ] Tester la connexion API
- [ ] Vérifier la lecture des produits
- [ ] Tester la création d'une commande

## Dépannage

| Problème | Solution |
|----------|----------|
| Erreur connexion | Vérifier URL, credentials, clé API |
| Produits vides | Vérifier purchase_ok = True sur produits |
| Erreur création commande | Vérifier les champs Odoo 19 (note, product_uom_id) |
