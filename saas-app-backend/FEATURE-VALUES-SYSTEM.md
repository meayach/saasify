# Système de Feature Values pour Applications SaaS

## Vue d'ensemble

Ce système implémente la fonctionnalité demandée permettant aux Customer Admins de créer et configurer des valeurs de fonctionnalités pour leurs applications SaaS, avec des unités personnalisables et des valeurs différentes par plan (Free, Premium, Enterprise).

## Architecture

### 1. Modèle de données (POJO)

**Fichier**: `src/data/models/saasFeatureValue/saasFeatureValue.pojo.model.ts`

```typescript
export enum FeatureType {
  LIMIT = 'limit', // Limite (ex: 10 emails/mois)
  QUOTA = 'quota', // Quota (ex: 5GB de stockage)
  BOOLEAN = 'boolean', // Activé/Désactivé (ex: Support 24/7)
  ACCESS = 'access', // Niveau d'accès (ex: API basique/complète)
}

export enum FeatureUnit {
  // Communications
  EMAILS = 'emails',
  SMS = 'sms',

  // Stockage
  BYTES = 'bytes',
  KB = 'kb',
  MB = 'mb',
  GIGABYTES = 'gb',
  TERABYTES = 'tb',

  // Utilisateurs et ressources
  USERS = 'users',
  COUNT = 'count',

  // Réseau
  REQUESTS = 'requests',
  TRANSACTIONS = 'transactions',

  // Temps
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  MONTHS = 'months',

  // Spéciaux
  PERCENTAGE = 'percentage',
  UNLIMITED = 'unlimited',
}
```

### 2. Repository Pattern

**Fichier**: `src/data/saasFeatureValue/repository/saasFeatureValue.repository.ts`

Méthodes principales:

- `createFeatureValue()` - Création d'une valeur de fonctionnalité
- `findByApplication()` - Récupération par application
- `findByApplicationAndPlan()` - Récupération par application et plan
- `getFeaturesByApplicationGroupedByPlan()` - Groupement par plan
- `bulkCreateFeatureValues()` - Création en lot

### 3. Service Layer

**Fichier**: `src/services/featureValue/saas-feature-value.service.ts`

**Fonctionnalités clés**:

- ✅ Validation automatique des applications et plans
- ✅ Génération automatique des valeurs d'affichage (ex: "10 emails/mois", "5 GB", "Illimité")
- ✅ Création en lot avec gestion d'erreurs
- ✅ Opérations CRUD complètes

**Exemple de génération automatique**:

```typescript
// Input: value: 10, unit: FeatureUnit.EMAILS
// Output: "10 emails/mois"

// Input: value: -1, unit: FeatureUnit.UNLIMITED
// Output: "Illimité"
```

### 4. DTOs de Validation

**Fichier**: `src/services/dto/saas-feature-value.dto.ts`

- `CreateSaasFeatureValueDto` - Création avec validation complète
- `UpdateSaasFeatureValueDto` - Mise à jour partielle
- `BulkCreateFeatureValuesDto` - Création en lot
- `SaasFeatureValueResponseDto` - Réponse formatée

### 5. API REST Controller

**Fichier**: `src/controllers/featureValue/saas-feature-value.controller.ts`

**Endpoints disponibles**:

```
POST   /api/feature-values                              # Créer une feature value
POST   /api/feature-values/bulk                         # Création en lot
GET    /api/feature-values/application/:applicationId   # Par application
GET    /api/feature-values/application/:applicationId/plan/:planId # Par app+plan
GET    /api/feature-values/application/:applicationId/grouped # Groupé par plan
PATCH  /api/feature-values/:id                          # Mettre à jour
DELETE /api/feature-values/:id                          # Supprimer
```

## Utilisation Pratique

### Exemple d'implémentation selon votre spécification

