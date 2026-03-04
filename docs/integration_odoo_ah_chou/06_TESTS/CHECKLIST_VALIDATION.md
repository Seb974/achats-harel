# Checklist de Validation

## Phase 1 : Paramétrage général

### Société
- [ ] Raison sociale AH CHOU SARL créée
- [ ] Adresse complète renseignée
- [ ] SIRET / APE renseignés
- [ ] Devise EUR configurée
- [ ] Fuseau horaire Indian/Reunion

### Localisation
- [ ] Localisation France installée
- [ ] Taxes TVA DOM créées (2.1%, 8.5%, 0%)
- [ ] Positions fiscales configurées
- [ ] Plan comptable importé

### Devises
- [ ] USD activée
- [ ] Taux de change configuré
- [ ] Comptes gain/perte de change définis

---

## Phase 2 : Modules

### Ventes
- [ ] Module installé et configuré
- [ ] Listes de prix créées (T1-T6)
- [ ] Champs personnalisés clients créés
- [ ] Catégories clients créées
- [ ] Workflow commande→BL→facture fonctionnel
- [ ] Facturation groupée testée

### Achats
- [ ] Module installé et configuré
- [ ] Champs personnalisés fournisseurs créés
- [ ] Intégration App Achats testée
- [ ] Workflow commande→réception→facture fonctionnel

### Stock
- [ ] Module installé et configuré
- [ ] 6 emplacements créés
- [ ] Traçabilité par lots activée
- [ ] Dates d'expiration activées
- [ ] Valorisation PRMP configurée
- [ ] Workflow 2 étapes livraison testé

### Comptabilité
- [ ] Module installé et configuré
- [ ] Journaux créés
- [ ] Plan comptable importé et vérifié
- [ ] Taxes associées aux produits
- [ ] Conditions de paiement créées

### Point de vente
- [ ] Module installé et configuré
- [ ] Session caisse testée
- [ ] Matériel configuré (si applicable)

---

## Phase 3 : Données

### Clients
- [ ] Champs personnalisés créés
- [ ] Valeurs de sélection créées
- [ ] Script d'import prêt
- [ ] Import testé sur échantillon
- [ ] Import complet réalisé
- [ ] Données vérifiées

### Produits
- [ ] Champs personnalisés créés
- [ ] Catégories créées (hiérarchie)
- [ ] Unités de mesure créées
- [ ] Script d'import prêt
- [ ] Import testé sur échantillon
- [ ] Import complet réalisé (377 produits)
- [ ] Données vérifiées

### Fournisseurs
- [ ] Champs personnalisés créés
- [ ] Groupes fournisseurs créés
- [ ] Script d'import prêt
- [ ] Import testé sur échantillon
- [ ] Import complet réalisé (999 fournisseurs)
- [ ] Données vérifiées

### Plan comptable
- [ ] Script d'import adapté
- [ ] Import réalisé
- [ ] Types de comptes vérifiés
- [ ] Comptes manquants créés

---

## Phase 4 : Dashboards

### Ventes
- [ ] Champs calculés créés
- [ ] Rapports configurés
- [ ] Dashboard vue d'ensemble fonctionnel
- [ ] Analyses par axe (client, groupe, famille)
- [ ] Comparatif N/N-1 fonctionnel

### Achats
- [ ] Champs calculés créés
- [ ] Rapports configurés
- [ ] Dashboard fonctionnel

### Stock
- [ ] Champs calculés créés
- [ ] Rapport tranches DLC fonctionnel
- [ ] Alertes configurées
- [ ] Dashboard fonctionnel

---

## Phase 5 : Utilisateurs

### Profils
- [ ] Groupes personnalisés créés
- [ ] Règles d'enregistrement définies
- [ ] Masquage de champs configuré

### Utilisateurs
- [ ] Admin créé
- [ ] Responsable achats créé
- [ ] Commerciaux créés
- [ ] Logistique créé
- [ ] Comptable créé
- [ ] Direction créé
- [ ] Caissier créé (si POS)

### Tests droits
- [ ] Chaque profil testé
- [ ] Accès corrects vérifiés
- [ ] Restrictions vérifiées

---

## Phase 6 : Intégration

### App Achats Harel
- [ ] Clé API Odoo générée
- [ ] Configuration client dans App
- [ ] Test connexion API réussi
- [ ] Lecture produits fonctionnelle
- [ ] Lecture fournisseurs fonctionnelle
- [ ] Création commande testée
- [ ] Flux complet validé

---

## Phase 7 : Tests finaux

### Scénarios métier
- [ ] TEST-VTE-001 à 005 OK
- [ ] TEST-ACH-001 à 003 OK
- [ ] TEST-STK-001 à 004 OK
- [ ] TEST-CPT-001 à 003 OK
- [ ] TEST-POS-001 OK (si applicable)
- [ ] TEST-DSH-001 OK
- [ ] TEST-INT-001 à 002 OK
- [ ] TEST-SEC-001 à 002 OK

### Performance
- [ ] Temps de réponse acceptable
- [ ] Pas de timeout sur rapports
- [ ] Import massif testé

### Sauvegarde
- [ ] Sauvegarde automatique configurée
- [ ] Restauration testée

---

## Phase 8 : Mise en production

### Préparation
- [ ] Données de test nettoyées
- [ ] Données réelles importées
- [ ] Soldes d'ouverture saisis (si reprise)
- [ ] Documentation utilisateur distribuée
- [ ] Formation réalisée

### Go-live
- [ ] Accès utilisateurs confirmés
- [ ] Premiers jours accompagnés
- [ ] Incidents documentés
- [ ] Corrections appliquées

### Clôture projet
- [ ] PV de recette signé
- [ ] Documentation finale livrée
- [ ] Support post-production défini

---

## Signatures

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| Client | | | |
| Intégrateur | | | |
| Chef de projet | | | |
