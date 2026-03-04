# BLOC 1 - Rapport de Paramétrage Général Odoo
**Instance:** https://ah-chou1.odoo.com  
**Date:** 26 février 2026  
**Statut:** Investigation initiale

---

## 1. État de la Connexion

### ✅ Accès à l'instance
- **URL accessible:** https://ah-chou1.odoo.com
- **Page de connexion:** Opérationnelle
- **Type d'authentification:** E-mail + Mot de passe (ou clé d'accès)

### 📸 Capture d'écran - Page de connexion
La page de connexion Odoo standard est affichée avec :
- Champ E-mail
- Champ Mot de passe
- Option "Réinitialiser le mot de passe"
- Bouton "Se connecter"
- Lien "Vous n'avez pas de compte ?"
- Option alternative : "Utiliser une clé d'accès"
- Mention "Généré par Odoo" en bas de page

### 🔒 Accès requis
**Pour poursuivre le paramétrage, les identifiants de connexion sont nécessaires.**

---

## 2. Modules Installés
**Statut:** ⏸️ Non accessible sans connexion

### Modules à vérifier (BLOC 1.4)
- [ ] Ventes (sale_management)
- [ ] Achats (purchase)
- [ ] Inventaire (stock)
- [ ] Comptabilité (account_accountant)
- [ ] Point de Vente (point_of_sale)

**Action requise:** Se connecter puis naviguer vers `Paramètres > Applications` pour vérifier les modules installés.

---

## 3. Configuration Société
**Statut:** ⏸️ Non accessible sans connexion

### Informations à vérifier (BLOC 1.1)
- [ ] Nom de la société
- [ ] Adresse complète
- [ ] Logo de la société
- [ ] Informations fiscales
- [ ] Coordonnées (téléphone, email, site web)
- [ ] Numéro SIRET/SIREN (si applicable)

**Action requise:** Se connecter puis naviguer vers `Paramètres > Sociétés > Société principale`

---

## 4. Taxes TVA DOM
**Statut:** ⏸️ Non accessible sans connexion

### Taxes requises à vérifier (BLOC 1.2)

#### TVA 2.1% DOM
- [ ] **Taxe de vente:** TVA 2.1% DOM (Ventes)
- [ ] **Taxe d'achat:** TVA 2.1% DOM (Achats)
- [ ] Portée: Ventes et Achats
- [ ] Type de taxe: Pourcentage
- [ ] Calcul: Sur le prix HT

#### TVA 8.5% DOM
- [ ] **Taxe de vente:** TVA 8.5% DOM (Ventes)
- [ ] **Taxe d'achat:** TVA 8.5% DOM (Achats)
- [ ] Portée: Ventes et Achats
- [ ] Type de taxe: Pourcentage
- [ ] Calcul: Sur le prix HT

#### Exonéré DOM (0%)
- [ ] **Taxe de vente:** Exonéré DOM 0% (Ventes)
- [ ] **Taxe d'achat:** Exonéré DOM 0% (Achats)
- [ ] Portée: Ventes et Achats
- [ ] Type de taxe: Pourcentage (0%)

**Action requise:** Se connecter puis naviguer vers `Comptabilité > Configuration > Taxes`

---

## 5. Devises
**Statut:** ⏸️ Non accessible sans connexion

### Configuration requise (BLOC 1.3)
- [ ] **EUR (Euro)** - Devise principale
  - Symbole: €
  - Position du symbole: Après le montant
  - Séparateur décimal: virgule (,)
  - Séparateur de milliers: espace
  
- [ ] **USD (Dollar américain)** - Devise secondaire activée
  - Symbole: $
  - Position du symbole: Avant le montant
  - Taux de change: À définir (mise à jour automatique ou manuelle)

**Action requise:** Se connecter puis naviguer vers `Comptabilité > Configuration > Devises`

---

## 6. Prochaines Étapes

### 🔑 Étape immédiate
1. **Obtenir les identifiants de connexion** pour l'instance ah-chou1.odoo.com
   - E-mail de l'administrateur
   - Mot de passe

### 📋 Une fois connecté
2. **Vérifier les modules installés**
   - Aller dans `Paramètres` (icône engrenage)
   - Cliquer sur `Applications`
   - Filtrer par "Installé"
   - Capturer la liste complète

3. **Configurer la société**
   - Aller dans `Paramètres > Sociétés`
   - Vérifier/compléter les informations de la société principale
   - Uploader le logo si nécessaire

4. **Configurer les taxes TVA DOM**
   - Aller dans `Comptabilité > Configuration > Taxes`
   - Créer ou vérifier les 3 taxes requises (2.1%, 8.5%, 0%)
   - Pour chaque taxe, créer la version Ventes et Achats

5. **Configurer les devises**
   - Aller dans `Comptabilité > Configuration > Devises`
   - Activer EUR comme devise principale
   - Activer USD comme devise secondaire
   - Configurer les taux de change

---

## 7. Recommandations

### 🔐 Sécurité
- Vérifier que l'instance utilise HTTPS (✅ confirmé)
- S'assurer d'utiliser un mot de passe fort
- Activer l'authentification à deux facteurs si disponible

### 📊 Documentation
- Prendre des captures d'écran à chaque étape de configuration
- Noter les valeurs par défaut avant toute modification
- Conserver un historique des changements effectués

### 🧪 Tests
Après configuration du BLOC 1, tester :
- [ ] Création d'un devis avec TVA 2.1%
- [ ] Création d'un devis avec TVA 8.5%
- [ ] Création d'un devis avec exonération (0%)
- [ ] Conversion de devise EUR ↔ USD
- [ ] Accès aux modules Ventes, Achats, Inventaire, Comptabilité, POS

---

## 8. Structure de documentation suggérée

Pour la suite, créer les fichiers suivants dans `docs/integration_odoo_ah_chou/`:
- `BLOC1_SCREENSHOTS/` - Dossier pour les captures d'écran
- `BLOC1_CONFIG_SOCIETE.md` - Configuration détaillée de la société
- `BLOC1_CONFIG_TAXES.md` - Configuration détaillée des taxes
- `BLOC1_CONFIG_DEVISES.md` - Configuration détaillée des devises
- `BLOC1_MODULES_INSTALLES.md` - Liste et configuration des modules

---

## Résumé

| Élément | Statut | Action requise |
|---------|--------|----------------|
| Accès instance | ✅ OK | Obtenir identifiants |
| Connexion | ⏸️ En attente | Se connecter |
| Modules | ⏸️ Non vérifié | Vérifier après connexion |
| Configuration société | ⏸️ Non vérifié | Configurer après connexion |
| Taxes TVA DOM | ⏸️ Non configuré | Créer/vérifier après connexion |
| Devises EUR/USD | ⏸️ Non configuré | Activer après connexion |

**Prochaine action:** Obtenir les identifiants de connexion pour l'instance Odoo.
