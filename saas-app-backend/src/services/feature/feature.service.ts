import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { FeatureRepository } from '../../data/feature/repository/feature.repository';
import { FeatureCustomFieldRepository } from '../../data/featureCustomField/repository/featureCustomField.repository';
import {
  FeaturePOJO,
  FeatureCategory,
  FeatureRole,
} from '../../data/models/feature/feature.pojo.model';
import {
  FeatureCustomFieldPOJO,
  FieldDataType,
  FieldUnit,
} from '../../data/models/featureCustomField/featureCustomField.pojo.model';

export interface CreateFeatureDto {
  name: string;
  description?: string;
  category: FeatureCategory;
  roles?: FeatureRole[];
  isGlobal?: boolean;
  applicationId?: string;
  displayName?: string;
  icon?: string;
  sortOrder?: number;
  metadata?: Record<string, any>;
}

export interface CreateFeatureCustomFieldDto {
  fieldName: string;
  displayName?: string;
  description?: string;
  dataType: FieldDataType;
  unit?: FieldUnit;
  defaultValue?: any;
  minValue?: number;
  maxValue?: number;
  enumValues?: string[];
  isRequired?: boolean;
  sortOrder?: number;
  validationRules?: Record<string, any>;
}

export interface FeatureWithFieldsDto {
  feature: FeaturePOJO;
  customFields: FeatureCustomFieldPOJO[];
}

