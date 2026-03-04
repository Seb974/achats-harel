# Gestion des Promotions et 3xNet

## Types de prix spéciaux

| Type | Définition | Période |
|------|------------|---------|
| **Promo** | Remise temporaire sur produit(s) | Date à date |
| **3xNet** | Prix net fixe sans remise applicable | Permanent ou temporaire |

## Configuration des promotions

### Activation

```
Ventes > Configuration > Paramètres
☑ Listes de prix avancées
☑ Dates de validité sur les règles de prix
```

### Création d'une promotion périodique

```
Ventes > Produits > Listes de prix > [Créer]
```

| Champ | Valeur |
|-------|--------|
| Nom | Promo Février 2026 - Poissons |
| Devise | EUR |
| Groupe de pays | France |

#### Règles de la promotion

| Produit | Remise | Date début | Date fin |
|---------|--------|------------|----------|
| Bichique standard | -20% | 01/02/2026 | 28/02/2026 |
| Anchois vidé | -15% | 01/02/2026 | 28/02/2026 |

### Application aux clients

**Méthode 1 : Par client**
```
Contacts > [Client] > Liste de prix > Promo Février 2026
```

**Méthode 2 : Par catégorie (tous les clients GMS)**
```
Utiliser une action automatique pour appliquer la promo
aux clients de catégorie GMS pendant la période
```

**Méthode 3 : Règles dans la liste principale**
```
Ajouter les règles promo avec dates directement
dans la liste de prix du client
```

## Gestion du 3xNet

### Définition

Le **3xNet** est un prix net fixe :
- Pas de remise supplémentaire applicable
- Prix ferme négocié avec le client
- Peut être permanent ou temporaire

### Configuration Odoo

#### Option 1 : Liste de prix dédiée 3xNet

```
Ventes > Produits > Listes de prix > [Créer]
Nom: 3xNet - [Client]
```

Règles avec prix fixes par produit.

#### Option 2 : Règle spécifique dans liste client

```
Liste de prix client:
├── Règle standard: -10% sur tous produits
└── Règle 3xNet: Produit X → Prix fixe 8.50€ (priorité haute)
```

### Marquage 3xNet pour reporting

Pour identifier les ventes en 3xNet dans les dashboards :

#### Champ personnalisé sur ligne de commande

```
Modèle: sale.order.line
Champ: x_is_3xnet (Boolean)
Label: "Prix 3xNet"
```

#### Automatisation

```python
# Marquer automatiquement si prix = prix liste 3xNet
@api.onchange('price_unit')
def _check_3xnet(self):
    pricelist_3xnet = self.order_id.partner_id.x_pricelist_3xnet
    if pricelist_3xnet:
        price_3xnet = pricelist_3xnet.get_product_price(self.product_id, 1, self.order_id.partner_id)
        self.x_is_3xnet = (self.price_unit == price_3xnet)
```

## Reporting Promos / 3xNet

Le cahier des charges demande des colonnes séparées :
- Total
- Promo
- Hors Promo
- 3xNet
- Ristournable

### Solution

Créer des champs calculés sur les commandes/factures :

| Champ | Calcul |
|-------|--------|
| x_total_promo | Somme lignes où remise > 0 ET date promo |
| x_total_hors_promo | Somme lignes où remise = 0 OU hors période |
| x_total_3xnet | Somme lignes où x_is_3xnet = True |
| x_total_ristournable | Somme lignes où produit ristournable |

## RFA (Ristourne Fin d'Année)

### Définition

Remise calculée sur le CA annuel du client.

### Configuration

```
Champ client: x_taux_rfa (Float %)
```

### Calcul automatique

Créer une action planifiée (cron) :

```python
# Exécution: 1er janvier de chaque année
def calculate_rfa():
    for partner in partners.search([('x_taux_rfa', '>', 0)]):
        ca_annuel = sum(partner.invoice_ids.filtered(
            lambda i: i.date.year == annee_precedente
        ).mapped('amount_untaxed'))
        
        rfa_amount = ca_annuel * partner.x_taux_rfa / 100
        # Créer un avoir ou une facture de RFA
```

## Actions à réaliser

- [ ] Activer les dates de validité sur règles de prix
- [ ] Créer un template de liste promotionnelle
- [ ] Définir le processus de création de promo
- [ ] Créer les champs x_is_3xnet, x_total_promo, etc.
- [ ] Configurer le calcul automatique RFA
- [ ] Documenter le processus pour les commerciaux

## Tests

- [ ] Créer une promo temporaire → Vérifier dates actives
- [ ] Appliquer un 3xNet → Vérifier que remise client ne s'applique pas
- [ ] Générer un rapport promo/hors promo/3xnet
- [ ] Simuler un calcul RFA
