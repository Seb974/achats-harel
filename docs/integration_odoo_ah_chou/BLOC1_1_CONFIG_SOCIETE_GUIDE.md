# BLOC 1.1 - Guide de Configuration Société

**Objectif:** Configurer les informations de base de la société dans Odoo

---

## Accès à la configuration

### Navigation
1. Se connecter à https://ah-chou1.odoo.com
2. Cliquer sur l'icône **Paramètres** (engrenage) dans la barre supérieure
3. Dans le menu latéral, cliquer sur **Sociétés**
4. Sélectionner la **société principale** (ou créer si nécessaire)

### Chemin alternatif
`Menu principal > Paramètres > Général > Sociétés > [Nom de la société]`

---

## Informations à configurer

### 1. Informations de base

#### Nom de la société
- **Champ:** Nom
- **Exemple:** Achats Harel
- **Requis:** ✅ Oui

#### Logo de la société
- **Format supporté:** PNG, JPG, GIF
- **Dimensions recommandées:** 500x500 px (carré) ou 800x400 px (rectangulaire)
- **Taille maximale:** 2 MB
- **Usage:** Apparaît sur les documents (factures, devis, bons de commande, etc.)

---

### 2. Adresse complète

#### Rue
- **Champ:** Rue
- **Exemple:** 123 Rue de la République
- **Requis:** Recommandé

#### Complément d'adresse
- **Champ:** Rue 2
- **Exemple:** Bâtiment A, 2ème étage
- **Requis:** Non

#### Ville
- **Champ:** Ville
- **Exemple:** Fort-de-France
- **Requis:** ✅ Oui

#### Code postal
- **Champ:** Code postal
- **Exemple:** 97200
- **Requis:** ✅ Oui

#### État/Province
- **Champ:** État
- **Exemple:** Martinique
- **Requis:** Selon le pays

#### Pays
- **Champ:** Pays
- **Valeur:** France (pour DOM) ou selon localisation
- **Requis:** ✅ Oui

---

### 3. Informations de contact

#### Téléphone
- **Champ:** Téléphone
- **Format:** +596 696 XX XX XX (pour Martinique)
- **Requis:** Recommandé

#### E-mail
- **Champ:** E-mail
- **Exemple:** contact@achats-harel.com
- **Requis:** Recommandé
- **Usage:** E-mail de contact principal sur les documents

#### Site web
- **Champ:** Site web
- **Exemple:** https://www.achats-harel.com
- **Requis:** Non
- **Format:** URL complète avec https://

---

### 4. Informations fiscales et légales

#### Numéro d'identification fiscale
- **Champ:** N° TVA / ID Fiscal
- **Exemple:** FR12345678901 (pour France)
- **Requis:** ✅ Oui (pour facturation)
- **Format:** Selon le pays

#### SIRET (France)
- **Champ:** SIRET
- **Format:** 14 chiffres (XXX XXX XXX XXXXX)
- **Requis:** Pour les sociétés françaises
- **Usage:** Obligatoire sur les factures en France

#### Code APE / NAF
- **Champ:** Code APE/NAF
- **Exemple:** 4711F (Hypermarchés) ou selon activité
- **Requis:** Pour les sociétés françaises

#### Numéro RCS
- **Champ:** RCS
- **Exemple:** RCS Fort-de-France B 123 456 789
- **Requis:** Pour les sociétés commerciales

#### Capital social
- **Champ:** Capital social
- **Exemple:** 50 000 €
- **Requis:** Selon la forme juridique

---

### 5. Paramètres comptables

#### Devise de la société
- **Champ:** Devise
- **Valeur:** EUR (Euro)
- **Requis:** ✅ Oui
- **Note:** Ne peut pas être changé après création de transactions

#### Plan comptable
- **Champ:** Plan comptable
- **Valeur:** Plan Comptable Français (pour DOM)
- **Requis:** ✅ Oui
- **Note:** Sélectionné lors de la configuration initiale

#### Position fiscale par défaut
- **Champ:** Position fiscale
- **Valeur:** DOM - Départements d'Outre-Mer
- **Requis:** Recommandé
- **Usage:** Applique automatiquement les bonnes taxes

---

### 6. Autres paramètres

#### Fuseau horaire
- **Champ:** Fuseau horaire
- **Valeur:** America/Martinique (UTC-4)
- **Requis:** Recommandé

#### Langue
- **Champ:** Langue
- **Valeur:** Français (France)
- **Requis:** ✅ Oui

---

## Checklist de configuration

### Informations de base
- [ ] Nom de la société renseigné
- [ ] Logo uploadé (dimensions correctes)
- [ ] Adresse complète renseignée
- [ ] Ville et code postal corrects
- [ ] Pays sélectionné

### Contact
- [ ] Téléphone renseigné (format international)
- [ ] E-mail professionnel configuré
- [ ] Site web renseigné (si applicable)

### Informations légales
- [ ] Numéro de TVA / ID Fiscal renseigné
- [ ] SIRET renseigné (14 chiffres)
- [ ] Code APE/NAF renseigné
- [ ] RCS renseigné (si applicable)
- [ ] Capital social renseigné

### Paramètres
- [ ] Devise = EUR
- [ ] Plan comptable français sélectionné
- [ ] Position fiscale DOM configurée
- [ ] Fuseau horaire America/Martinique
- [ ] Langue = Français

---

## Validation

### Après configuration
1. Cliquer sur **Enregistrer**
2. Créer un devis test
3. Vérifier que toutes les informations apparaissent correctement :
   - En-tête avec logo
   - Adresse complète
   - Informations de contact
   - Mentions légales (SIRET, RCS, etc.)

### Aperçu des documents
- Aller dans `Ventes > Devis > Aperçu`
- Vérifier la mise en page
- Vérifier que le logo s'affiche correctement
- Vérifier que toutes les mentions légales sont présentes

---

## Capture d'écran recommandée

Après configuration, prendre une capture d'écran de :
1. **Page de paramètres société** (toutes les informations visibles)
2. **Aperçu d'un devis** (pour valider l'affichage)
3. **Aperçu d'une facture** (pour valider les mentions légales)

Enregistrer les captures dans `docs/integration_odoo_ah_chou/BLOC1_SCREENSHOTS/`

---

## Problèmes courants

### Le logo ne s'affiche pas correctement
- Vérifier la taille du fichier (< 2 MB)
- Vérifier le format (PNG recommandé)
- Vérifier les dimensions (pas trop grand)
- Recharger la page après upload

### Les informations ne s'affichent pas sur les documents
- Vérifier que tous les champs obligatoires sont remplis
- Cliquer sur "Enregistrer" après modification
- Rafraîchir l'aperçu du document
- Vérifier le template de document utilisé

### Erreur lors de l'enregistrement
- Vérifier que tous les champs obligatoires sont remplis
- Vérifier le format des champs (téléphone, e-mail, etc.)
- Vérifier les droits d'accès (administrateur requis)

---

## Ressources

- [Documentation Odoo - Configuration société](https://www.odoo.com/documentation/16.0/applications/general/companies.html)
- [Guide des mentions légales en France](https://www.service-public.fr/professionnels-entreprises/vosdroits/F31214)