@Injectable()
export class FeatureService {
  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly customFieldRepository: FeatureCustomFieldRepository,
  ) {}

  async createFeature(dto: CreateFeatureDto): Promise<FeaturePOJO> {
    // Vérifier que le nom n'existe pas déjà
    const existing = await this.featureRepository.findByName(dto.name);
    if (existing) {
      throw new BadRequestException(`Feature with name '${dto.name}' already exists`);
    }

    // Validation de la cohérence applicationId/isGlobal
    if (dto.isGlobal && dto.applicationId) {
      throw new BadRequestException(
        'A global feature cannot be associated with a specific application',
      );
    }

    if (!dto.isGlobal && !dto.applicationId) {
      throw new BadRequestException('A non-global feature must be associated with an application');
    }

    const featureData: Partial<FeaturePOJO> = {
      name: dto.name,
      description: dto.description || '',
      category: dto.category,
      roles: dto.roles || [FeatureRole.ALL],
      isGlobal: dto.isGlobal || false,
      applicationId: dto.applicationId ? new Types.ObjectId(dto.applicationId) : undefined,
      displayName: dto.displayName || dto.name,
      icon: dto.icon || '',
      sortOrder: dto.sortOrder || 0,
      metadata: dto.metadata || {},
      isActive: true,
    };

    return this.featureRepository.create(featureData);
  }

  async addCustomField(
    featureId: string,
    dto: CreateFeatureCustomFieldDto,
  ): Promise<FeatureCustomFieldPOJO> {
    // Vérifier que la feature existe
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    // Vérifier que le nom du champ n'existe pas déjà pour cette feature
    const existing = await this.customFieldRepository.findByFeatureAndName(
      featureId,
      dto.fieldName,
    );
    if (existing) {
      throw new BadRequestException(
        `Custom field '${dto.fieldName}' already exists for this feature`,
      );
    }

    const fieldData: Partial<FeatureCustomFieldPOJO> = {
      fieldName: dto.fieldName,
      displayName: dto.displayName || dto.fieldName,
      description: dto.description || '',
      dataType: dto.dataType,
      unit: dto.unit || FieldUnit.NONE,
      featureId: new Types.ObjectId(featureId),
      defaultValue: dto.defaultValue,
      minValue: dto.minValue,
      maxValue: dto.maxValue,
      enumValues: dto.enumValues || [],
      isRequired: dto.isRequired !== false,
      sortOrder: dto.sortOrder || 0,
      validationRules: dto.validationRules || {},
      isActive: true,
    };

    return this.customFieldRepository.create(fieldData);
  }

  async getFeatureWithFields(featureId: string): Promise<FeatureWithFieldsDto> {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    const customFields = await this.customFieldRepository.findByFeature(featureId);

    return {
      feature,
      customFields,
    };
  }

  async getApplicationFeatures(
    applicationId: string,
    includeGlobal = true,
  ): Promise<FeatureWithFieldsDto[]> {
    const features = await this.featureRepository.findByApplication(applicationId, includeGlobal);

    const featuresWithFields = await Promise.all(
      features.map(async (feature) => {
        const customFields = await this.customFieldRepository.findByFeature(feature._id);
        return {
          feature,
          customFields,
        };
      }),
    );

    return featuresWithFields;
  }

  async getFeaturesByCategory(
    category: FeatureCategory,
    applicationId?: string,
  ): Promise<FeatureWithFieldsDto[]> {
    const features = await this.featureRepository.findByCategory(category, applicationId);

    const featuresWithFields = await Promise.all(
      features.map(async (feature) => {
        const customFields = await this.customFieldRepository.findByFeature(feature._id);
        return {
          feature,
          customFields,
        };
      }),
    );

    return featuresWithFields;
  }

  async getFeaturesByRole(
    role: FeatureRole,
    applicationId?: string,
  ): Promise<FeatureWithFieldsDto[]> {
    const features = await this.featureRepository.findByRole(role, applicationId);

    const featuresWithFields = await Promise.all(
      features.map(async (feature) => {
        const customFields = await this.customFieldRepository.findByFeature(feature._id);
        return {
          feature,
          customFields,
        };
      }),
    );

    return featuresWithFields;
  }

  async updateFeature(
    featureId: string,
    updateData: Partial<CreateFeatureDto>,
  ): Promise<FeaturePOJO> {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    // Validation du nom unique si fourni
    if (updateData.name && updateData.name !== feature.name) {
      const existing = await this.featureRepository.findByName(updateData.name);
      if (existing) {
        throw new BadRequestException(`Feature with name '${updateData.name}' already exists`);
      }
    }

    const updatedFeature = await this.featureRepository.update(featureId, updateData);
    if (!updatedFeature) {
      throw new NotFoundException('Feature not found');
    }

    return updatedFeature;
  }

  async deleteFeature(featureId: string): Promise<boolean> {
    const feature = await this.featureRepository.findById(featureId);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    // Désactiver tous les champs personnalisés associés
    const customFields = await this.customFieldRepository.findByFeature(featureId);
    await Promise.all(customFields.map((field) => this.customFieldRepository.delete(field._id)));

    return this.featureRepository.delete(featureId);
  }

  async updateCustomField(
    fieldId: string,
    updateData: Partial<CreateFeatureCustomFieldDto>,
  ): Promise<FeatureCustomFieldPOJO> {
    const field = await this.customFieldRepository.findById(fieldId);
    if (!field) {
      throw new NotFoundException('Custom field not found');
    }

    const updatedField = await this.customFieldRepository.update(fieldId, updateData);
    if (!updatedField) {
      throw new NotFoundException('Custom field not found');
    }

    return updatedField;
  }

  async deleteCustomField(fieldId: string): Promise<boolean> {
    const field = await this.customFieldRepository.findById(fieldId);
    if (!field) {
      throw new NotFoundException('Custom field not found');
    }

    return this.customFieldRepository.delete(fieldId);
  }

  async getAllFeatures(
    filters: {
      applicationId?: string;
      category?: FeatureCategory;
      isGlobal?: boolean;
      isActive?: boolean;
    } = {},
  ): Promise<FeatureWithFieldsDto[]> {
    const features = await this.featureRepository.findAll(filters);

    const featuresWithFields = await Promise.all(
      features.map(async (feature) => {
        const customFields = await this.customFieldRepository.findByFeature(feature._id);
        return {
          feature,
          customFields,
        };
      }),
    );

    return featuresWithFields;
  }
}
