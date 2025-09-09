/**
 * Script d'initialisation des valeurs de fonctionnalités par défaut
 * Implémente le système de fonctionnalités configurables pour les applications SaaS
 * comme demandé: Free: 10 emails, Premium: 200 emails, Enterprise: unlimited
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SaasFeatureValueService } from '../services/featureValue/saas-feature-value.service';
import { CreateSaasFeatureValueDto } from '../services/dto/saas-feature-value.dto';
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
    const emailFeatures: CreateSaasFeatureValueDto[] = [
      {
        saasApplicationId: sampleApplicationId,
        featureName: 'Emails par mois',
        description: "Nombre d'emails pouvant être envoyés par mois",
        featureType: FeatureType.LIMIT,
        unit: FeatureUnit.EMAILS,
        value: 10,
        saasPlanId: planIds.free,
        isActive: true,
        sortOrder: 1,
      },
      {
        saasApplicationId: sampleApplicationId,
        featureName: 'Emails par mois',
        description: "Nombre d'emails pouvant être envoyés par mois",
        featureType: FeatureType.LIMIT,
        unit: FeatureUnit.EMAILS,
        value: 200,
        saasPlanId: planIds.premium,
        isActive: true,
        sortOrder: 1,
      },
      {
        saasApplicationId: sampleApplicationId,
        featureName: 'Emails par mois',
        description: "Nombre d'emails pouvant être envoyés par mois",
        featureType: FeatureType.LIMIT,
        unit: FeatureUnit.UNLIMITED,
        value: -1, // Valeur conventionnelle pour illimité
        saasPlanId: planIds.enterprise,
        isActive: true,
        sortOrder: 1,
      },
    ];

    // 2. Configuration de l'espace de stockage
    const storageFeatures: CreateSaasFeatureValueDto[] = [
      {
        saasApplicationId: sampleApplicationId,
        featureName: 'Espace de stockage',
        description: 'Espace de stockage disponible',
        featureType: FeatureType.QUOTA,
        unit: FeatureUnit.GIGABYTES,
        value: 1, // 1 GB pour le plan gratuit
        saasPlanId: planIds.free,
        isActive: true,
        sortOrder: 2,
      },
      {
        saasApplicationId: sampleApplicationId,
        featureName: 'Espace de stockage',
        description: 'Espace de stockage disponible',
        featureType: FeatureType.QUOTA,
        unit: FeatureUnit.GIGABYTES,
        value: 50, // 50 GB pour le plan premium
        saasPlanId: planIds.premium,
        isActive: true,
        sortOrder: 2,
      },
      {
        saasApplicationId: sampleApplicationId,
        featureName: 'Espace de stockage',
        description: 'Espace de stockage disponible',
        featureType: FeatureType.QUOTA,
        unit: FeatureUnit.UNLIMITED,
        value: -1, // Illimité pour l'entreprise
        saasPlanId: planIds.enterprise,
        isActive: true,
        sortOrder: 2,
      },
    ];

    // 3. Configuration du nombre d'utilisateurs
    const userFeatures: CreateSaasFeatureValueDto[] = [
      {
        saasApplicationId: sampleApplicationId,
        featureName: 'Utilisateurs',
        description: "Nombre d'utilisateurs pouvant accéder à l'application",
        featureType: FeatureType.LIMIT,
        unit: FeatureUnit.USERS,
        value: 1, // 1 utilisateur pour le plan gratuit
        saasPlanId: planIds.free,
        isActive: true,
        sortOrder: 3,
      },
      {
        saasApplicationId: sampleApplicationId,
        featureName: 'Utilisateurs',
        description: "Nombre d'utilisateurs pouvant accéder à l'application",
        featureType: FeatureType.LIMIT,
        unit: FeatureUnit.USERS,
        value: 10, // 10 utilisateurs pour le plan premium
        saasPlanId: planIds.premium,
        isActive: true,
        sortOrder: 3,
      },
      {
        saasApplicationId: sampleApplicationId,
        featureName: 'Utilisateurs',
        description: "Nombre d'utilisateurs pouvant accéder à l'application",
        featureType: FeatureType.LIMIT,
        unit: FeatureUnit.UNLIMITED,
        value: -1, // Utilisateurs illimités pour l'entreprise
        saasPlanId: planIds.enterprise,
        isActive: true,
        sortOrder: 3,
      },
    ];

    // Création en lot
    console.log("📧 Création des fonctionnalités d'emails...");
    const emailResults = await Promise.all(
      emailFeatures.map((feature) => featureValueService.createFeatureValue(feature)),
    );
    console.log(`✅ ${emailResults.length} fonctionnalités d'emails créées`);

    console.log('💾 Création des fonctionnalités de stockage...');
    const storageResults = await Promise.all(
      storageFeatures.map((feature) => featureValueService.createFeatureValue(feature)),
    );
    console.log(`✅ ${storageResults.length} fonctionnalités de stockage créées`);

    console.log("👥 Création des fonctionnalités d'utilisateurs...");
    const userResults = await Promise.all(
      userFeatures.map((feature) => featureValueService.createFeatureValue(feature)),
    );
    console.log(`✅ ${userResults.length} fonctionnalités d'utilisateurs créées`);

    // Affichage du résumé
    const totalFeatures = emailResults.length + storageResults.length + userResults.length;
    console.log(`\n🎉 Initialisation terminée ! ${totalFeatures} fonctionnalités créées au total`);

    console.log('\n📋 Résumé des configurations par plan:');
    console.log('FREE PLAN:');
    console.log('  - 10 emails par mois');
    console.log('  - 1 GB de stockage');
    console.log('  - 1 utilisateur');

    console.log('\nPREMIUM PLAN:');
    console.log('  - 200 emails par mois');
    console.log('  - 50 GB de stockage');
    console.log('  - 10 utilisateurs');

    console.log('\nENTERPRISE PLAN:');
    console.log('  - Emails illimités');
    console.log('  - Stockage illimité');
    console.log('  - Utilisateurs illimités');

    console.log('\n💡 Pour utiliser ce script avec de vraies données:');
    console.log("1. Remplacer sampleApplicationId par un vrai ID d'application");
    console.log('2. Remplacer les planIds par les vrais IDs de vos plans');
    console.log('3. Ajuster les valeurs selon vos besoins métier');
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
