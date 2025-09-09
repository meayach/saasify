import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { FeatureService } from '../src/services/feature/feature.service';
import { FeatureMigrationService } from '../src/services/featureMigration/featureMigration.service';
import {
  FeatureCategory,
  FeatureStatus,
  FieldType,
} from '../src/data/entities/feature/feature.pojo.model';

/**
 * Script to initialize default features and migrate existing data
 */
async function initializeFeatures() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const featureService = app.get(FeatureService);
    const migrationService = app.get(FeatureMigrationService);

    console.log('🚀 Starting feature initialization...');

    // Define default global features
    const defaultFeatures = [
      // Core Features
      {
        name: 'user-management',
        description: 'Gestion des utilisateurs et des rôles',
        category: FeatureCategory.CORE,
        isGlobal: true,
        status: FeatureStatus.ACTIVE,
        customFields: [
          {
            fieldName: 'maxUsers',
            displayName: "Nombre maximum d'utilisateurs",
            description: "Limite du nombre d'utilisateurs actifs",
            fieldType: FieldType.NUMBER,
            isRequired: true,
            defaultValue: '10',
            validation: {
              min: 1,
              max: 10000,
              helpText: 'Entre 1 et 10,000 utilisateurs',
            },
          },
          {
            fieldName: 'roleBasedAccess',
            displayName: "Contrôle d'accès basé sur les rôles",
            description: 'Activer la gestion des permissions par rôle',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'true',
          },
        ],
      },
      {
        name: 'data-storage',
        description: 'Stockage et gestion des données',
        category: FeatureCategory.CORE,
        isGlobal: true,
        status: FeatureStatus.ACTIVE,
        customFields: [
          {
            fieldName: 'storageLimit',
            displayName: 'Limite de stockage (GB)',
            description: 'Espace de stockage maximum autorisé',
            fieldType: FieldType.NUMBER,
            isRequired: true,
            defaultValue: '5',
            validation: {
              min: 1,
              max: 1000,
              helpText: 'Entre 1 GB et 1 TB',
            },
          },
          {
            fieldName: 'backupEnabled',
            displayName: 'Sauvegardes automatiques',
            description: 'Activer les sauvegardes automatiques',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
        ],
      },
      {
        name: 'basic-support',
        description: 'Support client de base',
        category: FeatureCategory.CORE,
        isGlobal: true,
        status: FeatureStatus.ACTIVE,
        customFields: [
          {
            fieldName: 'supportChannels',
            displayName: 'Canaux de support',
            description: 'Types de support disponibles (email, chat, phone)',
            fieldType: FieldType.TEXT,
            isRequired: false,
            defaultValue: 'email',
          },
          {
            fieldName: 'responseTime',
            displayName: 'Temps de réponse (heures)',
            description: 'Temps de réponse maximum garanti',
            fieldType: FieldType.NUMBER,
            isRequired: false,
            defaultValue: '48',
            validation: {
              min: 1,
              max: 168,
            },
          },
        ],
      },

      // Advanced Features
      {
        name: 'advanced-analytics',
        description: 'Analyses et rapports avancés',
        category: FeatureCategory.ADVANCED,
        isGlobal: true,
        status: FeatureStatus.ACTIVE,
        customFields: [
          {
            fieldName: 'reportTypes',
            displayName: 'Types de rapports',
            description: 'Types de rapports disponibles',
            fieldType: FieldType.TEXT,
            isRequired: false,
            defaultValue: 'basic,advanced',
          },
          {
            fieldName: 'realTimeData',
            displayName: 'Données en temps réel',
            description: 'Accès aux données en temps réel',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
          {
            fieldName: 'dataRetention',
            displayName: 'Rétention des données (jours)',
            description: 'Durée de conservation des données analytiques',
            fieldType: FieldType.NUMBER,
            isRequired: false,
            defaultValue: '90',
            validation: {
              min: 30,
              max: 2555,
            },
          },
        ],
      },
      {
        name: 'workflow-automation',
        description: 'Automatisation des processus métier',
        category: FeatureCategory.ADVANCED,
        isGlobal: true,
        status: FeatureStatus.ACTIVE,
        customFields: [
          {
            fieldName: 'maxWorkflows',
            displayName: 'Nombre maximum de workflows',
            description: 'Limite du nombre de workflows actifs',
            fieldType: FieldType.NUMBER,
            isRequired: true,
            defaultValue: '5',
            validation: {
              min: 1,
              max: 100,
            },
          },
          {
            fieldName: 'complexWorkflows',
            displayName: 'Workflows complexes',
            description: 'Autoriser les workflows avec conditions multiples',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
        ],
      },
      {
        name: 'api-access',
        description: 'Accès API REST et webhooks',
        category: FeatureCategory.ADVANCED,
        isGlobal: true,
        status: FeatureStatus.ACTIVE,
        customFields: [
          {
            fieldName: 'apiCallsLimit',
            displayName: "Limite d'appels API par mois",
            description: "Nombre maximum d'appels API autorisés",
            fieldType: FieldType.NUMBER,
            isRequired: true,
            defaultValue: '1000',
            validation: {
              min: 100,
              max: 1000000,
            },
          },
          {
            fieldName: 'webhooksEnabled',
            displayName: 'Webhooks',
            description: 'Activer les notifications webhook',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
          {
            fieldName: 'rateLimitBypass',
            displayName: 'Bypass des limites de taux',
            description: 'Autoriser le dépassement temporaire des limites',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
        ],
      },

      // Premium Features
      {
        name: 'white-label',
        description: 'Personnalisation de marque complète',
        category: FeatureCategory.PREMIUM,
        isGlobal: true,
        status: FeatureStatus.ACTIVE,
        customFields: [
          {
            fieldName: 'customDomain',
            displayName: 'Domaine personnalisé',
            description: "Autoriser l'utilisation d'un domaine personnalisé",
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
          {
            fieldName: 'customStyling',
            displayName: 'Styles personnalisés',
            description: 'Personnalisation complète des styles CSS',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
          {
            fieldName: 'brandingRemoval',
            displayName: 'Suppression du branding',
            description: 'Supprimer complètement le branding de la plateforme',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
        ],
      },
      {
        name: 'enterprise-security',
        description: 'Sécurité de niveau entreprise',
        category: FeatureCategory.PREMIUM,
        isGlobal: true,
        status: FeatureStatus.ACTIVE,
        customFields: [
          {
            fieldName: 'ssoEnabled',
            displayName: 'Single Sign-On (SSO)',
            description: "Activer l'authentification SSO",
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
          {
            fieldName: 'mfaRequired',
            displayName: 'Authentification multi-facteurs obligatoire',
            description: 'Rendre la MFA obligatoire pour tous les utilisateurs',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
          {
            fieldName: 'auditLogging',
            displayName: "Journalisation d'audit",
            description: 'Logs détaillés de toutes les actions',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
          {
            fieldName: 'dataEncryption',
            displayName: 'Chiffrement des données',
            description: 'Niveau de chiffrement des données',
            fieldType: FieldType.TEXT,
            isRequired: false,
            defaultValue: 'standard',
            validation: {
              helpText: 'Options: standard, enhanced, enterprise',
            },
          },
        ],
      },
      {
        name: 'priority-support',
        description: 'Support prioritaire 24/7',
        category: FeatureCategory.PREMIUM,
        isGlobal: true,
        status: FeatureStatus.ACTIVE,
        customFields: [
          {
            fieldName: 'dedicatedManager',
            displayName: 'Gestionnaire dédié',
            description: "Attribution d'un gestionnaire de compte dédié",
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
          {
            fieldName: 'phoneSupport',
            displayName: 'Support téléphonique',
            description: 'Accès au support par téléphone',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
          {
            fieldName: 'emergencyResponse',
            displayName: "Réponse d'urgence (minutes)",
            description: 'Temps de réponse pour les urgences',
            fieldType: FieldType.NUMBER,
            isRequired: false,
            defaultValue: '30',
            validation: {
              min: 5,
              max: 120,
            },
          },
        ],
      },

      // Add-on Features
      {
        name: 'advanced-integrations',
        description: 'Intégrations tierces avancées',
        category: FeatureCategory.ADDON,
        isGlobal: true,
        status: FeatureStatus.ACTIVE,
        customFields: [
          {
            fieldName: 'maxIntegrations',
            displayName: "Nombre maximum d'intégrations",
            description: "Limite du nombre d'intégrations actives",
            fieldType: FieldType.NUMBER,
            isRequired: true,
            defaultValue: '3',
            validation: {
              min: 1,
              max: 50,
            },
          },
          {
            fieldName: 'customIntegrations',
            displayName: 'Intégrations personnalisées',
            description: 'Autoriser les intégrations personnalisées',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
        ],
      },
      {
        name: 'mobile-app',
        description: 'Application mobile native',
        category: FeatureCategory.ADDON,
        isGlobal: true,
        status: FeatureStatus.COMING_SOON,
        customFields: [
          {
            fieldName: 'platforms',
            displayName: 'Plateformes supportées',
            description: 'Plateformes mobiles disponibles',
            fieldType: FieldType.TEXT,
            isRequired: false,
            defaultValue: 'ios,android',
          },
          {
            fieldName: 'offlineMode',
            displayName: 'Mode hors ligne',
            description: 'Fonctionnalités disponibles hors ligne',
            fieldType: FieldType.BOOLEAN,
            isRequired: false,
            defaultValue: 'false',
          },
        ],
      },
    ];

    // Create default features
    console.log('📋 Creating default features...');
    for (const featureData of defaultFeatures) {
      try {
        // Check if feature already exists
        const existing = await featureService.findOne({
          name: featureData.name,
          isGlobal: true,
        });

        if (!existing) {
          const feature = await featureService.create(featureData);
          console.log(`✅ Created feature: ${feature.name}`);
        } else {
          console.log(`⏭️  Feature already exists: ${featureData.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating feature ${featureData.name}:`, error.message);
      }
    }

    // Run migration to update existing plans
    console.log('🔄 Running migration for existing plans...');
    try {
      await migrationService.migratePlansToNewFeatureSystem();
      console.log('✅ Migration completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
    }

    console.log('🎉 Feature initialization completed!');
  } catch (error) {
    console.error('💥 Fatal error during initialization:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the script
if (require.main === module) {
  initializeFeatures()
    .then(() => {
      console.log('✨ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { initializeFeatures };
