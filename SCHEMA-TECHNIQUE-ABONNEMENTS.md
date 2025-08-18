# Schéma Technique - Module d'Abonnements SaaS

## Architecture Générale

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   Database      │
│   (Angular)     │◄──►│    (NestJS)      │◄──►│   (MongoDB)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │     Stripe       │
                        │   (Payments)     │
                        └──────────────────┘
```

## Relations Entre Entités

### Diagramme ER

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    User     │   1   │  Subscription   │   n   │    Payment      │
│             │◄─────►│                 │◄─────►│                 │
│ _id         │       │ userId          │       │ userId          │
│ email       │       │ planId          │       │ subscriptionId  │
│ name        │       │ status          │       │ amount          │
│ stripeId    │       │ startDate       │       │ status          │
└─────────────┘       │ endDate         │       │ date            │
                      │ price           │       └─────────────────┘
                      │ currency        │
                      └─────────────────┘
                              │
                              │ n:1
                              ▼
                      ┌─────────────────┐
                      │     Plan        │
                      │                 │
                      │ _id             │
                      │ name            │
                      │ description     │
                      │ price           │
                      │ billingCycle    │
                      │ features        │
                      │ limits          │
                      └─────────────────┘
                              │
                              │ 1:n
                              ▼
                      ┌─────────────────┐
                      │    Pricing      │
                      │                 │
                      │ planId          │
                      │ model           │
                      │ basePrice       │
                      │ tiers           │
                      │ discounts       │
                      └─────────────────┘

┌─────────────┐       ┌─────────────────┐
│    User     │   1   │ PaymentMethod   │
│             │◄─────►│                 │
│ _id         │       │ userId          │
└─────────────┘       │ type            │
                      │ isDefault       │
                      │ stripeMethodId  │
                      │ last4           │
                      │ brand           │
                      └─────────────────┘

┌─────────────┐       ┌─────────────────┐
│    Plan     │   1   │     Offer       │
│             │◄─────►│                 │
│ _id         │       │ applicablePlans │
└─────────────┘       │ discountType    │
                      │ discountValue   │
                      │ validFrom       │
                      │ validUntil      │
                      │ couponCode      │
                      └─────────────────┘
```

## Flux de Données

### 1. Processus d'Abonnement

```
1. User selects plan
      │
      ▼
2. Frontend calls createSubscription API
      │
      ▼
3. Backend creates Stripe subscription
      │
      ▼
4. Stripe returns client_secret
      │
      ▼
5. Frontend confirms payment
      │
      ▼
6. Stripe webhook notifies backend
      │
      ▼
7. Backend updates subscription status
      │
      ▼
8. User gets active subscription
```

### 2. Processus de Paiement

```
1. Stripe charges customer
      │
      ▼
2. Webhook sent to backend
      │
      ▼
3. Backend verifies signature
      │
      ▼
4. Payment record created
      │
      ▼
5. Subscription status updated
      │
      ▼
6. User notification sent
```

## APIs Principales

### Subscription Management

- `POST /api/v1/subscription-management/subscribe`
- `GET /api/v1/subscription-management/my-subscriptions`
- `PATCH /api/v1/subscription-management/:id/upgrade`
- `POST /api/v1/subscription-management/:id/cancel`

### Plan Management

- `GET /api/v1/plans`
- `GET /api/v1/plans/:id`
- `POST /api/v1/plans`
- `PATCH /api/v1/plans/:id`
- `GET /api/v1/plans/:id/pricing`

### Payment Management

- `GET /api/v1/payments/payment-methods`
- `POST /api/v1/payments/payment-methods`
- `DELETE /api/v1/payments/payment-methods/:id`
- `GET /api/v1/payments/billing-history`

### Webhooks

- `POST /api/v1/webhooks/stripe`

## Structure des Données

### Plan

```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  type: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE',
  billingCycle: 'MONTHLY' | 'YEARLY',
  price: number,
  currencyId: ObjectId,
  features: {
    storage: '10GB',
    users: 5,
    apiCalls: 1000
  },
  limits: {
    users: 5,
    storage: 10000, // in MB
    apiCalls: 1000
  },
  includedFeatures: ['Support 24/7', 'Analytics'],
  isPopular: boolean,
  isActive: boolean
}
```

### Subscription

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  planId: ObjectId,
  status: 'ACTIVE' | 'CANCELLED' | 'TRIAL' | 'SUSPENDED',
  billingCycle: 'MONTHLY' | 'YEARLY',
  price: number,
  currency: 'USD',
  startDate: Date,
  endDate: Date,
  nextBillingDate: Date,
  trialEndDate: Date,
  currentUsage: {
    users: 3,
    storage: 5000,
    apiCalls: 450
  },
  metadata: {
    stripeSubscriptionId: 'sub_xxx',
    stripeCustomerId: 'cus_xxx'
  }
}
```

### Payment

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  subscriptionId: ObjectId,
  planId: ObjectId,
  amount: number,
  currency: 'USD',
  status: 'COMPLETED' | 'FAILED' | 'PENDING',
  type: 'SUBSCRIPTION' | 'UPGRADE' | 'ONE_TIME',
  transactionId: 'pi_xxx',
  paymentGateway: 'stripe',
  paymentDate: Date,
  invoiceUrl: string,
  receiptUrl: string
}
```

## Configuration Stripe

### Webhooks Requis

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_method.attached`

### Variables d'Environnement

```bash
# Backend (.env)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PUBLIC_KEY=pk_test_xxx

# Frontend (environment.ts)
stripePublicKey=pk_test_xxx
```

## Sécurité

### Authentification

- JWT tokens pour toutes les APIs
- Validation des permissions utilisateur
- Vérification des signatures Stripe

### Validation

- Validation des montants et devises
- Vérification de l'appartenance des ressources
- Sanitisation des données d'entrée

## Performance

### Optimisations

- Index sur userId, planId, status
- Pagination des listes
- Cache des plans fréquemment consultés
- Requêtes aggregées pour les statistiques

### Monitoring

- Logs des transactions importantes
- Métriques de performance des APIs
- Alertes sur les échecs de paiement
