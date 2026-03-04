# BLOC 1.2 - Guide de Configuration Taxes TVA DOM

**Objectif:** Configurer les taxes TVA spécifiques aux Départements d'Outre-Mer (DOM)

---

## Contexte réglementaire

### Taux de TVA DOM (Martinique, Guadeloupe, Réunion)
Les DOM bénéficient de taux de TVA réduits par rapport à la métropole :
- **Taux normal DOM:** 8,5% (vs 20% métropole)
- **Taux réduit DOM:** 2,1% (vs 5,5% métropole)
- **Exonération:** 0% (pour certains produits et services)

---

## Accès à la configuration

### Navigation
1. Se connecter à https://ah-chou1.odoo.com
2. Aller dans **Comptabilité** (icône dans le menu principal)
3. Menu **Configuration > Taxes**
4. Ou directement : `Comptabilité > Configuration > Taxes`

---

## Taxes à créer

### Vue d'ensemble
| Taxe | Taux | Portée | Type |
|------|------|--------|------|
| TVA 2.1% DOM (Ventes) | 2.1% | Ventes | Pourcentage du prix |
| TVA 2.1% DOM (Achats) | 2.1% | Achats | Pourcentage du prix |
| TVA 8.5% DOM (Ventes) | 8.5% | Ventes | Pourcentage du prix |
| TVA 8.5% DOM (Achats) | 8.5% | Achats | Pourcentage du prix |
| Exonéré DOM (Ventes) | 0% | Ventes | Pourcentage du prix |
| Exonéré DOM (Achats) | 0% | Achats | Pourcentage du prix |

---

## Configuration détaillée

### 1. TVA 2.1% DOM (Ventes)

#### Bouton "Créer"
Cliquer sur le bouton **Créer** pour ajouter une nouvelle taxe.

#### Onglet "Définition"

**Nom de la taxe**
- **Champ:** Nom
- **Valeur:** `TVA 2.1% DOM (Ventes)`
- **Requis:** ✅ Oui

**Type de taxe**
- **Champ:** Type de taxe
- **Valeur:** `Ventes`
- **Requis:** ✅ Oui

**Calcul de la taxe**
- **Champ:** Calcul de la taxe
- **Valeur:** `Pourcentage du prix`
- **Requis:** ✅ Oui

**Montant**
- **Champ:** Montant
- **Valeur:** `2.1`
- **Format:** Nombre décimal
- **Requis:** ✅ Oui

**Portée de la taxe**
- **Champ:** Portée de la taxe
- **Valeur:** `Ventes`
- **Options:** Ventes / Achats / Aucun
- **Requis:** ✅ Oui

#### Onglet "Options avancées"

**Étiquette sur les factures**
- **Champ:** Étiquette sur les factures
- **Valeur:** `TVA 2,1%` (apparaîtra sur les documents)
- **Recommandé:** ✅ Oui

**Compte de taxe (crédit)**
- **Champ:** Compte de taxe
- **Valeur:** `445710 - TVA collectée` (ou équivalent dans le plan comptable)
- **Requis:** ✅ Oui

**Affectation de la taxe sur les factures**
- **Champ:** Affectation de la taxe sur les factures
- **Valeur:** `Basé sur la facture`
- **Requis:** ✅ Oui

**Inclus dans le prix**
- **Case à cocher:** Inclus dans le prix
- **Valeur:** ❌ Décoché (prix HT par défaut)
- **Note:** Cocher si vous travaillez en TTC

#### Sauvegarder
Cliquer sur **Enregistrer** pour créer la taxe.

---

### 2. TVA 2.1% DOM (Achats)

#### Paramètres identiques sauf :

**Nom de la taxe**
- **Valeur:** `TVA 2.1% DOM (Achats)`

**Type de taxe**
- **Valeur:** `Achats`

**Portée de la taxe**
- **Valeur:** `Achats`

**Compte de taxe (débit)**
- **Valeur:** `445660 - TVA déductible` (ou équivalent)

---

### 3. TVA 8.5% DOM (Ventes)

#### Onglet "Définition"

**Nom de la taxe**
- **Valeur:** `TVA 8.5% DOM (Ventes)`

**Type de taxe**
- **Valeur:** `Ventes`

**Calcul de la taxe**
- **Valeur:** `Pourcentage du prix`

**Montant**
- **Valeur:** `8.5`

