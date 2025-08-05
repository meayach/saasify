import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SaasSubscriptionService } from '../services/subscription/saas-subscription.service';
import { BillingCycle } from '../services/dto/subscription.dto';

async function createTestSubscriptions() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const subscriptionService = app.get(SaasSubscriptionService);

  try {
    console.log('Creating test subscriptions...');

    const testSubscriptions = [
      {
        customerId: '60d5ecb8b34c8b4b7c8b4567',
        planId: '60d5ecb8b34c8b4b7c8b4568',
        applicationId: '60d5ecb8b34c8b4b7c8b4569',
        price: 29.99,
        currency: 'EUR',
        billingCycle: BillingCycle.MONTHLY,
      },
      {
        customerId: '60d5ecb8b34c8b4b7c8b4570',
        planId: '60d5ecb8b34c8b4b7c8b4571',
        applicationId: '60d5ecb8b34c8b4b7c8b4572',
        price: 99.99,
        currency: 'EUR',
        billingCycle: BillingCycle.MONTHLY,
      },
      {
        customerId: '60d5ecb8b34c8b4b7c8b4573',
        planId: '60d5ecb8b34c8b4b7c8b4574',
        applicationId: '60d5ecb8b34c8b4b7c8b4575',
        price: 19.99,
        currency: 'EUR',
        billingCycle: BillingCycle.MONTHLY,
      },
      {
        customerId: '60d5ecb8b34c8b4b7c8b4576',
        planId: '60d5ecb8b34c8b4b7c8b4577',
        applicationId: '60d5ecb8b34c8b4b7c8b4578',
        price: 49.99,
        currency: 'EUR',
        billingCycle: BillingCycle.MONTHLY,
      },
      {
        customerId: '60d5ecb8b34c8b4b7c8b4579',
        planId: '60d5ecb8b34c8b4b7c8b4580',
        applicationId: '60d5ecb8b34c8b4b7c8b4581',
        price: 39.99,
        currency: 'EUR',
        billingCycle: BillingCycle.MONTHLY,
      },
    ];

    for (const subscriptionData of testSubscriptions) {
      try {
        await subscriptionService.createSubscription(subscriptionData);
        console.log(`Subscription created: €${subscriptionData.price}`);
      } catch (error) {
        console.log(`Subscription creation failed: €${subscriptionData.price}`);
      }
    }

    console.log('Test subscriptions creation completed!');

    // Vérifier les statistiques
    const stats = await subscriptionService.getSubscriptionStats();
    console.log('Current subscription stats:');
    console.log('Active subscriptions:', stats.activeSubscriptions);
    console.log('Pending subscriptions:', stats.pendingSubscriptions);
    console.log('Monthly revenue: €', stats.monthlyRevenue);
  } catch (error) {
    console.error('Error creating test subscriptions:', error);
  }

  await app.close();
}

// Exécuter uniquement si ce fichier est exécuté directement
if (require.main === module) {
  createTestSubscriptions();
}

export { createTestSubscriptions };
