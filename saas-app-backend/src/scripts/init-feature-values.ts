/**
 * Script d'initialisation des valeurs de fonctionnalités par défaut
 * Implémente le système de fonctionnalités configurables pour les applications SaaS
 * comme demandé: Free: 10 emails, Premium: 200 emails, Enterprise: unlimited
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SaasFeatureValueService } from '../services/featureValue/saas-feature-value.service';
import { BulkCreateFeatureValuesDto } from '../services/dto/saas-feature-value.dto';
import {
  FeatureType,
  FeatureUnit,
} from '../data/models/saasFeatureValue/saasFeatureValue.pojo.model';

async function initializeFeatureValues() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const featureValueService = app.get(SaasFeatureValueService);

  console.log('🚀 Initialisation des valeurs de fonctionnalités par défaut...');

  // Configuration exemple pour une application SaaS fictive
  // ID d'application et plans fictifs - à remplacer par de vraies valeurs de votre DB
  const sampleApplicationId = '60d5f2c4e1a2c1b1f8d6e4f7'; // Remplacer par un vrai ID
  const planIds = {
    free: '60d5f2c4e1a2c1b1f8d6e4f8', // Plan gratuit
    premium: '60d5f2c4e1a2c1b1f8d6e4f9', // Plan premium
    enterprise: '60d5f2c4e1a2c1b1f8d6e4fa', // Plan entreprise
  };

  try {
    // 1. Configuration des emails par mois selon votre spécification
    const emailFeatures: BulkCreateFeatureValuesDto = {
      featureValues: [
        {
          featureName: 'Emails par mois',
          description: "Nombre d'emails pouvant être envoyés par mois",
          featureType: FeatureType.LIMIT,
          unit: FeatureUnit.EMAILS,
          value: 10,
          saasPlanId: planIds.free,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 1,
        },
        {
          featureName: 'Emails par mois',
          description: "Nombre d'emails pouvant être envoyés par mois",
          featureType: FeatureType.LIMIT,
          unit: FeatureUnit.EMAILS,
          value: 200,
          saasPlanId: planIds.premium,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 1,
        },
        {
          featureName: 'Emails par mois',
          description: "Nombre d'emails pouvant être envoyés par mois",
          featureType: FeatureType.LIMIT,
          unit: FeatureUnit.UNLIMITED,
          value: -1, // Valeur conventionnelle pour illimité
          saasPlanId: planIds.enterprise,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 1,
        },
      ],
    };

    // 2. Configuration de l'espace de stockage
    const storageFeatures: BulkCreateFeatureValuesDto = {
      featureValues: [
        {
          featureName: 'Espace de stockage',
          description: 'Espace de stockage disponible',
          featureType: FeatureType.QUOTA,
          unit: FeatureUnit.GIGABYTES,
          value: 1, // 1 GB pour le plan gratuit
          saasPlanId: planIds.free,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 2,
        },
        {
          featureName: 'Espace de stockage',
          description: 'Espace de stockage disponible',
          featureType: FeatureType.QUOTA,
          unit: FeatureUnit.GIGABYTES,
          value: 50, // 50 GB pour le plan premium
          saasPlanId: planIds.premium,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 2,
        },
        {
          featureName: 'Espace de stockage',
          description: 'Espace de stockage disponible',
          featureType: FeatureType.QUOTA,
          unit: FeatureUnit.UNLIMITED,
          value: -1, // Illimité pour l'entreprise
          saasPlanId: planIds.enterprise,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 2,
        },
      ],
    };

    // 3. Configuration du nombre d'utilisateurs
    const userFeatures: BulkCreateFeatureValuesDto = {
      featureValues: [
        {
          featureName: 'Utilisateurs',
          description: "Nombre d'utilisateurs pouvant accéder à l'application",
          featureType: FeatureType.LIMIT,
          unit: FeatureUnit.USERS,
          value: 1, // 1 utilisateur pour le plan gratuit
          saasPlanId: planIds.free,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 3,
        },
        {
          featureName: 'Utilisateurs',
          description: "Nombre d'utilisateurs pouvant accéder à l'application",
          featureType: FeatureType.LIMIT,
          unit: FeatureUnit.USERS,
          value: 10, // 10 utilisateurs pour le plan premium
          saasPlanId: planIds.premium,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 3,
        },
        {
          featureName: 'Utilisateurs',
          description: "Nombre d'utilisateurs pouvant accéder à l'application",
          featureType: FeatureType.LIMIT,
          unit: FeatureUnit.UNLIMITED,
          value: -1, // Utilisateurs illimités pour l'entreprise
          saasPlanId: planIds.enterprise,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 3,
        },
      ],
    };

    // 4. Configuration des fonctionnalités d'accès (Boolean)
    const accessFeatures: BulkCreateFeatureValuesDto = {
      featureValues: [
        {
          featureName: 'Support prioritaire',
          description: 'Accès au support prioritaire',
          featureType: FeatureType.BOOLEAN,
          unit: FeatureUnit.COUNT,
          value: 0, // Désactivé pour le plan gratuit
          saasPlanId: planIds.free,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 4,
        },
        {
          featureName: 'Support prioritaire',
          description: 'Accès au support prioritaire',
          featureType: FeatureType.BOOLEAN,
          unit: FeatureUnit.COUNT,
          value: 1, // Activé pour le plan premium
          saasPlanId: planIds.premium,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 4,
        },
        {
          featureName: 'Support prioritaire',
          description: 'Accès au support prioritaire',
          featureType: FeatureType.BOOLEAN,
          unit: FeatureUnit.COUNT,
          value: 1, // Activé pour l'entreprise
          saasPlanId: planIds.enterprise,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 4,
        },
        {
          featureName: 'API Access',
          description: "Accès à l'API avancée",
          featureType: FeatureType.BOOLEAN,
          unit: FeatureUnit.COUNT,
          value: 0, // Désactivé pour le plan gratuit
          saasPlanId: planIds.free,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 5,
        },
        {
          featureName: 'API Access',
          description: "Accès à l'API avancée",
          featureType: FeatureType.BOOLEAN,
          unit: FeatureUnit.COUNT,
          value: 0, // Désactivé pour le plan premium
          saasPlanId: planIds.premium,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 5,
        },
        {
          featureName: 'API Access',
          description: "Accès à l'API avancée",
          featureType: FeatureType.BOOLEAN,
          unit: FeatureUnit.COUNT,
          value: 1, // Activé uniquement pour l'entreprise
          saasPlanId: planIds.enterprise,
          saasApplicationId: sampleApplicationId,
          isActive: true,
          sortOrder: 5,
        },
      ],
    };

    // Initialisation en lot
    console.log("📧 Création des fonctionnalités d'emails...");
    const emailResults = await featureValueService.bulkCreateFeatureValues(emailFeatures);
    console.log(`✅ ${emailResults.length} fonctionnalités d'emails créées`);

    console.log('💾 Création des fonctionnalités de stockage...');
    const storageResults = await featureValueService.bulkCreateFeatureValues(storageFeatures);
    console.log(`✅ ${storageResults.length} fonctionnalités de stockage créées`);

    console.log("👥 Création des fonctionnalités d'utilisateurs...");
    const userResults = await featureValueService.bulkCreateFeatureValues(userFeatures);
    console.log(`✅ ${userResults.length} fonctionnalités d'utilisateurs créées`);

    console.log("🔒 Création des fonctionnalités d'accès...");
    const accessResults = await featureValueService.bulkCreateFeatureValues(accessFeatures);
    console.log(`✅ ${accessResults.length} fonctionnalités d'accès créées`);

    // Affichage du résumé
    const totalFeatures =
      emailResults.length + storageResults.length + userResults.length + accessResults.length;
    console.log(`\n🎉 Initialisation terminée ! ${totalFeatures} fonctionnalités créées au total`);

    console.log('\n📋 Résumé des configurations par plan:');
    console.log('FREE PLAN:');
    console.log('  - 10 emails par mois');
    console.log('  - 1 GB de stockage');
    console.log('  - 1 utilisateur');
    console.log('  - Support standard');
    console.log("  - Pas d'accès API");

    console.log('\nPREMIUM PLAN:');
    console.log('  - 200 emails par mois');
    console.log('  - 50 GB de stockage');
    console.log('  - 10 utilisateurs');
    console.log('  - Support prioritaire');
    console.log("  - Pas d'accès API");

    console.log('\nENTERPRISE PLAN:');
    console.log('  - Emails illimités');
    console.log('  - Stockage illimité');
    console.log('  - Utilisateurs illimités');
    console.log('  - Support prioritaire');
    console.log('  - Accès API complet');
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
  } finally {
    await app.close();
  }
}

// Exécution du script
if (require.main === module) {
  initializeFeatureValues()
    .then(() => {
      console.log("\n✨ Script d'initialisation terminé avec succès");
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export default initializeFeatureValues;
