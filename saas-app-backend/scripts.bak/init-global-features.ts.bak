import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FeatureService } from '../services/feature/feature.service';
import { FeatureCategory, FeatureRole } from '../data/models/feature/feature.pojo.model';
import {
  FieldDataType,
  FieldUnit,
} from '../data/models/featureCustomField/featureCustomField.pojo.model';

async function initializeGlobalFeatures() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const featureService = app.get(FeatureService);

  console.log('🚀 Initializing global features...');

  // Fonctionnalités de communication
  const emailFeature = await featureService.createFeature({
    name: 'email_messaging',
    displayName: 'Messagerie Email',
    description: 'Système de messagerie électronique',
    category: FeatureCategory.COMMUNICATION,
    roles: [FeatureRole.ALL],
    isGlobal: true,
    icon: 'email',
    sortOrder: 1,
  });

  await featureService.addCustomField(emailFeature._id.toString(), {
    fieldName: 'monthly_quota',
    displayName: 'Quota mensuel',
    description: "Nombre d'emails autorisés par mois",
    dataType: FieldDataType.NUMBER,
    unit: FieldUnit.EMAILS,
    defaultValue: 100,
    minValue: 0,
    isRequired: true,
    sortOrder: 1,
  });

  // Fonctionnalités de stockage
  const storageFeature = await featureService.createFeature({
    name: 'data_storage',
    displayName: 'Stockage de Données',
    description: 'Espace de stockage pour les données utilisateur',
    category: FeatureCategory.STORAGE,
    roles: [FeatureRole.ALL],
    isGlobal: true,
    icon: 'storage',
    sortOrder: 2,
  });

  await featureService.addCustomField(storageFeature._id.toString(), {
    fieldName: 'storage_quota',
    displayName: 'Quota de stockage',
    description: 'Espace de stockage autorisé',
    dataType: FieldDataType.NUMBER,
    unit: FieldUnit.GIGABYTES,
    defaultValue: 5,
    minValue: 0,
    isRequired: true,
    sortOrder: 1,
  });

  // Fonctionnalités API
  const apiFeature = await featureService.createFeature({
    name: 'api_access',
    displayName: 'Accès API',
    description: 'Accès aux interfaces de programmation',
    category: FeatureCategory.API,
    roles: [FeatureRole.DEVELOPER, FeatureRole.MANAGER, FeatureRole.SAAS_CUSTOMER_ADMIN],
    isGlobal: true,
    icon: 'api',
    sortOrder: 3,
  });

  await featureService.addCustomField(apiFeature._id.toString(), {
    fieldName: 'monthly_requests',
    displayName: 'Requêtes mensuelles',
    description: 'Nombre de requêtes API autorisées par mois',
    dataType: FieldDataType.NUMBER,
    unit: FieldUnit.API_CALLS,
    defaultValue: 1000,
    minValue: 0,
    isRequired: true,
    sortOrder: 1,
  });

  await featureService.addCustomField(apiFeature._id.toString(), {
    fieldName: 'api_level',
    displayName: "Niveau d'API",
    description: "Niveau d'accès aux fonctionnalités API",
    dataType: FieldDataType.ENUM,
    unit: FieldUnit.NONE,
    enumValues: ['basic', 'standard', 'premium', 'enterprise'],
    defaultValue: 'basic',
    isRequired: true,
    sortOrder: 2,
  });

  // Fonctionnalités utilisateurs
  const userMgmtFeature = await featureService.createFeature({
    name: 'user_management',
    displayName: 'Gestion des Utilisateurs',
    description: 'Système de gestion des utilisateurs et permissions',
    category: FeatureCategory.USER_MANAGEMENT,
    roles: [FeatureRole.MANAGER, FeatureRole.SAAS_CUSTOMER_ADMIN],
    isGlobal: true,
    icon: 'users',
    sortOrder: 4,
  });

  await featureService.addCustomField(userMgmtFeature._id.toString(), {
    fieldName: 'max_users',
    displayName: 'Utilisateurs maximum',
    description: "Nombre maximum d'utilisateurs autorisés",
    dataType: FieldDataType.NUMBER,
    unit: FieldUnit.USERS,
    defaultValue: 10,
    minValue: 1,
    isRequired: true,
    sortOrder: 1,
  });

  // Fonctionnalités analytics
  const analyticsFeature = await featureService.createFeature({
    name: 'advanced_analytics',
    displayName: 'Analytics Avancées',
    description: 'Analyses et rapports détaillés',
    category: FeatureCategory.ANALYTICS,
    roles: [FeatureRole.MANAGER, FeatureRole.SAAS_CUSTOMER_ADMIN],
    isGlobal: true,
    icon: 'analytics',
    sortOrder: 5,
  });

  await featureService.addCustomField(analyticsFeature._id.toString(), {
    fieldName: 'data_retention',
    displayName: 'Rétention des données',
    description: 'Durée de conservation des données analytiques',
    dataType: FieldDataType.NUMBER,
    unit: FieldUnit.MONTHS,
    defaultValue: 12,
    minValue: 1,
    isRequired: true,
    sortOrder: 1,
  });

  await featureService.addCustomField(analyticsFeature._id.toString(), {
    fieldName: 'custom_reports',
    displayName: 'Rapports personnalisés',
    description: 'Possibilité de créer des rapports personnalisés',
    dataType: FieldDataType.BOOLEAN,
    unit: FieldUnit.NONE,
    defaultValue: false,
    isRequired: true,
    sortOrder: 2,
  });

  // Fonctionnalités support
  const supportFeature = await featureService.createFeature({
    name: 'customer_support',
    displayName: 'Support Client',
    description: 'Niveaux de support et assistance',
    category: FeatureCategory.SUPPORT,
    roles: [FeatureRole.ALL],
    isGlobal: true,
    icon: 'support',
    sortOrder: 6,
  });

  await featureService.addCustomField(supportFeature._id.toString(), {
    fieldName: 'support_level',
    displayName: 'Niveau de support',
    description: 'Type de support disponible',
    dataType: FieldDataType.ENUM,
    unit: FieldUnit.NONE,
    enumValues: ['email', 'priority', '24x7', 'dedicated'],
    defaultValue: 'email',
    isRequired: true,
    sortOrder: 1,
  });

  await featureService.addCustomField(supportFeature._id.toString(), {
    fieldName: 'response_time',
    displayName: 'Temps de réponse',
    description: 'Temps de réponse garanti (en heures)',
    dataType: FieldDataType.NUMBER,
    unit: FieldUnit.HOURS,
    defaultValue: 48,
    minValue: 1,
    isRequired: true,
    sortOrder: 2,
  });

  // Fonctionnalités sécurité
  const securityFeature = await featureService.createFeature({
    name: 'security_features',
    displayName: 'Fonctionnalités de Sécurité',
    description: 'Options de sécurité avancées',
    category: FeatureCategory.SECURITY,
    roles: [FeatureRole.SAAS_CUSTOMER_ADMIN, FeatureRole.MANAGER],
    isGlobal: true,
    icon: 'security',
    sortOrder: 7,
  });

  await featureService.addCustomField(securityFeature._id.toString(), {
    fieldName: 'sso_enabled',
    displayName: 'SSO activé',
    description: 'Single Sign-On disponible',
    dataType: FieldDataType.BOOLEAN,
    unit: FieldUnit.NONE,
    defaultValue: false,
    isRequired: true,
    sortOrder: 1,
  });

  await featureService.addCustomField(securityFeature._id.toString(), {
    fieldName: 'audit_logs',
    displayName: "Logs d'audit",
    description: 'Journalisation des activités',
    dataType: FieldDataType.BOOLEAN,
    unit: FieldUnit.NONE,
    defaultValue: false,
    isRequired: true,
    sortOrder: 2,
  });

  // Fonctionnalités intégration
  const integrationFeature = await featureService.createFeature({
    name: 'third_party_integrations',
    displayName: 'Intégrations Tierces',
    description: 'Connexions avec des services externes',
    category: FeatureCategory.INTEGRATION,
    roles: [FeatureRole.DEVELOPER, FeatureRole.MANAGER, FeatureRole.SAAS_CUSTOMER_ADMIN],
    isGlobal: true,
    icon: 'integrations',
    sortOrder: 8,
  });

  await featureService.addCustomField(integrationFeature._id.toString(), {
    fieldName: 'max_integrations',
    displayName: 'Intégrations maximum',
    description: "Nombre maximum d'intégrations autorisées",
    dataType: FieldDataType.NUMBER,
    unit: FieldUnit.COUNT,
    defaultValue: 5,
    minValue: 0,
    isRequired: true,
    sortOrder: 1,
  });

  console.log('✅ Global features initialized successfully!');

  await app.close();
}

// Exécuter le script si appelé directement
if (require.main === module) {
  initializeGlobalFeatures()
    .then(() => {
      console.log('✅ Feature initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Feature initialization failed:', error);
      process.exit(1);
    });
}

export { initializeGlobalFeatures };
