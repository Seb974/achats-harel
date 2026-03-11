# ✅ GUIDE DE VÉRIFICATION - Import du Plan Comptable

## 🎯 Objectif

Vérifier que les 390 comptes du plan comptable ont bien été importés dans Odoo avec les bonnes configurations.

---

## 📋 CHECKLIST DE VÉRIFICATION

### Étape 1: Accès à Odoo ✓

1. Ouvrez votre navigateur
2. Allez sur: https://ah-chou1.odoo.com/odoo
3. Connectez-vous avec: `mathieu.loic.hoarau@gmail.com`
4. **✓ COCHEZ** quand vous êtes connecté: [ ]

---

### Étape 2: Navigation vers le Plan Comptable ✓

1. Cliquez sur le module **Accounting** (Comptabilité)
2. Allez dans **Configuration** (menu du haut)
3. Cliquez sur **Chart of Accounts** (Plan comptable)
4. **✓ COCHEZ** quand vous y êtes: [ ]

---

### Étape 3: Comptage Total des Comptes 📊

Dans le plan comptable, regardez en bas de la liste ou dans le pager (indicateur de pagination).

**Vous devriez voir quelque chose comme:**
- "1-80 / **390**" (ou un nombre similaire)
- Ou un compteur indiquant le nombre total

**Notez le nombre total ici:** _____________

**✓ Résultat attendu:** 390 comptes (ou proche)

**Status:**
- [ ] ✅ 390 comptes ou plus → PARFAIT
- [ ] ⚠️  350-389 comptes → Acceptable, peut-être des doublons évités
- [ ] ❌ Moins de 350 → Problème d'import

---

### Étape 4: Vérification des Comptes Clés 🔍

Pour chaque compte ci-dessous:
1. Utilisez la **barre de recherche** en haut de la liste
2. Tapez le **code du compte**
3. Cliquez sur le compte pour voir ses détails
4. Vérifiez le **Type** et le **Lettrage**

---

#### Compte 1: **40100000** - Fournisseurs

**Recherche:** Tapez `40100000` dans la recherche

**À vérifier:**
- Nom: Fournisseurs
- Type: **Payable** (ou Liability: Payable / Dettes fournisseurs)
- Lettrage: **✓ ACTIVÉ** (Allow Reconciliation = True)

**✓ Status:**
- [ ] Trouvé avec config correcte
- [ ] Trouvé mais config incorrecte
- [ ] Non trouvé

---

#### Compte 2: **41100000** - Clients

**Recherche:** Tapez `41100000` dans la recherche

**À vérifier:**
- Nom: Clients
- Type: **Receivable** (ou Asset: Receivable / Créances clients)
- Lettrage: **✓ ACTIVÉ** (Allow Reconciliation = True)

**✓ Status:**
- [ ] Trouvé avec config correcte
- [ ] Trouvé mais config incorrecte
- [ ] Non trouvé

---

#### Compte 3: **41600000** - Clients douteux

**Recherche:** Tapez `41600000` dans la recherche

**À vérifier:**
- Nom: CLIENST DOUTEUX (ou Clients douteux)
- Type: **Receivable** (ou Asset: Receivable / Créances clients)
- Lettrage: **✓ ACTIVÉ** (Allow Reconciliation = True)

**✓ Status:**
- [ ] Trouvé avec config correcte
- [ ] Trouvé mais config incorrecte
- [ ] Non trouvé

---

#### Compte 4: **60710000** - Achats marchandises exonérées

**Recherche:** Tapez `60710000` dans la recherche

**À vérifier:**
- Nom: Achats march exo (ou similaire)
- Type: **Expense** (ou Charges)
- Lettrage: **✗ DÉSACTIVÉ** (Allow Reconciliation = False)

**✓ Status:**
- [ ] Trouvé avec config correcte
- [ ] Trouvé mais config incorrecte
- [ ] Non trouvé

---

#### Compte 5: **70700000** - Ventes libre service exonérées

**Recherche:** Tapez `70700000` dans la recherche

