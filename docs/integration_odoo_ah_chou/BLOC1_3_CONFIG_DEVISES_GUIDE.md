# BLOC 1.3 - Guide de Configuration Devises

**Objectif:** Configurer EUR comme devise principale et activer USD comme devise secondaire

---

## Contexte

### Importance de la gestion multi-devises
- **EUR (Euro)** : Devise principale pour les opérations dans les DOM (Martinique, Guadeloupe, Réunion)
- **USD (Dollar américain)** : Devise secondaire pour les échanges avec les États-Unis, les Caraïbes anglophones, etc.

### Cas d'usage
- Achats auprès de fournisseurs américains
- Ventes à des clients utilisant le dollar
- Gestion des taux de change
- Conversion automatique sur les documents

---

## Accès à la configuration

### Navigation
1. Se connecter à https://ah-chou1.odoo.com
2. Aller dans **Comptabilité** (icône dans le menu principal)
3. Menu **Configuration > Devises**
4. Ou directement : `Comptabilité > Configuration > Devises`

### Activation de la fonctionnalité multi-devises

Si la fonctionnalité n'est pas activée :
1. Aller dans **Paramètres** (icône engrenage)
2. Section **Comptabilité**
3. Cocher **Multi-devises**
4. Cliquer sur **Enregistrer**

---

## Configuration de l'Euro (EUR)

### 1. Vérifier la devise principale

#### Navigation
`Comptabilité > Configuration > Devises > EUR`

#### Paramètres de l'Euro

**Nom de la devise**
- **Champ:** Nom
- **Valeur:** `EUR` (Code ISO 4217)
- **Requis:** ✅ Oui

**Nom complet**
- **Champ:** Devise
- **Valeur:** `Euro`
- **Lecture seule:** Oui (défini par Odoo)

**Symbole**
- **Champ:** Symbole
- **Valeur:** `€`
- **Requis:** ✅ Oui

**Position du symbole**
- **Champ:** Position
- **Valeur:** `Après le montant`
- **Options:** Avant le montant / Après le montant
- **Recommandé:** Après (standard français : 100,00 €)

**Séparateur décimal**
- **Champ:** Séparateur décimal
- **Valeur:** `,` (virgule)
- **Standard français:** Oui

**Séparateur de milliers**
- **Champ:** Séparateur de milliers
- **Valeur:** ` ` (espace insécable)
- **Standard français:** Oui
- **Exemple:** 1 000 000,00 €

**Précision d'arrondi**
- **Champ:** Précision d'arrondi
- **Valeur:** `0.01`
- **Standard:** 2 décimales pour l'Euro

**Actif**
- **Case à cocher:** Actif
- **Valeur:** ✅ Coché
- **Requis:** Oui (devise principale)

---

## Configuration du Dollar américain (USD)

### 1. Activer le Dollar américain

#### Recherche de la devise
1. Aller dans `Comptabilité > Configuration > Devises`
2. Cliquer sur **Tous** pour afficher toutes les devises (actives et inactives)
3. Rechercher `USD` ou `Dollar`
4. Cliquer sur la ligne **USD - Dollar américain**

#### Paramètres du Dollar américain

**Nom de la devise**
- **Champ:** Nom
- **Valeur:** `USD` (Code ISO 4217)
- **Lecture seule:** Oui

**Nom complet**
- **Champ:** Devise
- **Valeur:** `Dollar américain` ou `US Dollar`
- **Lecture seule:** Oui

**Symbole**
- **Champ:** Symbole
- **Valeur:** `$`
- **Standard:** Oui

**Position du symbole**
- **Champ:** Position
- **Valeur:** `Avant le montant`
- **Standard US:** Oui (ex: $100.00)

**Séparateur décimal**
- **Champ:** Séparateur décimal
- **Valeur:** `.` (point)
- **Standard US:** Oui

**Séparateur de milliers**
- **Champ:** Séparateur de milliers
- **Valeur:** `,` (virgule)
- **Standard US:** Oui
- **Exemple:** $1,000,000.00

