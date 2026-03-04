# Profils Utilisateurs

## Vue d'ensemble

| Nombre d'utilisateurs | 6 à 10 |
|----------------------|--------|
| Profils identifiés | 7 |

## Profils détaillés

### 1. Administrateur

| Attribut | Valeur |
|----------|--------|
| **Rôle** | Administration complète |
| **Nombre estimé** | 1-2 |
| **Accès** | Tous les modules |

#### Droits Odoo

| Module | Niveau |
|--------|--------|
| Ventes | Administrateur |
| Achats | Administrateur |
| Stock | Administrateur |
| Comptabilité | Administrateur |
| Point de vente | Administrateur |
| Paramètres | Administrateur |

#### Responsabilités

- Configuration système
- Gestion des utilisateurs
- Paramétrage modules
- Support technique interne

---

### 2. Responsable Achats

| Attribut | Valeur |
|----------|--------|
| **Rôle** | Gestion des approvisionnements |
| **Nombre estimé** | 1-2 |
| **Accès** | Achats, Stock (partiel), Produits |

#### Droits Odoo

| Module | Niveau |
|--------|--------|
| Ventes | Lecture seule |
| Achats | Responsable |
| Stock | Utilisateur |
| Comptabilité | Lecture seule |
| Produits | Modification |

#### Responsabilités

- Création commandes d'achat
- Suivi fournisseurs
- Négociation prix
- Suivi stock flottant
- Utilisation App Achats Harel

---

### 3. Commercial / Vendeur

| Attribut | Valeur |
|----------|--------|
| **Rôle** | Gestion des ventes clients |
| **Nombre estimé** | 2-4 |
| **Accès** | Ventes, Clients, Stock (lecture) |

#### Droits Odoo

| Module | Niveau |
|--------|--------|
| Ventes | Utilisateur (propres ventes) ou Responsable |
| Achats | Aucun |
| Stock | Lecture seule |
| Comptabilité | Aucun |
| Contacts | Modification (ses clients) |

#### Restrictions suggérées

| Restriction | Configuration |
|-------------|---------------|
| Voir uniquement ses clients | Règle d'enregistrement |
| Voir uniquement ses commandes | Règle d'enregistrement |
| Pas d'accès aux prix d'achat | Masquer champs |

#### Responsabilités

- Saisie commandes clients
- Suivi clients attribués
- Propositions commerciales
- Reporting ventes

---

### 4. Préparateur / Logistique

| Attribut | Valeur |
|----------|--------|
| **Rôle** | Préparation et expédition |
| **Nombre estimé** | 1-2 |
| **Accès** | Stock, Réceptions, Expéditions |

#### Droits Odoo

| Module | Niveau |
|--------|--------|
| Ventes | Aucun |
| Achats | Aucun |
| Stock | Utilisateur |
| Comptabilité | Aucun |

#### Responsabilités

- Réception marchandises
- Préparation commandes
- Expédition
- Gestion emplacements
- Saisie lots et DLC
- Inventaires

---

### 5. Comptable

| Attribut | Valeur |
|----------|--------|
| **Rôle** | Gestion comptable et financière |
| **Nombre estimé** | 1 |
| **Accès** | Comptabilité, Facturation |

#### Droits Odoo

| Module | Niveau |
|--------|--------|
| Ventes | Facturation uniquement |
| Achats | Facturation uniquement |
| Stock | Lecture seule |
| Comptabilité | Comptable |

#### Responsabilités

- Validation factures clients
- Validation factures fournisseurs
- Suivi paiements
- Lettrage comptes
- Déclarations TVA
- Clôtures comptables

---

### 6. Direction

| Attribut | Valeur |
|----------|--------|
| **Rôle** | Supervision et pilotage |
| **Nombre estimé** | 1-2 |
| **Accès** | Dashboards, Rapports |

#### Droits Odoo

| Module | Niveau |
|--------|--------|
| Ventes | Lecture seule |
| Achats | Lecture seule |
| Stock | Lecture seule |
| Comptabilité | Lecture seule |
| Rapports | Tous |

#### Responsabilités

- Consultation dashboards
- Analyse performance
- Décisions stratégiques
- Validation exceptionnelle

---

### 7. Caissier / POS

| Attribut | Valeur |
|----------|--------|
| **Rôle** | Ventes comptoir |
| **Nombre estimé** | 1-2 |
| **Accès** | Point de vente uniquement |

#### Droits Odoo

| Module | Niveau |
|--------|--------|
| Ventes | Aucun |
| Achats | Aucun |
| Stock | Aucun |
| Comptabilité | Aucun |
| Point de vente | Utilisateur |

#### Responsabilités

- Encaissement
- Gestion caisse
- Clôture session

## Matrice des droits

| Profil | Ventes | Achats | Stock | Compta | POS | Paramètres |
|--------|--------|--------|-------|--------|-----|------------|
| Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Resp. Achats | 👁️ | ✅ Full | ✅ | 👁️ | ❌ | ❌ |
| Commercial | ✅ | ❌ | 👁️ | ❌ | ❌ | ❌ |
| Logistique | ❌ | ❌ | ✅ Full | ❌ | ❌ | ❌ |
| Comptable | 📄 | 📄 | 👁️ | ✅ Full | ❌ | ❌ |
| Direction | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ |
| Caissier | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

Légende : ✅ Full = Accès complet | 👁️ = Lecture seule | 📄 = Facturation | ❌ = Aucun accès

## Actions à réaliser

- [ ] Créer les groupes de droits dans Odoo
- [ ] Définir les règles d'enregistrement (Record Rules)
- [ ] Créer les utilisateurs
- [ ] Attribuer les profils
- [ ] Tester chaque profil
- [ ] Documenter les accès

## Voir aussi

- DROITS.md : Configuration technique des droits
