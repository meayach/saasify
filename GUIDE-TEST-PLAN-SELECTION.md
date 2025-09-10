# Guide de Test - Sélection de Plan avec Persistance

## Objectif

Tester que le plan sélectionné lors de la création d'application est bien sauvegardé dans MongoDB et apparaît dans la configuration.

## Modifications Apportées

### Backend (NestJS)

1. **Modèle SaasApplication** : Ajout du champ `selectedPlan` avec toutes les informations du plan
2. **DTO** : Ajout de `selectedPlan` dans `CreateSaasApplicationDto` et `SaasApplicationResponseDto`
3. **Service** : Modification pour sauvegarder `selectedPlan` lors de la création

### Frontend (Angular)

1. **Interface Application** : Ajout du champ `selectedPlan`
2. **Application-new** : Envoi des informations complètes du plan lors de la création
3. **Application-configure** : Priorité donnée à `currentApplication.selectedPlan`

## Procédure de Test

### Étape 1: Vérifier les Plans Disponibles

```bash
curl -s "http://localhost:3001/api/v1/plans" | jq '.plans[] | {id, name, description}'
```

### Étape 2: Créer une Application avec Plan

1. Aller sur http://localhost:54530
2. Naviguer vers "Applications" → "Créer une application"
3. Cliquer "Ajouter un plan"
4. Sélectionner "Plan Starter" (ID: 68bf66d7df8ea2b4245439ff)
5. Remplir le formulaire d'application (nom: "Test Plan App")
6. Cliquer "Créer l'application"

### Étape 3: Vérifier la Persistance en Base

```bash
# Se connecter à MongoDB et vérifier l'application créée
mongo
use saasify_db
db.saasApplications.find({}, {selectedPlan: 1, name: 1}).pretty()
```

### Étape 4: Tester la Configuration

1. Aller dans la liste des applications
2. Cliquer sur "Configurer" pour l'application "Test Plan App"
3. Vérifier que le plan "Plan Starter" apparaît dans la section "Plan sélectionné"

## Logs à Surveiller

### Frontend (Console)

- `🔍 getCurrentSelectedPlan()` : Doit trouver le plan dans `currentApplication.selectedPlan`
- `✅ Plan trouvé dans currentApplication.selectedPlan`
- `🔍 hasSelectedPlan()` : Doit retourner `true`

### Backend (Terminal)

- Logs de création d'application avec `selectedPlan`
- Pas d'erreurs de validation du schéma MongoDB

## Points de Vérification

✅ **Plan sélectionné** : Le plan "Starter" est bien sélectionné et stocké  
✅ **Base de données** : L'application contient le champ `selectedPlan` avec toutes les informations  
✅ **Configuration** : Le plan apparaît correctement dans la page de configuration  
✅ **Persistance** : Le plan reste affiché même après rafraîchissement de page

## Résolution de Problèmes

### Problème : Plan non trouvé dans la configuration

- Vérifier les logs `getCurrentSelectedPlan()`
- S'assurer que `currentApplication.selectedPlan` existe
- Vérifier la structure des données en base

### Problème : Erreur lors de la création

- Vérifier la validation du DTO côté backend
- S'assurer que toutes les propriétés de `selectedPlan` sont définies
- Vérifier les logs de création d'application

### Problème : Plan Starter non affiché correctement

- Vérifier l'ID du plan : `68bf66d7df8ea2b4245439ff`
- S'assurer que le plan existe dans `/api/v1/plans`
- Vérifier la correspondance entre `plan.id` et `plan._id`
