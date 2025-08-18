# Guide d'Installation - Module d'Abonnements SaaS

## Prérequis

- Node.js 18+
- MongoDB 5.0+
- Compte Stripe (Test et Production)
- Angular CLI 16+

## Installation Backend (NestJS)

### 1. Installation des dépendances

```bash
cd saas-app-backend
npm install stripe @types/stripe
npm install @nestjs/mongoose mongoose
npm install @nestjs/swagger swagger-ui-express
```

### 2. Configuration des variables d'environnement

Créer/modifier le fichier `.env` :

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/saasify-db

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_stripe
STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook

# JWT
JWT_SECRET=votre_jwt_secret_super_securise

# Application
PORT=3001
NODE_ENV=development
```

### 3. Ajouter les modèles dans app.module.ts

```typescript
import { MongooseModule } from '@nestjs/mongoose';
import { SaasPlan, SaasPlanSchema } from './data/models/saasPlan/saas-plan.model';
import { SaasSubscription, SaasSubscriptionSchema } from './data/models/saassubscription/saas-subscription.model';
import { SaasPayment, SaasPaymentSchema } from './data/models/SaasPayment/saas-payment.model';
import { PaymentMethod, PaymentMethodSchema } from './data/models/paymentMethod/payment-method.model';
import { SaasOffer, SaasOfferSchema } from './data/models/saasOffer/saas-offer.model';
import { SaasPricing, SaasPricingSchema } from './data/models/saasPricing/saas-pricing.model';

@Module({
  imports: [
    // ... autres imports
    MongooseModule.forFeature([
      { name: SaasPlan.name, schema: SaasPlanSchema },
      { name: SaasSubscription.name, schema: SaasSubscriptionSchema },
      { name: SaasPayment.name, schema: SaasPaymentSchema },
      { name: PaymentMethod.name, schema: PaymentMethodSchema },
      { name: SaasOffer.name, schema: SaasOfferSchema },
      { name: SaasPricing.name, schema: SaasPricingSchema },
    ]),
  ],
  // ...
})
```

### 4. Ajouter les contrôleurs et services

Dans `app.module.ts` :

```typescript
import { SubscriptionManagementController } from './controllers/subscription/subscription-management.controller';
import { PlanManagementController } from './controllers/plan/plan-management.controller';
import { PaymentController } from './controllers/payment/payment.controller';
import { WebhookController } from './controllers/payment/webhook.controller';

import { SubscriptionManagementService } from './services/subscription/subscription-management.service';
import { PlanManagementService } from './services/plan/plan-management.service';
import { PaymentService } from './services/payment/payment.service';

@Module({
  controllers: [
    // ... autres contrôleurs
    SubscriptionManagementController,
    PlanManagementController,
    PaymentController,
    WebhookController,
  ],
  providers: [
    // ... autres services
    SubscriptionManagementService,
    PlanManagementService,
    PaymentService,
  ],
})
```

## Installation Frontend (Angular)

### 1. Configuration de l'environnement

Modifier `src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3001",
  stripePublicKey: "pk_test_votre_cle_publique_stripe",
  keycloak: {
    // ... config keycloak existante
  },
};
```

### 2. Ajouter le module aux imports de l'app

Dans `app.module.ts` :

```typescript
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    // ... autres imports
    HttpClientModule,
  ],
})
```

### 3. Configuration du routing

Le module est déjà configuré avec lazy loading dans `app-routing.module.ts`.

## Configuration Stripe

### 1. Créer un compte Stripe

1. Aller sur [stripe.com](https://stripe.com)
2. Créer un compte
3. Récupérer les clés API dans le dashboard

### 2. Configurer les Webhooks

Dans le dashboard Stripe :

1. Aller dans `Developers > Webhooks`
2. Cliquer sur `Add endpoint`
3. URL : `https://votre-domaine.com/api/v1/webhooks/stripe`
4. Sélectionner les événements :

   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_method.attached`

5. Récupérer le secret du webhook et l'ajouter dans `.env`

### 3. Créer des produits et prix dans Stripe

```javascript
// Script pour créer des plans dans Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function createPlans() {
  // Plan Basique
  const basicProduct = await stripe.products.create({
    name: "Plan Basique",
    description: "Plan de base pour les petites équipes",
  });

  const basicPriceMonthly = await stripe.prices.create({
    product: basicProduct.id,
    unit_amount: 999, // $9.99
    currency: "usd",
    recurring: {
      interval: "month",
    },
  });

  const basicPriceYearly = await stripe.prices.create({
    product: basicProduct.id,
    unit_amount: 9990, // $99.90 (économie de 2 mois)
    currency: "usd",
    recurring: {
      interval: "year",
    },
  });

  console.log("Plans créés:", {
    basicProduct: basicProduct.id,
    basicPriceMonthly: basicPriceMonthly.id,
    basicPriceYearly: basicPriceYearly.id,
  });
}

