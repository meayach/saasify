import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { FeaturePlanConfigurationRepository } from '../../data/featurePlanConfiguration/repository/featurePlanConfiguration.repository';
import { FeatureCustomFieldValueRepository } from '../../data/featureCustomFieldValue/repository/featureCustomFieldValue.repository';
import { FeatureRepository } from '../../data/feature/repository/feature.repository';
import { FeatureCustomFieldRepository } from '../../data/featureCustomField/repository/featureCustomField.repository';
import {
  FeaturePlanConfigurationPOJO,
  FeatureStatus,
} from '../../data/models/featurePlanConfiguration/featurePlanConfiguration.pojo.model';
import { FeatureCustomFieldValuePOJO } from '../../data/models/featureCustomFieldValue/featureCustomFieldValue.pojo.model';
import { FeaturePOJO } from '../../data/models/feature/feature.pojo.model';
import { FeatureCustomFieldPOJO } from '../../data/models/featureCustomField/featureCustomField.pojo.model';

export interface PlanFeatureConfigDto {
  featureId: string;
  status: FeatureStatus;
  customDisplayName?: string;
  customDescription?: string;
  isHighlighted?: boolean;
  highlightText?: string;
  sortOrder?: number;
  fieldValues: Array<{
    customFieldId: string;
    fieldValue: any;
    isUnlimited?: boolean;
    displayValue?: string;
  }>;
}

export interface PlanFeatureResponseDto {
  configuration: FeaturePlanConfigurationPOJO;
  feature: FeaturePOJO;
  customFields: FeatureCustomFieldPOJO[];
  fieldValues: FeatureCustomFieldValuePOJO[];
}

export interface PlanFeaturesDto {
  planId: string;
  applicationId: string;
  features: PlanFeatureResponseDto[];
}

@Injectable()
export class PlanFeatureService {
  constructor(
    private readonly configurationRepository: FeaturePlanConfigurationRepository,
    private readonly fieldValueRepository: FeatureCustomFieldValueRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly customFieldRepository: FeatureCustomFieldRepository,
  ) {}

  async configurePlanFeatures(
    planId: string,
    applicationId: string,
    features: PlanFeatureConfigDto[],
  ): Promise<PlanFeaturesDto> {
    // Vérifier que toutes les features appartiennent à l'application ou sont globales
    const featureIds = features.map((f) => f.featureId);
    const existingFeatures = await Promise.all(
      featureIds.map((id) => this.featureRepository.findById(id)),
    );

    for (const feature of existingFeatures) {
      if (!feature) {
        throw new NotFoundException('One or more features not found');
      }

      if (!feature.isGlobal && feature.applicationId?.toString() !== applicationId) {
        throw new BadRequestException(
          `Feature '${feature.name}' does not belong to this application`,
        );
      }
    }

    // Créer/Mettre à jour les configurations
    const configurations: Partial<FeaturePlanConfigurationPOJO>[] = features.map((feature) => ({
      planId: planId as any,
      featureId: feature.featureId as any,
      status: feature.status,
      customDisplayName: feature.customDisplayName || '',
      customDescription: feature.customDescription || '',
      isHighlighted: feature.isHighlighted || false,
      highlightText: feature.highlightText || '',
      sortOrder: feature.sortOrder || 0,
      applicationId: applicationId as any,
      isActive: true,
    }));

    const savedConfigurations = await this.configurationRepository.bulkCreateOrUpdate(
      configurations,
    );

    // Créer/Mettre à jour les valeurs des champs personnalisés
    const allFieldValues: Partial<FeatureCustomFieldValuePOJO>[] = [];

    for (const feature of features) {
      const config = savedConfigurations.find((c) => c.featureId.toString() === feature.featureId);

      if (config && feature.fieldValues) {
        for (const fieldValue of feature.fieldValues) {
          allFieldValues.push({
            featurePlanConfigurationId: config._id as any,
            customFieldId: fieldValue.customFieldId as any,
            fieldValue: fieldValue.fieldValue,
            displayValue: fieldValue.displayValue || '',
            isUnlimited: fieldValue.isUnlimited || fieldValue.fieldValue === -1,
            applicationId: applicationId as any,
            planId: planId as any,
            featureId: feature.featureId as any,
            isActive: true,
          });
        }
      }
    }

    if (allFieldValues.length > 0) {
      await this.fieldValueRepository.bulkCreateOrUpdate(allFieldValues);
    }

    return this.getPlanFeatures(planId, applicationId);
  }

