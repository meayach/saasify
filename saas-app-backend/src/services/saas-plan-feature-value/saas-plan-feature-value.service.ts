import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaasPlanFeatureValue, SaasPlanFeatureValueDocument } from '../../data/models/saasPlanFeatureValue/saas-plan-feature-value.model';
import { CreateSaasPlanFeatureValueDto, UpdateSaasPlanFeatureValueDto, BulkUpdatePlanFeatureValuesDto } from '../dto/saas-plan-feature-value/saas-plan-feature-value.dto';

@Injectable()
export class SaasPlanFeatureValueService {
  constructor(
    @InjectModel(SaasPlanFeatureValue.name)
    private readonly saasPlanFeatureValueModel: Model<SaasPlanFeatureValueDocument>,
  ) {}

  async create(createFeatureValueDto: CreateSaasPlanFeatureValueDto): Promise<SaasPlanFeatureValue> {
    try {
      const featureValue = new this.saasPlanFeatureValueModel(createFeatureValueDto);
      return await featureValue.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Feature value already exists for this plan and feature');
      }
      throw error;
    }
  }

  async findAll(): Promise<SaasPlanFeatureValue[]> {
    return this.saasPlanFeatureValueModel
      .find()
      .populate('featureId')
      .populate('planId')
      .exec();
  }

  async findByPlanId(planId: string): Promise<SaasPlanFeatureValue[]> {
    return this.saasPlanFeatureValueModel
      .find({ planId })
      .populate('featureId')
      .exec();
  }

  async findByFeatureId(featureId: string): Promise<SaasPlanFeatureValue[]> {
    return this.saasPlanFeatureValueModel
      .find({ featureId })
      .populate('planId')
      .exec();
  }

  async findById(id: string): Promise<SaasPlanFeatureValue> {
    const featureValue = await this.saasPlanFeatureValueModel
      .findById(id)
      .populate('featureId')
      .populate('planId')
      .exec();
    
    if (!featureValue) {
      throw new NotFoundException(`Feature value with ID "${id}" not found`);
    }
    return featureValue;
  }

  async findByPlanIdAndFeatureId(planId: string, featureId: string): Promise<SaasPlanFeatureValue | null> {
    return this.saasPlanFeatureValueModel
      .findOne({ planId, featureId })
      .populate('featureId')
      .exec();
  }

  async update(id: string, updateFeatureValueDto: UpdateSaasPlanFeatureValueDto): Promise<SaasPlanFeatureValue> {
    const featureValue = await this.saasPlanFeatureValueModel
      .findByIdAndUpdate(id, updateFeatureValueDto, { new: true })
      .populate('featureId')
      .populate('planId')
      .exec();
    
    if (!featureValue) {
      throw new NotFoundException(`Feature value with ID "${id}" not found`);
    }
    
    return featureValue;
  }

  async remove(id: string): Promise<void> {
    const result = await this.saasPlanFeatureValueModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Feature value with ID "${id}" not found`);
    }
  }

  async bulkUpdateForPlan(bulkUpdateDto: BulkUpdatePlanFeatureValuesDto): Promise<SaasPlanFeatureValue[]> {
    const { planId, featureValues } = bulkUpdateDto;
    
    // Delete existing feature values for this plan
    await this.saasPlanFeatureValueModel.deleteMany({ planId });
    
    // Create new feature values
    const newFeatureValues = featureValues.map(fv => ({
      planId,
      featureId: fv.featureId,
      value: fv.value,
      isUnlimited: fv.isUnlimited || false,
      displayValue: fv.displayValue,
    }));
    
    const createdValues = await this.saasPlanFeatureValueModel.insertMany(newFeatureValues);
    
    // Return populated values
    return this.findByPlanId(planId);
  }

  async removeByPlanId(planId: string): Promise<void> {
    await this.saasPlanFeatureValueModel.deleteMany({ planId });
  }

  async removeByFeatureId(featureId: string): Promise<void> {
    await this.saasPlanFeatureValueModel.deleteMany({ featureId });
  }
}