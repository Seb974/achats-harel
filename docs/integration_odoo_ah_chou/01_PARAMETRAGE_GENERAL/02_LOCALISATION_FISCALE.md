# Localisation Fiscale - La Réunion (DOM)

## Taux de TVA applicables

Les DOM (Départements d'Outre-Mer) bénéficient de taux de TVA réduits par rapport à la métropole.

| Taux | Application | Odoo |
|------|-------------|------|
| **2.1%** | Produits alimentaires, presse | TVA 2.1% DOM |
| **8.5%** | Taux intermédiaire (services, restauration) | TVA 8.5% DOM |
| **0%** | Exonéré (certains produits de première nécessité) | Exonéré |

### Produits concernés par l'activité

| Catégorie | Taux applicable |
|-----------|-----------------|
| Produits surgelés alimentaires | 2.1% |
| Produits de la mer | 2.1% |
| Condiments | 2.1% |
| Snacking préparé | 2.1% ou 8.5% selon transformation |

## Configuration Odoo

### Création des taxes

```
Comptabilité > Configuration > Taxes
```

| Nom taxe | Type | Montant | Compte collecte | Compte déductible |
|----------|------|---------|-----------------|-------------------|
| TVA 2.1% DOM (ventes) | Vente | 2.1% | 44571 | - |
| TVA 2.1% DOM (achats) | Achat | 2.1% | - | 44566 |
| TVA 8.5% DOM (ventes) | Vente | 8.5% | 44571 | - |
| TVA 8.5% DOM (achats) | Achat | 8.5% | - | 44566 |
| Exonéré (ventes) | Vente | 0% | - | - |
| Exonéré (achats) | Achat | 0% | - | - |

### Positions fiscales

```
Comptabilité > Configuration > Positions fiscales
```

| Position | Usage | Mapping |
|----------|-------|---------|
| DOM - Standard | Clients/Fournisseurs Réunion | TVA 2.1%, 8.5% |
| Export hors DOM | Clients hors DOM | Exonéré |
| Import | Fournisseurs internationaux | Exonéré (régime import) |

## Octroi de Mer

L'Octroi de Mer est une taxe spécifique aux DOM. 

**Décision client : Non applicable** pour ce projet.

Si nécessaire ultérieurement, configuration :
- Créer une taxe "Octroi de Mer" par catégorie de produit
- Taux variable selon produit (0% à 40%)

## Plan comptable

Utilisation du **PCG France** avec adaptation DOM.

Les comptes spécifiques DOM :
- 44571 : TVA collectée DOM
- 44566 : TVA déductible DOM

## Actions à réaliser

- [ ] Installer la localisation française (l10n_fr)
- [ ] Créer les taxes DOM (2.1%, 8.5%, 0%)
- [ ] Créer les positions fiscales
- [ ] Assigner les taxes par défaut aux catégories de produits
- [ ] Vérifier les comptes de TVA dans le plan comptable

## Références légales

- Code Général des Impôts - Article 294 à 296 (TVA DOM)
- Taux en vigueur : https://www.service-public.fr/professionnels-entreprises/vosdroits/F23567