  async getPlanFeatures(planId: string, applicationId: string): Promise<PlanFeaturesDto> {
    const configurations = await this.configurationRepository.findPlanFeatures(
      planId,
      applicationId,
    );

    const features: PlanFeatureResponseDto[] = await Promise.all(
      configurations.map(async (config) => {
        const feature = await this.featureRepository.findById(config.featureId.toString());
        const customFields = await this.customFieldRepository.findByFeature(
          config.featureId.toString(),
        );
        const fieldValues = await this.fieldValueRepository.findByConfiguration(config._id);

        return {
          configuration: config,
          feature: feature!,
          customFields,
          fieldValues,
        };
      }),
    );

    return {
      planId,
      applicationId,
      features: features.sort((a, b) => a.configuration.sortOrder - b.configuration.sortOrder),
    };
  }

  async addFeatureToPlan(
    planId: string,
    featureId: string,
    applicationId: string,
    configDto: Omit<PlanFeatureConfigDto, 'featureId'>,
  ): Promise<PlanFeatureResponseDto> {
    // Vérifier que la feature existe et appartient à l'application
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    if (!feature.isGlobal && feature.applicationId?.toString() !== applicationId) {
      throw new BadRequestException('Feature does not belong to this application');
    }

    // Vérifier si la configuration existe déjà
    const existingConfig = await this.configurationRepository.findByPlanAndFeature(
      planId,
      featureId,
    );

    let configuration: FeaturePlanConfigurationPOJO;

    if (existingConfig) {
      // Mettre à jour la configuration existante
      configuration = (await this.configurationRepository.update(existingConfig._id, {
        status: configDto.status,
        customDisplayName: configDto.customDisplayName || '',
        customDescription: configDto.customDescription || '',
        isHighlighted: configDto.isHighlighted || false,
        highlightText: configDto.highlightText || '',
        sortOrder: configDto.sortOrder || 0,
        isActive: true,
      }))!;
    } else {
      // Créer une nouvelle configuration
      configuration = await this.configurationRepository.create({
        planId: planId as any,
        featureId: featureId as any,
        status: configDto.status,
        customDisplayName: configDto.customDisplayName || '',
        customDescription: configDto.customDescription || '',
        isHighlighted: configDto.isHighlighted || false,
        highlightText: configDto.highlightText || '',
        sortOrder: configDto.sortOrder || 0,
        applicationId: applicationId as any,
        isActive: true,
      });
    }

    // Gérer les valeurs des champs personnalisés
    if (configDto.fieldValues && configDto.fieldValues.length > 0) {
      const fieldValues: Partial<FeatureCustomFieldValuePOJO>[] = configDto.fieldValues.map(
        (fv) => ({
          featurePlanConfigurationId: configuration._id as any,
          customFieldId: fv.customFieldId as any,
          fieldValue: fv.fieldValue,
          displayValue: fv.displayValue || '',
          isUnlimited: fv.isUnlimited || fv.fieldValue === -1,
          applicationId: applicationId as any,
          planId: planId as any,
          featureId: featureId as any,
          isActive: true,
        }),
      );

      await this.fieldValueRepository.bulkCreateOrUpdate(fieldValues);
    }

    // Retourner la configuration complète
    const customFields = await this.customFieldRepository.findByFeature(featureId);
    const savedFieldValues = await this.fieldValueRepository.findByConfiguration(configuration._id);

    return {
      configuration,
      feature,
      customFields,
      fieldValues: savedFieldValues,
    };
  }