**Précision d'arrondi**
- **Champ:** Précision d'arrondi
- **Valeur:** `0.01`
- **Standard:** 2 décimales (cents)

**Actif**
- **Case à cocher:** Actif
- **Valeur:** ✅ Cocher pour activer
- **Requis:** Oui

#### Sauvegarder
Cliquer sur **Enregistrer** pour activer la devise USD.

---

## Configuration des taux de change

### 1. Définir la méthode de mise à jour

#### Navigation
`Paramètres > Comptabilité > Devises`

#### Options de mise à jour des taux

**Mise à jour automatique**
- **Option:** Utiliser un fournisseur de taux de change
- **Fournisseurs disponibles:**
  - Banque Centrale Européenne (BCE) - **Recommandé**
  - Bank of Canada
  - European Central Bank (ECB)
  - Federal Reserve System (FED)
  - Autres fournisseurs

**Fréquence de mise à jour**
- **Options:**
  - Manuellement
  - Quotidiennement
  - Hebdomadairement
  - Mensuellement
- **Recommandé:** Quotidiennement (pour taux à jour)

**Heure de mise à jour**
- **Champ:** Prochaine exécution
- **Recommandé:** En dehors des heures de travail (ex: 00:00)

### 2. Configurer la Banque Centrale Européenne (BCE)

#### Paramètres
1. Aller dans `Paramètres > Comptabilité`
2. Section **Devises**
3. **Fournisseur de taux de change:** Sélectionner `Banque Centrale Européenne`
4. **Intervalle:** Sélectionner `Quotidiennement`
5. Cliquer sur **Enregistrer**

#### Mise à jour immédiate
1. Dans `Comptabilité > Configuration > Devises`
2. Cliquer sur le bouton **Mettre à jour les taux** (en haut)
3. Les taux seront téléchargés depuis la BCE

### 3. Définir des taux manuellement (optionnel)

Si vous préférez gérer les taux manuellement :

#### Accès aux taux
1. Aller dans `Comptabilité > Configuration > Devises`
2. Cliquer sur la devise **USD**
3. Onglet **Taux**

#### Créer un nouveau taux
1. Cliquer sur **Ajouter une ligne**
2. **Date:** Sélectionner la date d'application
3. **Taux:** Saisir le taux de change
   - **Format:** 1 EUR = X USD
   - **Exemple:** Si 1 EUR = 1.10 USD, saisir `1.10`
4. Cliquer sur **Enregistrer**

#### Exemple de taux de change EUR/USD
| Date | Taux (1 EUR = X USD) |
|------|---------------------|
| 2026-02-26 | 1.08 |
| 2026-02-25 | 1.09 |
| 2026-02-24 | 1.08 |

**Note:** Le taux le plus récent est utilisé pour les conversions.

---

## Configuration de la devise sur les documents

### 1. Devise par défaut d'un client

#### Navigation
`Ventes > Clients > [Nom du client] > Onglet Ventes & Achats`

**Devise**
- **Champ:** Devise
- **Valeur:** EUR ou USD
- **Usage:** Devise par défaut pour les devis et factures de ce client

### 2. Devise par défaut d'un fournisseur

#### Navigation
`Achats > Fournisseurs > [Nom du fournisseur] > Onglet Achats`

**Devise**
- **Champ:** Devise
- **Valeur:** EUR ou USD
- **Usage:** Devise par défaut pour les bons de commande de ce fournisseur

### 3. Changer la devise sur un document

#### Sur un devis ou une facture
1. Créer ou ouvrir le document
2. Champ **Devise** (en haut à droite du document)
3. Sélectionner EUR ou USD
4. Les montants seront affichés dans la devise sélectionnée
5. Le taux de change du jour est appliqué automatiquement

---

## Checklist de configuration

### Devise principale (EUR)
- [ ] EUR activé
- [ ] Symbole : €
- [ ] Position : Après le montant
- [ ] Séparateur décimal : virgule (,)
- [ ] Séparateur de milliers : espace
- [ ] Précision : 0.01
- [ ] Défini comme devise de la société

