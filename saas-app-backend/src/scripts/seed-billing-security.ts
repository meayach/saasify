import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { BillingService } from '../controllers/billing/billing.service';
import { SecurityService } from '../controllers/security/security.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const billingService = app.get(BillingService);
  const securityService = app.get(SecurityService);

  try {
    // Créer les paramètres de sécurité par défaut
    console.log('Creating default security settings...');
    await securityService.getSettings();
    console.log('✅ Security settings created');

    // Créer les paramètres de facturation par défaut
    console.log('Creating default billing settings...');
    await billingService.getBillingSettings();
    console.log('✅ Billing settings created');

    // Créer quelques plans par défaut
    console.log('Creating default plans...');

    const starterPlan = {
      name: 'Plan Starter',
      description: 'Parfait pour débuter votre activité SaaS',
      price: 9.99,
      interval: 'month' as const,
      features: [
        '1 Application',
        "Jusqu'à 1000 utilisateurs",
        'Support par email',
        'Tableau de bord basique',
      ],
      isActive: true,
      maxUsers: 1000,
      maxApplications: 1,
      hasApiAccess: false,
      hasAdvancedAnalytics: false,
      hasPrioritySupport: false,
    };

    const proPlan = {
      name: 'Plan Professional',
      description: 'Pour les entreprises en croissance',
      price: 29.99,
      interval: 'month' as const,
      features: [
        '5 Applications',
        "Jusqu'à 10000 utilisateurs",
        'Support prioritaire',
        'Analytics avancées',
        'Accès API complet',
      ],
      isActive: true,
      maxUsers: 10000,
      maxApplications: 5,
      hasApiAccess: true,
      hasAdvancedAnalytics: true,
      hasPrioritySupport: true,
    };

    const enterprisePlan = {
      name: 'Plan Enterprise',
      description: 'Solution sur mesure pour les grandes entreprises',
      price: 99.99,
      interval: 'month' as const,
      features: [
        'Applications illimitées',
        'Utilisateurs illimités',
        'Support 24/7',
        'Analytics personnalisées',
        'Accès API premium',
        'Intégrations personnalisées',
      ],
      isActive: true,
      maxUsers: -1, // illimité
      maxApplications: -1, // illimité
      hasApiAccess: true,
      hasAdvancedAnalytics: true,
      hasPrioritySupport: true,
    };

    await billingService.createPlan(starterPlan);
    await billingService.createPlan(proPlan);
    await billingService.createPlan(enterprisePlan);

    console.log('✅ Default plans created');

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