**Portée de la taxe**
- **Valeur:** `Ventes`

#### Onglet "Options avancées"

**Étiquette sur les factures**
- **Valeur:** `TVA 8,5%`

**Compte de taxe (crédit)**
- **Valeur:** `445710 - TVA collectée`

---

### 4. TVA 8.5% DOM (Achats)

#### Paramètres identiques sauf :

**Nom de la taxe**
- **Valeur:** `TVA 8.5% DOM (Achats)`

**Type de taxe**
- **Valeur:** `Achats`

**Portée de la taxe**
- **Valeur:** `Achats`

**Compte de taxe (débit)**
- **Valeur:** `445660 - TVA déductible`

---

### 5. Exonéré DOM (Ventes)

#### Onglet "Définition"

**Nom de la taxe**
- **Valeur:** `Exonéré DOM 0% (Ventes)`

**Type de taxe**
- **Valeur:** `Ventes`

**Calcul de la taxe**
- **Valeur:** `Pourcentage du prix`

**Montant**
- **Valeur:** `0`

**Portée de la taxe**
- **Valeur:** `Ventes`

#### Onglet "Options avancées"

**Étiquette sur les factures**
- **Valeur:** `Exonéré TVA`

**Compte de taxe**
- **Valeur:** `445710 - TVA collectée` (ou laisser vide selon configuration)

**Notes**
- Cette taxe est utilisée pour les produits et services exonérés de TVA
- Ajouter une mention légale si nécessaire (ex: "Exonération article 295 du CGI")

---

### 6. Exonéré DOM (Achats)

#### Paramètres identiques sauf :

**Nom de la taxe**
- **Valeur:** `Exonéré DOM 0% (Achats)`

**Type de taxe**
- **Valeur:** `Achats`

**Portée de la taxe**
- **Valeur:** `Achats`

---

## Checklist de configuration

### Taxes de vente (3)
- [ ] TVA 2.1% DOM (Ventes) créée
- [ ] TVA 8.5% DOM (Ventes) créée
- [ ] Exonéré DOM 0% (Ventes) créée
- [ ] Comptes comptables corrects (445710)
- [ ] Étiquettes sur factures définies

### Taxes d'achat (3)
- [ ] TVA 2.1% DOM (Achats) créée
- [ ] TVA 8.5% DOM (Achats) créée
- [ ] Exonéré DOM 0% (Achats) créée
- [ ] Comptes comptables corrects (445660)
- [ ] Étiquettes sur factures définies

### Paramètres généraux
- [ ] Toutes les taxes = "Pourcentage du prix"
- [ ] Montants corrects (2.1 / 8.5 / 0)
- [ ] Portées correctes (Ventes/Achats)
- [ ] Types corrects (Ventes/Achats)

---

## Configuration des positions fiscales

### Créer une position fiscale DOM

#### Navigation
`Comptabilité > Configuration > Positions fiscales > Créer`

#### Paramètres

**Nom**
- **Valeur:** `DOM - Départements d'Outre-Mer`

**Détection automatique**
- **Case à cocher:** ✅ Cocher
- **Critères:** Sélectionner "Pays" = "France" + "État" = "Martinique" (ou autre DOM)

#### Mapping des taxes

**Remplacer les taxes métropolitaines par les taxes DOM :**

| Taxe d'origine (Métropole) | Taxe de remplacement (DOM) |
|----------------------------|----------------------------|
| TVA 20% (Ventes) | TVA 8.5% DOM (Ventes) |
| TVA 20% (Achats) | TVA 8.5% DOM (Achats) |
| TVA 5.5% (Ventes) | TVA 2.1% DOM (Ventes) |
| TVA 5.5% (Achats) | TVA 2.1% DOM (Achats) |

**Note:** Ce mapping permet d'appliquer automatiquement les bonnes taxes selon la position fiscale du client/fournisseur.

---

## Validation et tests

### Test 1 : Devis avec TVA 2.1%
1. Aller dans `Ventes > Devis > Créer`
2. Sélectionner un client
3. Ajouter une ligne de produit
4. Sélectionner la taxe `TVA 2.1% DOM (Ventes)`
5. Vérifier le calcul :
   - Prix HT : 100 €
   - TVA 2.1% : 2,10 €
   - Prix TTC : 102,10 €

