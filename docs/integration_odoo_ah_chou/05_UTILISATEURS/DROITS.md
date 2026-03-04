# Configuration des Droits d'Accès

## Groupes Odoo natifs

### Ventes

| Groupe | Description |
|--------|-------------|
| sales_team.group_sale_salesman | Utilisateur ventes |
| sales_team.group_sale_salesman_all_leads | Voir toutes les ventes |
| sales_team.group_sale_manager | Responsable ventes |

### Achats

| Groupe | Description |
|--------|-------------|
| purchase.group_purchase_user | Utilisateur achats |
| purchase.group_purchase_manager | Responsable achats |

### Stock

| Groupe | Description |
|--------|-------------|
| stock.group_stock_user | Utilisateur stock |
| stock.group_stock_manager | Responsable stock |

### Comptabilité

| Groupe | Description |
|--------|-------------|
| account.group_account_invoice | Facturation |
| account.group_account_user | Comptable |
| account.group_account_manager | Responsable comptabilité |

### Point de vente

| Groupe | Description |
|--------|-------------|
| point_of_sale.group_pos_user | Utilisateur POS |
| point_of_sale.group_pos_manager | Responsable POS |

## Groupes personnalisés à créer

### Module : ah_chou_access

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data>
        <!-- Catégorie -->
        <record id="module_category_ah_chou" model="ir.module.category">
            <field name="name">AH CHOU</field>
            <field name="sequence">100</field>
        </record>

        <!-- Groupe Direction (lecture seule globale) -->
        <record id="group_direction" model="res.groups">
            <field name="name">Direction</field>
            <field name="category_id" ref="module_category_ah_chou"/>
            <field name="implied_ids" eval="[(4, ref('sales_team.group_sale_salesman')),
                                             (4, ref('purchase.group_purchase_user')),
                                             (4, ref('stock.group_stock_user')),
                                             (4, ref('account.group_account_invoice'))]"/>
        </record>

        <!-- Groupe Commercial restreint -->
        <record id="group_commercial_restricted" model="res.groups">
            <field name="name">Commercial (ses clients uniquement)</field>
            <field name="category_id" ref="module_category_ah_chou"/>
            <field name="implied_ids" eval="[(4, ref('sales_team.group_sale_salesman'))]"/>
        </record>
    </data>
</odoo>
```

## Règles d'enregistrement (Record Rules)

### Commercial : Voir uniquement ses clients

```xml
<record id="rule_partner_commercial_own" model="ir.rule">
    <field name="name">Commercial : ses clients uniquement</field>
    <field name="model_id" ref="base.model_res_partner"/>
    <field name="groups" eval="[(4, ref('group_commercial_restricted'))]"/>
    <field name="domain_force">[('x_commercial', '=', user.id)]</field>
    <field name="perm_read" eval="True"/>
    <field name="perm_write" eval="True"/>
    <field name="perm_create" eval="True"/>
    <field name="perm_unlink" eval="False"/>
</record>
```

### Commercial : Voir uniquement ses commandes

```xml
<record id="rule_sale_order_commercial_own" model="ir.rule">
    <field name="name">Commercial : ses commandes uniquement</field>
    <field name="model_id" ref="sale.model_sale_order"/>
    <field name="groups" eval="[(4, ref('group_commercial_restricted'))]"/>
    <field name="domain_force">[('user_id', '=', user.id)]</field>
    <field name="perm_read" eval="True"/>
    <field name="perm_write" eval="True"/>
    <field name="perm_create" eval="True"/>
    <field name="perm_unlink" eval="False"/>
</record>
```

### Direction : Lecture seule sur tout

```xml
<record id="rule_direction_readonly_sale" model="ir.rule">
    <field name="name">Direction : lecture seule ventes</field>
    <field name="model_id" ref="sale.model_sale_order"/>
    <field name="groups" eval="[(4, ref('group_direction'))]"/>
    <field name="domain_force">[(1, '=', 1)]</field>
    <field name="perm_read" eval="True"/>
    <field name="perm_write" eval="False"/>
    <field name="perm_create" eval="False"/>
    <field name="perm_unlink" eval="False"/>
</record>
```

## Masquage de champs

### Cacher le prix d'achat aux commerciaux

```xml
<record id="view_product_form_hide_cost" model="ir.ui.view">
    <field name="name">product.template.form.hide.cost</field>
    <field name="model">product.template</field>
    <field name="inherit_id" ref="product.product_template_form_view"/>
    <field name="groups_id" eval="[(4, ref('group_commercial_restricted'))]"/>
    <field name="arch" type="xml">
        <field name="standard_price" position="attributes">
            <attribute name="invisible">1</attribute>
        </field>
    </field>
</record>
```

## Configuration par profil

### Administrateur

```yaml
Utilisateur: admin@ahchou.com
Groupes:
  - Administration / Paramètres
  - Ventes / Responsable
  - Achats / Responsable
  - Stock / Responsable
  - Comptabilité / Responsable
  - Point de vente / Responsable
```

### Responsable Achats

```yaml
Utilisateur: achats@ahchou.com
Groupes:
  - Achats / Responsable
  - Stock / Utilisateur
  - Ventes / Utilisateur (lecture)
```

### Commercial

```yaml
Utilisateur: commercial1@ahchou.com
Groupes:
  - AH CHOU / Commercial (ses clients uniquement)
  - Ventes / Utilisateur
```

### Logistique

```yaml
Utilisateur: logistique@ahchou.com
Groupes:
  - Stock / Responsable
```

### Comptable

```yaml
Utilisateur: compta@ahchou.com
Groupes:
  - Comptabilité / Comptable
  - Ventes / Facturation
  - Achats / Facturation
```

### Direction

```yaml
Utilisateur: direction@ahchou.com
Groupes:
  - AH CHOU / Direction
```

### Caissier

```yaml
Utilisateur: caisse@ahchou.com
Groupes:
  - Point de vente / Utilisateur
```

## Actions à réaliser

- [ ] Créer le module ah_chou_access
- [ ] Définir les groupes personnalisés
- [ ] Créer les règles d'enregistrement
- [ ] Créer les vues avec masquage de champs
- [ ] Créer les utilisateurs
- [ ] Attribuer les groupes
- [ ] Tester chaque profil

## Tests de sécurité

Pour chaque profil, vérifier :

- [ ] Accès aux menus autorisés
- [ ] Non-accès aux menus interdits
- [ ] Lecture des données autorisées
- [ ] Non-lecture des données interdites
- [ ] Création/modification selon droits
- [ ] Champs masqués effectivement invisibles
