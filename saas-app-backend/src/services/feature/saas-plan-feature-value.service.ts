import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SaasPlanFeatureValue,
  SaasPlanFeatureValueDocument,
} from '../../data/models/saasPlanFeatureValue/saas-plan-feature-value.model';
import { SaasApplicationFeatureService } from './saas-application-feature.service';
import { FeatureUnit } from '../../data/models/saasApplicationFeature/saas-application-feature.model';

export interface CreatePlanFeatureValueDto {
  planId: string;
  featureId: string;
  applicationId: string;
  value: number;
  isUnlimited?: boolean;
}

export interface UpdatePlanFeatureValueDto {
  value?: number;
  isUnlimited?: boolean;
}

export interface PlanFeatureValueWithDetails {
  _id: string;
  planId: string;
  featureId: string;
  applicationId: string;
  value: number;
  isUnlimited: boolean;
  displayValue: string;
  feature?: {
    name: string;
    description: string;
    unit: FeatureUnit;
  };
}

@Injectable()
export class SaasPlanFeatureValueService {
  constructor(
    @InjectModel(SaasPlanFeatureValue.name)
    private planFeatureValueModel: Model<SaasPlanFeatureValueDocument>,
    private applicationFeatureService: SaasApplicationFeatureService,
  ) {}

  async create(createDto: CreatePlanFeatureValueDto): Promise<SaasPlanFeatureValue> {
    try {
      // Vérifier que la fonctionnalité existe
      const feature = await this.applicationFeatureService.findOne(createDto.featureId);

      const isUnlimited = createDto.isUnlimited || createDto.value === -1;
      const displayValue = SaasApplicationFeatureService.formatFeatureValue(
        createDto.value,
        feature.unit,
        isUnlimited,
      );

      const planFeatureValue = new this.planFeatureValueModel({
        ...createDto,
        isUnlimited,
        displayValue,
      });

      return await planFeatureValue.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Feature value already exists for this plan');
      }
      throw new BadRequestException(`Failed to create plan feature value: ${error.message}`);
    }
  }

  async findByPlanId(planId: string): Promise<PlanFeatureValueWithDetails[]> {
    const planFeatureValues = await this.planFeatureValueModel
      .find({ planId, isActive: true })
      .exec();

    const results: PlanFeatureValueWithDetails[] = [];

    for (const pfv of planFeatureValues) {
      try {
        const feature = await this.applicationFeatureService.findOne(pfv.featureId.toString());
        results.push({
          _id: pfv._id.toString(),
          planId: pfv.planId.toString(),
          featureId: pfv.featureId.toString(),
          applicationId: pfv.applicationId.toString(),
          value: pfv.value,
          isUnlimited: pfv.isUnlimited,
          displayValue: pfv.displayValue || '',
          feature: {
            name: feature.name,
            description: feature.description,
            unit: feature.unit,
          },
        });
      } catch (error) {
        // Si la fonctionnalité n'existe plus, on ignore cette valeur
        console.warn(`Feature ${pfv.featureId} not found for plan feature value ${pfv._id}`);
      }
    }

    return results;
  }

  async findByApplicationId(applicationId: string): Promise<SaasPlanFeatureValue[]> {
    return this.planFeatureValueModel.find({ applicationId, isActive: true }).exec();
  }

  async findOne(id: string): Promise<SaasPlanFeatureValue> {
    const planFeatureValue = await this.planFeatureValueModel.findById(id).exec();
    if (!planFeatureValue) {
      throw new NotFoundException(`Plan feature value with ID ${id} not found`);
    }
    return planFeatureValue;
  }

  async update(id: string, updateDto: UpdatePlanFeatureValueDto): Promise<SaasPlanFeatureValue> {
    const existingValue = await this.findOne(id);
    const feature = await this.applicationFeatureService.findOne(
      existingValue.featureId.toString(),
    );

    const value = updateDto.value !== undefined ? updateDto.value : existingValue.value;
    const isUnlimited =
      updateDto.isUnlimited !== undefined ? updateDto.isUnlimited : existingValue.isUnlimited;

    const displayValue = SaasApplicationFeatureService.formatFeatureValue(
      value,
      feature.unit,
      isUnlimited,
    );

    const updatedValue = await this.planFeatureValueModel
      .findByIdAndUpdate(
        id,
        {
          ...updateDto,
          displayValue,
          isUnlimited: isUnlimited || value === -1,
        },
        { new: true },
      )
      .exec();

    if (!updatedValue) {
      throw new NotFoundException(`Plan feature value with ID ${id} not found`);
    }

    return updatedValue;
  }

  async remove(id: string): Promise<void> {
    const result = await this.planFeatureValueModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException(`Plan feature value with ID ${id} not found`);
    }
  }

  async removeByPlanId(planId: string): Promise<void> {
    await this.planFeatureValueModel.updateMany({ planId }, { isActive: false }).exec();
  }

  async removeByFeatureId(featureId: string): Promise<void> {
    await this.planFeatureValueModel.updateMany({ featureId }, { isActive: false }).exec();
  }

  async bulkCreateOrUpdate(
    planId: string,
    applicationId: string,
    featureValues: Array<{ featureId: string; value: number; isUnlimited?: boolean }>,
  ): Promise<SaasPlanFeatureValue[]> {
    const results: SaasPlanFeatureValue[] = [];

    for (const fv of featureValues) {
      try {
        // Essayer de trouver une valeur existante
        const existing = await this.planFeatureValueModel
          .findOne({ planId, featureId: fv.featureId })
          .exec();

        if (existing) {
          // Mettre à jour
          const updated = await this.update(existing._id.toString(), {
            value: fv.value,
            isUnlimited: fv.isUnlimited,
          });
          results.push(updated);
        } else {
          // Créer
          const created = await this.create({
            planId,
            featureId: fv.featureId,
            applicationId,
            value: fv.value,
            isUnlimited: fv.isUnlimited,
          });
          results.push(created);
        }
      } catch (error) {
        console.error(`Error processing feature value for ${fv.featureId}:`, error);
      }
    }

    return results;
  }
}
