# Paramétrage Société

## Informations légales

| Champ Odoo | Valeur | Chemin |
|------------|--------|--------|
| Nom société | AH CHOU SARL | Paramètres > Sociétés > Modifier |
| Adresse | 97451 SAINT PIERRE CEDEX | |
| Pays | France | |
| Département | La Réunion (974) | |
| Devise | EUR (€) | |
| SIRET | À compléter | |
| Code APE | À compléter | |
| N° TVA | FR + À compléter | |

## Configuration technique

### Paramètres généraux

```
Paramètres > Paramètres généraux
├── Société : AH CHOU SARL
├── Langue par défaut : Français
├── Fuseau horaire : Indian/Reunion (UTC+4)
└── Format date : JJ/MM/AAAA
```

### Devise

```
Comptabilité > Configuration > Devises
├── EUR : Devise principale (active)
└── USD : Devise secondaire (pour achats import)
    └── Taux de change : À mettre à jour manuellement ou automatiquement
```

## Actions à réaliser

- [ ] Créer la société AH CHOU SARL
- [ ] Renseigner les informations légales complètes
- [ ] Configurer le fuseau horaire Indian/Reunion
- [ ] Activer la devise USD pour les achats
- [ ] Configurer le format de date français

## Notes

La Réunion est un département français d'outre-mer (DOM). Le régime fiscal applicable est le régime DOM avec des taux de TVA spécifiques (voir 02_LOCALISATION_FISCALE.md).
