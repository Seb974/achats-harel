# Gestion des Devises

## Configuration

### Devise principale

| Paramètre | Valeur |
|-----------|--------|
| Devise société | EUR (€) |
| Symbole | € |
| Position | Après le montant |
| Décimales | 2 |

### Devise secondaire (achats import)

| Paramètre | Valeur |
|-----------|--------|
| Devise | USD ($) |
| Usage | Achats fournisseurs internationaux |
| Taux | Variable (mise à jour régulière) |

## Configuration Odoo

```
Comptabilité > Configuration > Devises
```

### Activation multi-devises

```
Paramètres > Comptabilité > Devises
☑ Multi-devises
☑ Comptes de gain/perte de change automatiques
```

### Comptes de change

| Type | Compte |
|------|--------|
| Gain de change | 766 - Gains de change |
| Perte de change | 666 - Pertes de change |

## Gestion des taux de change

### Option 1 : Mise à jour manuelle

```
Comptabilité > Configuration > Devises > USD > Taux
```

Saisir le taux EUR/USD à la date souhaitée.

### Option 2 : Mise à jour automatique (recommandé)

```
Paramètres > Comptabilité > Devises
☑ Taux de change automatiques
   Service : Banque Centrale Européenne (BCE)
   Fréquence : Quotidienne
```

## Flux achats en USD

Le module Achats Harel gère la conversion USD → EUR avec :

1. **Prix d'achat USD/kg** : Prix fournisseur
2. **Prix d'achat USD/UVC** : Prix par unité
3. **Parité EUR/USD** : Taux de conversion
4. **Coef frais** : Frais d'approche
5. **Coef total approche** : Coefficient global

### Formule de calcul PR

```
PR (EUR) = Prix USD × Parité EUR/USD × Coef total approche
```

### Synchronisation avec Odoo

Le module Achats Harel :
- Récupère les produits depuis Odoo (en EUR)
- Effectue les calculs en USD puis convertit en EUR
- Crée les commandes d'achat dans Odoo en EUR (devise société)

## Actions à réaliser

- [ ] Activer la gestion multi-devises
- [ ] Activer la devise USD
- [ ] Configurer les comptes de gain/perte de change
- [ ] Choisir la méthode de mise à jour des taux
- [ ] Documenter le processus de conversion du module Achats

## Notes

La parité EUR/USD est gérée dans le module Achats Harel pour les calculs de prix de revient. Odoo stocke uniquement les montants finaux en EUR.
