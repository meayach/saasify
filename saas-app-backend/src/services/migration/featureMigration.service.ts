import { Injectable } from '@nestjs/common';
import { FeatureService } from '../../services/feature/feature.service';
import { PlanFeatureService } from '../../services/planFeature/planFeature.service';
import { SaasFeatureValueRepository } from '../../data/saasFeatureValue/repository/saasFeatureValue.repository';
import { FeatureCategory, FeatureRole } from '../../data/models/feature/feature.pojo.model';
import {
  FieldDataType,
  FieldUnit,
} from '../../data/models/featureCustomField/featureCustomField.pojo.model';
import { FeatureStatus } from '../../data/models/featurePlanConfiguration/featurePlanConfiguration.pojo.model';
import { FeatureType } from '../../data/models/saasFeatureValue/saasFeatureValue.pojo.model';

@Injectable()
export class FeatureMigrationService {
  constructor(
    private readonly featureService: FeatureService,
    private readonly planFeatureService: PlanFeatureService,
    private readonly saasFeatureValueRepository: SaasFeatureValueRepository,
  ) {}

  /**
   * Migre les anciennes SaasFeatureValue vers le nouveau modèle de fonctionnalités
   */
  async migrateOldFeatureValues(applicationId: string): Promise<void> {
    console.log(`🔄 Starting migration for application: ${applicationId}`);

    // Récupérer toutes les anciennes valeurs de fonctionnalités
    const oldFeatureValues = await this.saasFeatureValueRepository.findAll({
      saasApplication: applicationId,
      isActive: true,
    });

    if (oldFeatureValues.length === 0) {
      console.log('ℹ️ No old feature values found to migrate');
      return;
    }

    // Grouper par nom de fonctionnalité
    const featureGroups = oldFeatureValues.reduce((groups, fv) => {
      if (!groups[fv.featureName]) {
        groups[fv.featureName] = [];
      }
      groups[fv.featureName].push(fv);
      return groups;
    }, {} as Record<string, typeof oldFeatureValues>);

    // Créer les nouvelles fonctionnalités si elles n'existent pas
    for (const [featureName, values] of Object.entries(featureGroups)) {
      await this.migrateFeature(applicationId, featureName, values);
    }

    console.log('✅ Migration completed successfully');
  }

  private async migrateFeature(
    applicationId: string,
    featureName: string,
    oldValues: any[],
  ): Promise<void> {
    // Essayer de trouver une fonctionnalité existante
    let feature = await this.featureService
      .getAllFeatures({
        applicationId,
      })
      .then(
        (features) =>
          features.find(
            (f) =>
              f.feature.name.toLowerCase() === featureName.toLowerCase() ||
              f.feature.displayName.toLowerCase() === featureName.toLowerCase(),
          )?.feature,
      );

    // Si la fonctionnalité n'existe pas, la créer
    if (!feature) {
      const category = this.inferFeatureCategory(featureName);
      const roles = this.inferFeatureRoles(featureName);

      feature = await this.featureService.createFeature({
        name: this.normalizeFeatureName(featureName),
        displayName: featureName,
        description: `Migrated from legacy feature: ${featureName}`,
        category,
        roles,
        applicationId,
        isGlobal: false,
        sortOrder: 0,
      });

      console.log(`✅ Created feature: ${feature.name}`);
    }

    // Créer le champ personnalisé principal si nécessaire
    const sampleValue = oldValues[0];
    const fieldName = this.inferFieldName(sampleValue);
    const dataType = this.inferDataType(sampleValue);
    const unit = this.inferUnit(sampleValue);

    let customField = (
      await this.featureService.getFeatureWithFields(feature._id.toString())
    ).customFields.find((cf) => cf.fieldName === fieldName);

    if (!customField) {
      customField = await this.featureService.addCustomField(feature._id.toString(), {
        fieldName,
        displayName: this.getDisplayName(sampleValue),
        description: sampleValue.description || 'Migrated from legacy system',
        dataType,
        unit,
        defaultValue: sampleValue.value,
        isRequired: true,
        sortOrder: 1,
      });

      console.log(`✅ Created custom field: ${customField.fieldName} for feature: ${feature.name}`);
    }

    // Migrer les configurations pour chaque plan
    for (const oldValue of oldValues) {
      await this.migratePlanConfiguration(
        applicationId,
        oldValue.saasPlan.toString(),
        feature._id.toString(),
        customField._id.toString(),
        oldValue,
      );
    }
  }

  private async migratePlanConfiguration(
    applicationId: string,
    planId: string,
    featureId: string,
    customFieldId: string,
    oldValue: any,
  ): Promise<void> {
    const status = this.inferFeatureStatus(oldValue);
    const isUnlimited = oldValue.value === -1;

    try {
      await this.planFeatureService.addFeatureToPlan(planId, featureId, applicationId, {
        status,
        customDisplayName: oldValue.displayValue || oldValue.featureName,
        sortOrder: oldValue.sortOrder || 0,
        fieldValues: [
          {
            customFieldId,
            fieldValue: oldValue.value,
            displayValue: oldValue.displayValue || this.generateDisplayValue(oldValue),
            isUnlimited,
          },
        ],
      });

      console.log(`✅ Migrated plan configuration for plan: ${planId}, feature: ${featureId}`);
    } catch (error) {
      console.error(`❌ Failed to migrate plan configuration:`, error);
    }
  }