createPlans();
```

## Initialisation de la Base de Données

### 1. Script de données de test

Créer `scripts/init-subscription-data.ts` :

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { Model } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";
import { SaasPlan } from "../src/data/models/saasPlan/saas-plan.model";
import { SaasCurrency } from "../src/data/models/saasCurrency/saas-currency.model";

async function initializeData() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const currencyModel = app.get<Model<SaasCurrency>>(
    getModelToken("SaasCurrency")
  );
  const planModel = app.get<Model<SaasPlan>>(getModelToken("SaasPlan"));

  // Créer les devises
  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", decimalPlaces: 2 },
    { code: "EUR", name: "Euro", symbol: "€", decimalPlaces: 2 },
    { code: "GBP", name: "British Pound", symbol: "£", decimalPlaces: 2 },
  ];

  for (const currencyData of currencies) {
    await currencyModel.findOneAndUpdate(
      { code: currencyData.code },
      currencyData,
      { upsert: true, new: true }
    );
  }

  const usdCurrency = await currencyModel.findOne({ code: "USD" });

  // Créer les plans
  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals and small teams",
      type: "BASIC",
      billingCycle: "MONTHLY",
      price: 9.99,
      currencyId: usdCurrency._id,
      features: {
        storage: "10GB",
        users: 5,
        apiCalls: 1000,
        support: "Email",
      },
      limits: {
        users: 5,
        storage: 10240, // MB
        apiCalls: 1000,
      },
      includedFeatures: [
        "Email Support",
        "Basic Analytics",
        "API Access",
        "Mobile App",
      ],
      isPopular: false,
    },
    {
      name: "Professional",
      description: "Best for growing businesses",
      type: "PREMIUM",
      billingCycle: "MONTHLY",
      price: 29.99,
      currencyId: usdCurrency._id,
      features: {
        storage: "100GB",
        users: 25,
        apiCalls: 10000,
        support: "Priority",
      },
      limits: {
        users: 25,
        storage: 102400, // MB
        apiCalls: 10000,
      },
      includedFeatures: [
        "Priority Support",
        "Advanced Analytics",
        "API Access",
        "Mobile App",
        "Custom Integrations",
        "Team Collaboration",
      ],
      isPopular: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      type: "ENTERPRISE",
      billingCycle: "MONTHLY",
      price: 99.99,
      currencyId: usdCurrency._id,
      features: {
        storage: "Unlimited",
        users: "Unlimited",
        apiCalls: "Unlimited",
        support: "Dedicated",
      },
      limits: {
        users: -1, // Unlimited
        storage: -1, // Unlimited
        apiCalls: -1, // Unlimited
      },
      includedFeatures: [
        "Dedicated Support Manager",
        "Enterprise Analytics",
        "API Access",
        "Mobile App",
        "Custom Integrations",
        "Team Collaboration",
        "Single Sign-On (SSO)",
        "Advanced Security",
        "Custom Branding",
      ],
      isPopular: false,
    },
  ];

  for (const planData of plans) {
    await planModel.findOneAndUpdate(
      { name: planData.name, billingCycle: planData.billingCycle },
      planData,
      { upsert: true, new: true }
    );
  }

  console.log("Data initialized successfully!");
  await app.close();
}

initializeData().catch(console.error);
```

### 2. Exécuter le script

```bash
cd saas-app-backend
npx ts-node scripts/init-subscription-data.ts
```

## Démarrage de l'Application

### 1. Démarrer MongoDB

```bash
# Si MongoDB est installé localement
mongod

# Ou avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:5.0
```

### 2. Démarrer le Backend

```bash
cd saas-app-backend
npm run start:dev
```

### 3. Démarrer le Frontend

```bash
cd saas-app-frontend
npm start
```

### 4. Accéder à l'application

- Frontend : `http://localhost:4200`
- Backend API : `http://localhost:3001`
- Swagger Documentation : `http://localhost:3001/api`

## Test de l'Intégration

### 1. Tester les APIs avec Postman

Collection Postman avec les endpoints principaux :

```json
{
  "info": {
    "name": "SaaS Subscriptions API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Plans",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/v1/plans",
          "host": ["{{baseUrl}}"],
          "path": ["api", "v1", "plans"]
        }
      }
    },
    {
      "name": "Create Subscription",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"planId\": \"plan_id_here\",\n  \"billingCycle\": \"MONTHLY\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/v1/subscription-management/subscribe",
          "host": ["{{baseUrl}}"],
          "path": ["api", "v1", "subscription-management", "subscribe"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001"
    }
  ]
}
```

### 2. Tester l'interface frontend

1. Aller sur `http://localhost:4200/subscriptions`
2. Vérifier que les plans s'affichent
3. Tester la sélection d'un plan
4. Vérifier les informations d'abonnement

## Déploiement

### Variables d'environnement Production

```bash
# Backend Production
MONGODB_URI=mongodb://production-host:27017/saasify
STRIPE_SECRET_KEY=sk_live_votre_cle_live
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_live
JWT_SECRET=super_secret_jwt_key_production
NODE_ENV=production

# Frontend Production
stripePublicKey=pk_live_votre_cle_publique_live
apiUrl=https://api.votre-domaine.com
```

### Sécurité Production

1. Utiliser HTTPS uniquement
2. Configurer CORS correctement
3. Activer la validation des webhooks Stripe
4. Utiliser des variables d'environnement sécurisées
5. Monitorer les logs d'erreur

## Maintenance

### Surveillance

1. Monitorer les échecs de paiement
2. Vérifier les webhooks Stripe
3. Surveiller l'utilisation des APIs
4. Alertes sur les erreurs critiques

### Backup

1. Sauvegardes régulières de MongoDB
2. Logs des transactions importantes
3. Historique des changements de plans

## Support

Pour toute question ou problème :

1. Vérifier les logs du backend
2. Consulter la documentation Stripe
3. Tester les webhooks avec ngrok en développement
4. Vérifier la configuration des variables d'environnement
