import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SaasApplicationFeature,
  SaasApplicationFeatureDocument,
  FeatureType,
  FeatureUnit,
} from '../data/models/saasApplicationFeature.model';

export interface CreateFeatureDto {
  name: string;
  description: string;
  type: FeatureType;
  unit: FeatureUnit;
  applicationId: string;
  sortOrder?: number;
  metadata?: Record<string, any>;
}

export interface UpdateFeatureDto {
  name?: string;
  description?: string;
  type?: FeatureType;
  unit?: FeatureUnit;
  sortOrder?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

@Injectable()
export class SaasApplicationFeatureService {
  constructor(
    @InjectModel(SaasApplicationFeature.name)
    private featureModel: Model<SaasApplicationFeatureDocument>,
  ) {}

  async create(createFeatureDto: CreateFeatureDto): Promise<SaasApplicationFeature> {
    try {
      const feature = new this.featureModel({
        ...createFeatureDto,
        applicationId: createFeatureDto.applicationId,
        sortOrder: createFeatureDto.sortOrder || 0,
      });

      return await feature.save();
    } catch (error) {
      throw new BadRequestException(`Failed to create feature: ${error.message}`);
    }
  }

  async findAll(): Promise<SaasApplicationFeature[]> {
    return this.featureModel.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).exec();
  }

  async findByApplicationId(applicationId: string): Promise<SaasApplicationFeature[]> {
    return this.featureModel
      .find({ applicationId, isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<SaasApplicationFeature> {
    const feature = await this.featureModel.findById(id).exec();
    if (!feature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
    return feature;
  }

  async update(id: string, updateFeatureDto: UpdateFeatureDto): Promise<SaasApplicationFeature> {
    const feature = await this.featureModel
      .findByIdAndUpdate(id, updateFeatureDto, { new: true })
      .exec();

    if (!feature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }

    return feature;
  }

  async remove(id: string): Promise<void> {
    const result = await this.featureModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
  }

  async reorderFeatures(
    applicationId: string,
    featureOrders: Array<{ id: string; sortOrder: number }>,
  ): Promise<void> {
    const updatePromises = featureOrders.map(({ id, sortOrder }) =>
      this.featureModel.findByIdAndUpdate(id, { sortOrder }).exec(),
    );

    await Promise.all(updatePromises);
  }

  // Méthodes utilitaires pour les unités
  static getUnitLabel(unit: FeatureUnit): string {
    const labels: Record<FeatureUnit, string> = {
      [FeatureUnit.BYTES]: 'bytes',
      [FeatureUnit.KB]: 'KB',
      [FeatureUnit.MB]: 'MB',
      [FeatureUnit.GB]: 'GB',
      [FeatureUnit.TB]: 'TB',
      [FeatureUnit.EMAILS]: 'emails',
      [FeatureUnit.SMS]: 'SMS',
      [FeatureUnit.CALLS]: 'appels',
      [FeatureUnit.API_CALLS]: 'appels API',
      [FeatureUnit.REQUESTS]: 'requêtes',
      [FeatureUnit.USERS]: 'utilisateurs',
      [FeatureUnit.ACCOUNTS]: 'comptes',
      [FeatureUnit.SEATS]: 'sièges',
      [FeatureUnit.MINUTES]: 'minutes',
      [FeatureUnit.HOURS]: 'heures',
      [FeatureUnit.DAYS]: 'jours',
      [FeatureUnit.MONTHS]: 'mois',
      [FeatureUnit.ITEMS]: 'éléments',
      [FeatureUnit.PROJECTS]: 'projets',
      [FeatureUnit.FILES]: 'fichiers',
      [FeatureUnit.NONE]: '',
    };
    return labels[unit] || unit;
  }

  static formatFeatureValue(value: number, unit: FeatureUnit, isUnlimited = false): string {
    if (isUnlimited || value === -1) {
      return 'illimité';
    }

    const unitLabel = this.getUnitLabel(unit);
    return unitLabel ? `${value} ${unitLabel}` : value.toString();
  }
}