  private inferFeatureCategory(featureName: string): FeatureCategory {
    const name = featureName.toLowerCase();

    if (name.includes('email') || name.includes('sms') || name.includes('notification')) {
      return FeatureCategory.COMMUNICATION;
    }
    if (name.includes('storage') || name.includes('disk') || name.includes('space')) {
      return FeatureCategory.STORAGE;
    }
    if (name.includes('api') || name.includes('endpoint')) {
      return FeatureCategory.API;
    }
    if (name.includes('user') || name.includes('member') || name.includes('account')) {
      return FeatureCategory.USER_MANAGEMENT;
    }
    if (name.includes('analytic') || name.includes('report') || name.includes('dashboard')) {
      return FeatureCategory.ANALYTICS;
    }
    if (name.includes('support') || name.includes('help')) {
      return FeatureCategory.SUPPORT;
    }
    if (name.includes('security') || name.includes('auth') || name.includes('sso')) {
      return FeatureCategory.SECURITY;
    }
    if (name.includes('integration') || name.includes('connect')) {
      return FeatureCategory.INTEGRATION;
    }

    return FeatureCategory.OTHER;
  }

  private inferFeatureRoles(featureName: string): FeatureRole[] {
    const name = featureName.toLowerCase();

    if (name.includes('admin') || name.includes('management')) {
      return [FeatureRole.SAAS_CUSTOMER_ADMIN, FeatureRole.MANAGER];
    }
    if (name.includes('api') || name.includes('developer')) {
      return [FeatureRole.DEVELOPER, FeatureRole.MANAGER, FeatureRole.SAAS_CUSTOMER_ADMIN];
    }

    return [FeatureRole.ALL];
  }

  private normalizeFeatureName(featureName: string): string {
    return featureName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }

  private inferFieldName(oldValue: any): string {
    const type = oldValue.featureType;

    switch (type) {
      case FeatureType.LIMIT:
        return 'monthly_limit';
      case FeatureType.QUOTA:
        return 'storage_quota';
      case FeatureType.BOOLEAN:
        return 'is_enabled';
      case FeatureType.ACCESS:
        return 'access_level';
      default:
        return 'value';
    }
  }

  private inferDataType(oldValue: any): FieldDataType {
    const type = oldValue.featureType;

    switch (type) {
      case FeatureType.BOOLEAN:
        return FieldDataType.BOOLEAN;
      case FeatureType.ACCESS:
        return FieldDataType.ENUM;
      default:
        return FieldDataType.NUMBER;
    }
  }

  private inferUnit(oldValue: any): FieldUnit {
    const unit = oldValue.unit;

    // Mapper les anciennes unités vers les nouvelles
    switch (unit) {
      case 'emails':
        return FieldUnit.EMAILS;
      case 'gb':
        return FieldUnit.GIGABYTES;
      case 'users':
        return FieldUnit.USERS;
      case 'requests':
        return FieldUnit.REQUESTS;
      case 'count':
        return FieldUnit.COUNT;
      case 'percentage':
        return FieldUnit.PERCENTAGE;
      default:
        return FieldUnit.NONE;
    }
  }

  private getDisplayName(oldValue: any): string {
    const type = oldValue.featureType;
    const unit = oldValue.unit;

    if (type === FeatureType.LIMIT && unit === 'emails') {
      return 'Emails par mois';
    }
    if (type === FeatureType.QUOTA && unit === 'gb') {
      return 'Espace de stockage (GB)';
    }
    if (type === FeatureType.LIMIT && unit === 'users') {
      return "Nombre d'utilisateurs";
    }

    return `${oldValue.featureName} (${unit || 'valeur'})`;
  }

  private inferFeatureStatus(oldValue: any): FeatureStatus {
    if (oldValue.value === -1) {
      return FeatureStatus.UNLIMITED;
    }
    if (oldValue.value === 0) {
      return FeatureStatus.DISABLED;
    }
    if (oldValue.featureType === FeatureType.BOOLEAN) {
      return oldValue.value ? FeatureStatus.ENABLED : FeatureStatus.DISABLED;
    }

    return FeatureStatus.LIMITED;
  }

  private generateDisplayValue(oldValue: any): string {
    if (oldValue.displayValue) {
      return oldValue.displayValue;
    }

    if (oldValue.value === -1) {
      return 'Illimité';
    }

    if (oldValue.value === 0) {
      return 'Désactivé';
    }

    const unit = oldValue.unit;

    switch (unit) {
      case 'emails':
        return `${oldValue.value} emails/mois`;
      case 'gb':
        return `${oldValue.value} GB`;
      case 'users':
        return `${oldValue.value} utilisateurs`;
      default:
        return `${oldValue.value}`;
    }
  }

  /**
   * Nettoie les anciennes données après migration réussie
   */
  async cleanupOldFeatureValues(applicationId: string): Promise<void> {
    console.log(`🧹 Cleaning up old feature values for application: ${applicationId}`);

    const oldValues = await this.saasFeatureValueRepository.findAll({
      saasApplication: applicationId,
      isActive: true,
    });

    for (const oldValue of oldValues) {
      await this.saasFeatureValueRepository.update(oldValue._id, { isActive: false });
    }

    console.log(`✅ Deactivated ${oldValues.length} old feature values`);
  }
}