### Devise secondaire (USD)
- [ ] USD activé
- [ ] Symbole : $
- [ ] Position : Avant le montant
- [ ] Séparateur décimal : point (.)
- [ ] Séparateur de milliers : virgule (,)
- [ ] Précision : 0.01

### Taux de change
- [ ] Fournisseur de taux configuré (BCE recommandé)
- [ ] Mise à jour automatique activée (quotidienne)
- [ ] Premier taux de change défini pour USD
- [ ] Bouton "Mettre à jour les taux" fonctionne

### Tests effectués
- [ ] Création d'un devis en EUR
- [ ] Création d'un devis en USD
- [ ] Conversion EUR → USD affichée correctement
- [ ] Taux de change à jour
- [ ] Affichage correct sur les documents (position symbole, séparateurs)

---

## Validation et tests

### Test 1 : Devis en EUR (devise principale)
1. Aller dans `Ventes > Devis > Créer`
2. Sélectionner un client
3. Vérifier que la devise est **EUR**
4. Ajouter une ligne de produit : 100 € HT
5. Vérifier l'affichage : `100,00 €` (virgule, symbole après)
6. Avec TVA 8.5% : `108,50 €`

### Test 2 : Devis en USD
1. Créer un nouveau devis
2. Changer la devise en **USD** (champ Devise en haut)
3. Ajouter une ligne de produit : 100 USD HT
4. Vérifier l'affichage : `$100.00` (point, symbole avant)
5. Vérifier que le taux de change est affiché

### Test 3 : Conversion automatique
1. Créer un devis en EUR avec un produit à 100 €
2. Changer la devise en USD
3. Odoo convertit automatiquement :
   - Si taux = 1.08, alors 100 € → $108.00
4. Vérifier que la conversion est correcte

### Test 4 : Bon de commande en USD
1. Aller dans `Achats > Commandes > Créer`
2. Sélectionner un fournisseur américain
3. Définir la devise en **USD**
4. Ajouter un produit : $500.00
5. Vérifier l'affichage et la conversion en EUR (info)

### Test 5 : Facture et comptabilité
1. Confirmer un devis en USD en facture
2. Valider la facture
3. Aller dans `Comptabilité > Écritures`
4. Vérifier que les montants sont enregistrés en EUR (devise de base)
5. Vérifier que le montant en USD est indiqué en référence

### Test 6 : Mise à jour des taux
1. Aller dans `Comptabilité > Configuration > Devises`
2. Cliquer sur **Mettre à jour les taux**
3. Vérifier que le taux USD est mis à jour
4. Noter le nouveau taux et la date

---

## Affichage sur les documents

### Format des montants en EUR
```
Montant HT     :    1 234,56 €
TVA 8.5%       :      104,94 €
Montant TTC    :    1 339,50 €
```

### Format des montants en USD
```
Montant HT     :   $1,234.56
TVA 8.5%       :     $104.94
Montant TTC    :   $1,339.50
```

### Information de conversion
Sur les documents en devise étrangère, Odoo affiche :
```
Montant TTC : $1,339.50
(Équivalent : 1 240,28 € au taux de 1.08)
```

---

## Captures d'écran recommandées

Après configuration, prendre des captures d'écran de :
1. **Liste des devises actives** (`Comptabilité > Configuration > Devises`)
2. **Détail de la devise EUR** (paramètres et format)
3. **Détail de la devise USD** (paramètres et format)
4. **Configuration des taux de change** (Paramètres > Devises)
5. **Historique des taux USD** (Onglet Taux de USD)
6. **Devis en EUR** (affichage du montant)
7. **Devis en USD** (affichage du montant et conversion)
8. **Écriture comptable** d'une facture en USD

Enregistrer les captures dans `docs/integration_odoo_ah_chou/BLOC1_SCREENSHOTS/`

---

## Problèmes courants