### Test 2 : Devis avec TVA 8.5%
1. Créer un nouveau devis
2. Ajouter une ligne de produit
3. Sélectionner la taxe `TVA 8.5% DOM (Ventes)`
4. Vérifier le calcul :
   - Prix HT : 100 €
   - TVA 8.5% : 8,50 €
   - Prix TTC : 108,50 €

### Test 3 : Devis avec Exonération
1. Créer un nouveau devis
2. Ajouter une ligne de produit
3. Sélectionner la taxe `Exonéré DOM 0% (Ventes)`
4. Vérifier le calcul :
   - Prix HT : 100 €
   - TVA 0% : 0,00 €
   - Prix TTC : 100,00 €

### Test 4 : Bon de commande avec TVA (Achats)
1. Aller dans `Achats > Commandes > Créer`
2. Sélectionner un fournisseur
3. Ajouter une ligne de produit
4. Sélectionner la taxe `TVA 8.5% DOM (Achats)`
5. Vérifier le calcul
6. Confirmer la commande

### Test 5 : Écriture comptable
1. Confirmer un devis en facture
2. Valider la facture
3. Aller dans `Comptabilité > Écritures`
4. Vérifier que les comptes sont corrects :
   - Compte client débité (411xxx)
   - Compte de vente crédité (707xxx)
   - Compte TVA collectée crédité (445710)

---

## Captures d'écran recommandées

Après configuration, prendre des captures d'écran de :
1. **Liste des taxes créées** (`Comptabilité > Configuration > Taxes`)
2. **Détail de la taxe TVA 2.1% DOM (Ventes)**
3. **Détail de la taxe TVA 8.5% DOM (Ventes)**
4. **Détail de la taxe Exonéré DOM (Ventes)**
5. **Position fiscale DOM** avec mapping
6. **Devis test avec TVA 2.1%**
7. **Devis test avec TVA 8.5%**
8. **Écriture comptable d'une facture avec TVA**

Enregistrer les captures dans `docs/integration_odoo_ah_chou/BLOC1_SCREENSHOTS/`

---

## Problèmes courants

### Les taxes ne s'affichent pas dans les lignes de commande
- Vérifier la portée de la taxe (Ventes/Achats)
- Vérifier le type de taxe (Ventes/Achats)
- Rafraîchir la page
- Vérifier les droits d'accès

### Les montants calculés sont incorrects
- Vérifier le pourcentage saisi (2.1 et non 0.021)
- Vérifier le type de calcul ("Pourcentage du prix")
- Vérifier si "Inclus dans le prix" est coché/décoché

### Les écritures comptables sont incorrectes
- Vérifier les comptes comptables associés aux taxes
- Vérifier le plan comptable installé
- Vérifier la configuration de la société

### La position fiscale ne s'applique pas automatiquement
- Vérifier la case "Détection automatique"
- Vérifier les critères de détection (Pays, État)
- Vérifier l'adresse du client/fournisseur

---

## Comptes comptables de TVA (Plan Comptable Français)

### Comptes de TVA collectée (Ventes)
- `445710` - TVA collectée normale
- `445711` - TVA collectée taux réduit
- `445712` - TVA collectée autres taux

### Comptes de TVA déductible (Achats)
- `445660` - TVA déductible sur biens et services
- `445662` - TVA déductible sur immobilisations
- `445668` - TVA déductible autres

### Compte de TVA à payer
- `445510` - TVA à décaisser

---

## Réglementation DOM

### Articles de référence
- **Article 294** du Code Général des Impôts (CGI) : Taux de TVA DOM
- **Article 295** du CGI : Exonérations
- **BOI-TVA-LIQ-30-20** : Taux applicables dans les DOM

### Produits et services concernés

#### TVA 2.1% DOM
- Produits de première nécessité
- Médicaments remboursables
- Presse
- Certains services

#### TVA 8.5% DOM
- Taux normal pour la majorité des produits et services
- Restauration
- Travaux dans les logements anciens

#### Exonération (0%)
- Exportations
- Livraisons intracommunautaires
- Certaines activités médicales et éducatives
- Selon article 295 du CGI

---

## Ressources

- [Documentation Odoo - Configuration des taxes](https://www.odoo.com/documentation/16.0/applications/finance/accounting/taxation.html)
- [Service Public Pro - TVA dans les DOM](https://www.service-public.fr/professionnels-entreprises/vosdroits/F23567)
- [Code Général des Impôts - Article 294](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006309443)