**À vérifier:**
- Nom: Ventes exo libre service
- Type: **Income** (ou Produits)
- Lettrage: **✗ DÉSACTIVÉ** (Allow Reconciliation = False)

**✓ Status:**
- [ ] Trouvé avec config correcte
- [ ] Trouvé mais config incorrecte
- [ ] Non trouvé

---

#### Compte 6: **10100000** - Capital

**Recherche:** Tapez `10100000` dans la recherche

**À vérifier:**
- Nom: Capital
- Type: **Equity** (ou Capitaux propres)
- Lettrage: **✗ DÉSACTIVÉ** (Allow Reconciliation = False)

**✓ Status:**
- [ ] Trouvé avec config correcte
- [ ] Trouvé mais config incorrecte
- [ ] Non trouvé

---

## 📸 Screenshots Recommandés

Prenez les captures d'écran suivantes (sauvegardez-les dans `screenshots/verification_import/`):

1. **Liste complète du plan comptable** avec le compteur visible
2. **Compte 40100000** (Fournisseurs) avec détails
3. **Compte 41100000** (Clients) avec détails
4. **Compte 41600000** (Clients douteux) avec détails
5. **Autres comptes clés** si vous voulez documenter

---

## 📊 RÉSUMÉ DE LA VÉRIFICATION

### Nombre total de comptes trouvés
**Nombre:** _____________ / 390 attendus

### Comptes clés vérifiés

| Code | Nom | Trouvé? | Type OK? | Lettrage OK? |
|------|-----|---------|----------|--------------|
| 40100000 | Fournisseurs | ☐ | ☐ | ☐ |
| 41100000 | Clients | ☐ | ☐ | ☐ |
| 41600000 | Clients douteux | ☐ | ☐ | ☐ |
| 60710000 | Achats march exo | ☐ | ☐ | ☐ |
| 70700000 | Ventes exo LS | ☐ | ☐ | ☐ |
| 10100000 | Capital | ☐ | ☐ | ☐ |

**Nombre de comptes OK:** _______ / 6

---

## ✅ CONCLUSION

**L'import est réussi si:**
- ✅ Nombre total ≥ 390 comptes
- ✅ Les 6 comptes clés sont tous trouvés
- ✅ Les types de comptes sont corrects
- ✅ Le lettrage est activé uniquement pour les comptes clients/fournisseurs

**✓ Résultat final:**
- [ ] ✅ SUCCÈS COMPLET - Tout est OK
- [ ] ⚠️  SUCCÈS PARTIEL - Quelques ajustements nécessaires
- [ ] ❌ ÉCHEC - Import à refaire

---

## 🔧 En cas de problème

### Problème 1: Moins de 390 comptes

**Causes possibles:**
- Import interrompu
- Erreurs lors du test
- Doublons évités (pas grave si > 350)

**Solution:**
- Vérifier les logs d'import dans Odoo
- Réimporter si < 350 comptes

### Problème 2: Comptes clés non trouvés

**Causes possibles:**
- Import non effectué
- Fichier CSV incomplet

**Solution:**
- Vérifier le fichier CSV source
- Relancer l'import

### Problème 3: Types de comptes incorrects

**Causes possibles:**
- Mapping incorrect lors de l'import
- Version d'Odoo incompatible

**Solution:**
- Modifier les comptes individuellement dans Odoo
- Ou réimporter avec le bon mapping

### Problème 4: Lettrage incorrect

**Causes possibles:**
- Mapping de la colonne `reconcile` incorrect

**Solution:**
- Activer manuellement le lettrage pour:
  - 40100000 (Fournisseurs)
  - 41100000 (Clients)
  - 41600000 (Clients douteux)

---

## 📞 Support

Si vous rencontrez des problèmes:

1. **Notez** les numéros des comptes problématiques
2. **Prenez** des screenshots des erreurs
3. **Remplissez** cette checklist complète
4. **Contactez-moi** avec ces informations

---

**Date de vérification:** _______________  
**Vérifié par:** _______________  
**Instance Odoo:** https://ah-chou1.odoo.com/odoo