```typescript
// FREE PLAN - 10 emails
{
  saasApplicationId: "app123",
  featureName: "Emails par mois",
  featureType: FeatureType.LIMIT,
  unit: FeatureUnit.EMAILS,
  value: 10,
  saasPlanId: "plan-free"
}

// PREMIUM PLAN - 200 emails
{
  saasApplicationId: "app123",
  featureName: "Emails par mois",
  featureType: FeatureType.LIMIT,
  unit: FeatureUnit.EMAILS,
  value: 200,
  saasPlanId: "plan-premium"
}

// ENTERPRISE PLAN - Illimité
{
  saasApplicationId: "app123",
  featureName: "Emails par mois",
  featureType: FeatureType.LIMIT,
  unit: FeatureUnit.UNLIMITED,
  value: -1, // Convention pour illimité
  saasPlanId: "plan-enterprise"
}
```

### Script d'initialisation

**Fichier**: `src/scripts/init-feature-values-simple.ts`

Exécution:

```bash
npm run build
node dist/scripts/init-feature-values-simple.js
```

Ce script crée automatiquement:

- **Plan Free**: 10 emails/mois, 1 GB stockage, 1 utilisateur
- **Plan Premium**: 200 emails/mois, 50 GB stockage, 10 utilisateurs
- **Plan Enterprise**: Tout illimité

## Intégration dans l'Application

### 1. Module ajouté à App

Le système est intégré dans `app.module.ts` via `SaasFeatureValueControllerModule`.

### 2. Routes générées automatiquement

```
[RouterExplorer] Mapped {/api/feature-values, POST} route
[RouterExplorer] Mapped {/api/feature-values/bulk, POST} route
[RouterExplorer] Mapped {/api/feature-values/application/:applicationId, GET} route
[RouterExplorer] Mapped {/api/feature-values/application/:applicationId/plan/:planId, GET} route
[RouterExplorer] Mapped {/api/feature-values/application/:applicationId/grouped, GET} route
[RouterExplorer] Mapped {/api/feature-values/:id, PATCH} route
[RouterExplorer] Mapped {/api/feature-values/:id, DELETE} route
```

## Workflow Customer Admin

1. **Création d'application** → Définition des fonctionnalités disponibles
2. **Configuration des plans** → Attribution des valeurs par plan
3. **Utilisation des unités** → GB, TB, emails, utilisateurs, etc.
4. **Valeurs par tier** → Free/Premium/Enterprise avec limites différentes

## Exemple d'usage Frontend

```typescript
// Récupérer les features d'une application groupées par plan
const response = await fetch('/api/feature-values/application/123/grouped');
const featuresByPlan = await response.json();

// Structure de réponse:
{
  "plan-free": [
    { featureName: "Emails par mois", displayValue: "10 emails/mois" },
    { featureName: "Stockage", displayValue: "1 GB" }
  ],
  "plan-premium": [
    { featureName: "Emails par mois", displayValue: "200 emails/mois" },
    { featureName: "Stockage", displayValue: "50 GB" }
  ],
  "plan-enterprise": [
    { featureName: "Emails par mois", displayValue: "Illimité" },
    { featureName: "Stockage", displayValue: "Illimité" }
  ]
}
```

## État du Système

✅ **Terminé et fonctionnel**:

- Modèle de données avec enums complets
- Repository avec méthodes spécialisées
- Service avec logique métier
- DTOs de validation
- Contrôleur REST complet
- Script d'initialisation
- Intégration dans l'application
- Compilation sans erreurs
- Routes mappées correctement

🎯 **Correspond exactement à votre demande**:

- ✅ Fonctionnalités appartenant à une application
- ✅ Configuration lors de la création d'application
- ✅ Détermination des fonctionnalités avec leurs unités
- ✅ Valeurs différenciées par plan (Free: 10 emails, Premium: 200, Enterprise: illimité)
- ✅ Unités configurables (gigabytes, terabytes, emails, etc.)
- ✅ Customer Admin peut créer les valeurs

Le système est prêt à être utilisé en production ! 🚀