  async removeFeatureFromPlan(
    planId: string,
    featureId: string,
    applicationId: string,
  ): Promise<boolean> {
    const configuration = await this.configurationRepository.findByPlanAndFeature(
      planId,
      featureId,
    );

    if (!configuration) {
      throw new NotFoundException('Feature configuration not found for this plan');
    }

    if (configuration.applicationId.toString() !== applicationId) {
      throw new BadRequestException('Feature configuration does not belong to this application');
    }

    // Supprimer les valeurs des champs personnalisés
    const fieldValues = await this.fieldValueRepository.findByConfiguration(configuration._id);
    await Promise.all(fieldValues.map((fv) => this.fieldValueRepository.delete(fv._id)));

    // Supprimer la configuration
    return this.configurationRepository.delete(configuration._id);
  }

  async updateFeatureConfiguration(
    planId: string,
    featureId: string,
    applicationId: string,
    updateData: Partial<Omit<PlanFeatureConfigDto, 'featureId'>>,
  ): Promise<PlanFeatureResponseDto> {
    const configuration = await this.configurationRepository.findByPlanAndFeature(
      planId,
      featureId,
    );

    if (!configuration) {
      throw new NotFoundException('Feature configuration not found for this plan');
    }

    if (configuration.applicationId.toString() !== applicationId) {
      throw new BadRequestException('Feature configuration does not belong to this application');
    }

    // Mettre à jour la configuration
    const updatedConfig = await this.configurationRepository.update(configuration._id, {
      status: updateData.status,
      customDisplayName: updateData.customDisplayName,
      customDescription: updateData.customDescription,
      isHighlighted: updateData.isHighlighted,
      highlightText: updateData.highlightText,
      sortOrder: updateData.sortOrder,
    });

    // Mettre à jour les valeurs des champs si fourni
    if (updateData.fieldValues) {
      const fieldValues: Partial<FeatureCustomFieldValuePOJO>[] = updateData.fieldValues.map(
        (fv) => ({
          featurePlanConfigurationId: configuration._id as any,
          customFieldId: fv.customFieldId as any,
          fieldValue: fv.fieldValue,
          displayValue: fv.displayValue || '',
          isUnlimited: fv.isUnlimited || fv.fieldValue === -1,
          applicationId: applicationId as any,
          planId: planId as any,
          featureId: featureId as any,
          isActive: true,
        }),
      );

      await this.fieldValueRepository.bulkCreateOrUpdate(fieldValues);
    }

    // Retourner la configuration mise à jour
    const feature = await this.featureRepository.findById(featureId);
    const customFields = await this.customFieldRepository.findByFeature(featureId);
    const fieldValues = await this.fieldValueRepository.findByConfiguration(configuration._id);

    return {
      configuration: updatedConfig!,
      feature: feature!,
      customFields,
      fieldValues,
    };
  }

  async getAvailableFeatures(applicationId: string): Promise<FeaturePOJO[]> {
    return this.featureRepository.findByApplication(applicationId, true);
  }

  async updateFeatureOrder(
    planId: string,
    applicationId: string,
    featureOrders: Array<{ featureId: string; sortOrder: number }>,
  ): Promise<boolean> {
    // Vérifier que toutes les configurations appartiennent au plan et à l'application
    const configurations = await this.configurationRepository.findPlanFeatures(
      planId,
      applicationId,
    );

    const configIds = configurations.map((c) => c.featureId.toString());
    const missingFeatures = featureOrders.filter((fo) => !configIds.includes(fo.featureId));

    if (missingFeatures.length > 0) {
      throw new BadRequestException('Some features are not configured for this plan');
    }

    return this.configurationRepository.updateSortOrder(planId, featureOrders);
  }
}