### La devise USD n'apparaît pas dans la liste
- Vérifier que la case **Actif** est cochée
- Cliquer sur **Tous** pour afficher les devises inactives
- Enregistrer après avoir coché "Actif"
- Rafraîchir la page

### Les taux de change ne se mettent pas à jour
- Vérifier la configuration du fournisseur de taux (BCE)
- Vérifier la connexion internet du serveur Odoo
- Lancer manuellement la mise à jour avec le bouton "Mettre à jour les taux"
- Vérifier les logs dans `Paramètres > Technique > Tâches planifiées`

### Le format d'affichage est incorrect
- Vérifier les paramètres de séparateurs (décimal et milliers)
- Vérifier la position du symbole
- Vider le cache du navigateur
- Rafraîchir la page

### La conversion est incorrecte
- Vérifier le taux de change actuel (date du jour)
- Vérifier qu'un taux est bien défini pour la date de la transaction
- Vérifier le sens de la conversion (1 EUR = X USD)

### Les montants comptables sont faux
- Vérifier que la devise de la société est bien EUR
- Vérifier que les taux sont corrects à la date de validation
- Vérifier les écritures comptables manuelles

---

## Gestion avancée des devises

### 1. Gain/Perte de change

#### Comptes comptables nécessaires
- **666** - Pertes de change
- **766** - Gains de change

#### Configuration
`Paramètres > Comptabilité > Devises`
- **Compte de gain de change:** 766000
- **Compte de perte de change:** 666000
- **Journal de change:** Journal des Opérations Diverses (OD)

### 2. Réévaluation de change

Pour réévaluer les créances et dettes en devise étrangère :
1. Aller dans `Comptabilité > Rapports > Réévaluation de change`
2. Sélectionner la période
3. Lancer la réévaluation
4. Valider les écritures générées

### 3. Comptes bancaires multi-devises

Pour gérer des comptes en USD :
1. Créer un compte bancaire USD dans `Comptabilité > Configuration > Banques`
2. Définir la devise = USD
3. Tous les paiements sur ce compte seront en USD
4. La conversion en EUR se fera automatiquement en comptabilité

---

## Réglementation et bonnes pratiques

### Taux de change officiels
- Utiliser les taux de la **Banque Centrale Européenne** (BCE)
- Mise à jour quotidienne recommandée
- Conservation de l'historique des taux pour audit

### Comptabilisation des opérations en devises
- **Date d'opération:** Utiliser le taux du jour de la transaction
- **Date de règlement:** Constater les gains/pertes de change si différence
- **Clôture d'exercice:** Réévaluer les créances et dettes en devises

### Mentions légales sur les factures
Sur une facture en devise étrangère (USD), mentionner :
- Le montant en devise (USD)
- Le montant converti en EUR (devise de référence)
- Le taux de change appliqué
- La date du taux de change

---

## Devises supplémentaires (optionnel)

### Autres devises des Caraïbes

Si vous travaillez avec d'autres pays de la région, vous pouvez activer :

| Devise | Code | Symbole | Pays/Région |
|--------|------|---------|-------------|
| Dollar des Caraïbes orientales | XCD | EC$ | Dominique, Sainte-Lucie, Grenade |
| Dollar barbadien | BBD | Bds$ | Barbade |
| Dollar des Bahamas | BSD | B$ | Bahamas |
| Gourde haïtienne | HTG | G | Haïti |
| Peso dominicain | DOP | RD$ | République Dominicaine |

**Activation:** Même procédure que pour USD.

---

## Ressources

- [Documentation Odoo - Multi-devises](https://www.odoo.com/documentation/16.0/applications/finance/accounting/getting_started/multi_currency.html)
- [Banque Centrale Européenne - Taux de change](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.fr.html)
- [Code ISO 4217 - Codes des devises](https://www.iso.org/iso-4217-currency-codes.html)
- [Service Public Pro - Factures en devises](https://www.service-public.fr/professionnels-entreprises/vosdroits/F31808)
