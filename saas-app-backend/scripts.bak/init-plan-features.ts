import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PlanFeatureService } from '../services/planFeature/planFeature.service';
import { FeatureService } from '../services/feature/feature.service';
import { FeatureStatus } from '../data/models/featurePlanConfiguration/featurePlanConfiguration.pojo.model';

async function initializePlanFeatures() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const planFeatureService = app.get(PlanFeatureService);
  const featureService = app.get(FeatureService);

  console.log('🚀 Initializing plan features configurations...');

  // Récupérer toutes les fonctionnalités globales
  const globalFeatures = await featureService.getAllFeatures({ isGlobal: true });

  // Supposons que nous avons des IDs de plans prédéfinis (à adapter selon votre contexte)
  const applicationId = '507f1f77bcf86cd799439011'; // Exemple d'ID d'application

  // Configuration pour le plan FREE
  const freePlanId = '507f1f77bcf86cd799439021'; // Exemple d'ID de plan Free

  const freePlanFeatures = [
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'email_messaging')?._id?.toString() || '',
      status: FeatureStatus.LIMITED,
      customDisplayName: 'Emails basiques',
      customDescription: "Envoi d'emails avec limitation",
      isHighlighted: false,
      sortOrder: 1,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'email_messaging')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 50,
          displayValue: '50 emails/mois',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'data_storage')?._id?.toString() || '',
      status: FeatureStatus.LIMITED,
      customDisplayName: 'Stockage limité',
      sortOrder: 2,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'data_storage')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 1,
          displayValue: '1 GB',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'user_management')?._id?.toString() || '',
      status: FeatureStatus.LIMITED,
      sortOrder: 3,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'user_management')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 3,
          displayValue: '3 utilisateurs',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'customer_support')?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      sortOrder: 4,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'customer_support')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 'email',
          displayValue: 'Support par email',
          isUnlimited: false,
        },
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'customer_support')
              ?.customFields[1]?._id?.toString() || '',
          fieldValue: 48,
          displayValue: '48h',
          isUnlimited: false,
        },
      ],
    },
  ].filter((f) => f.featureId); // Filtrer les features non trouvées

  await planFeatureService.configurePlanFeatures(freePlanId, applicationId, freePlanFeatures);
  console.log('✅ Free plan features configured');

  // Configuration pour le plan STANDARD
  const standardPlanId = '507f1f77bcf86cd799439022'; // Exemple d'ID de plan Standard

  const standardPlanFeatures = [
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'email_messaging')?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      isHighlighted: true,
      highlightText: 'Populaire!',
      sortOrder: 1,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'email_messaging')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 500,
          displayValue: '500 emails/mois',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'data_storage')?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      sortOrder: 2,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'data_storage')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 10,
          displayValue: '10 GB',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId: globalFeatures.find((f) => f.feature.name === 'api_access')?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      sortOrder: 3,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'api_access')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 5000,
          displayValue: '5,000 requêtes/mois',
          isUnlimited: false,
        },
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'api_access')
              ?.customFields[1]?._id?.toString() || '',
          fieldValue: 'standard',
          displayValue: 'API Standard',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'user_management')?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      sortOrder: 4,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'user_management')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 10,
          displayValue: '10 utilisateurs',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'advanced_analytics')?._id?.toString() || '',
      status: FeatureStatus.LIMITED,
      sortOrder: 5,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'advanced_analytics')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 6,
          displayValue: '6 mois',
          isUnlimited: false,
        },
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'advanced_analytics')
              ?.customFields[1]?._id?.toString() || '',
          fieldValue: false,
          displayValue: 'Non disponible',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'customer_support')?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      sortOrder: 6,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'customer_support')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 'priority',
          displayValue: 'Support prioritaire',
          isUnlimited: false,
        },
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'customer_support')
              ?.customFields[1]?._id?.toString() || '',
          fieldValue: 24,
          displayValue: '24h',
          isUnlimited: false,
        },
      ],
    },
  ].filter((f) => f.featureId);

  await planFeatureService.configurePlanFeatures(
    standardPlanId,
    applicationId,
    standardPlanFeatures,
  );
  console.log('✅ Standard plan features configured');

  // Configuration pour le plan PREMIUM
  const premiumPlanId = '507f1f77bcf86cd799439023'; // Exemple d'ID de plan Premium

  const premiumPlanFeatures = [
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'email_messaging')?._id?.toString() || '',
      status: FeatureStatus.UNLIMITED,
      isHighlighted: true,
      highlightText: 'Illimité!',
      sortOrder: 1,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'email_messaging')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: -1,
          displayValue: 'Illimité',
          isUnlimited: true,
        },
      ],
    },
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'data_storage')?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      sortOrder: 2,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'data_storage')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 100,
          displayValue: '100 GB',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId: globalFeatures.find((f) => f.feature.name === 'api_access')?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      sortOrder: 3,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'api_access')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 50000,
          displayValue: '50,000 requêtes/mois',
          isUnlimited: false,
        },
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'api_access')
              ?.customFields[1]?._id?.toString() || '',
          fieldValue: 'premium',
          displayValue: 'API Premium',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'user_management')?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      sortOrder: 4,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'user_management')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 50,
          displayValue: '50 utilisateurs',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'advanced_analytics')?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      sortOrder: 5,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'advanced_analytics')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 24,
          displayValue: '24 mois',
          isUnlimited: false,
        },
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'advanced_analytics')
              ?.customFields[1]?._id?.toString() || '',
          fieldValue: true,
          displayValue: 'Disponible',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'security_features')?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      sortOrder: 6,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'security_features')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: true,
          displayValue: 'SSO activé',
          isUnlimited: false,
        },
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'security_features')
              ?.customFields[1]?._id?.toString() || '',
          fieldValue: true,
          displayValue: "Logs d'audit",
          isUnlimited: false,
        },
      ],
    },
    {
      featureId:
        globalFeatures
          .find((f) => f.feature.name === 'third_party_integrations')
          ?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      sortOrder: 7,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'third_party_integrations')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: 20,
          displayValue: '20 intégrations',
          isUnlimited: false,
        },
      ],
    },
    {
      featureId:
        globalFeatures.find((f) => f.feature.name === 'customer_support')?._id?.toString() || '',
      status: FeatureStatus.ENABLED,
      sortOrder: 8,
      fieldValues: [
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'customer_support')
              ?.customFields[0]?._id?.toString() || '',
          fieldValue: '24x7',
          displayValue: 'Support 24/7',
          isUnlimited: false,
        },
        {
          customFieldId:
            globalFeatures
              .find((f) => f.feature.name === 'customer_support')
              ?.customFields[1]?._id?.toString() || '',
          fieldValue: 2,
          displayValue: '2h',
          isUnlimited: false,
        },
      ],
    },
  ].filter((f) => f.featureId);

  await planFeatureService.configurePlanFeatures(premiumPlanId, applicationId, premiumPlanFeatures);
  console.log('✅ Premium plan features configured');

  console.log('✅ All plan features initialized successfully!');

  await app.close();
}

// Exécuter le script si appelé directement
if (require.main === module) {
  initializePlanFeatures()
    .then(() => {
      console.log('✅ Plan features initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Plan features initialization failed:', error);
      process.exit(1);
    });
}

export { initializePlanFeatures };
