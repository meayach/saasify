import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FeatureCustomFieldValuePOJO,
  FeatureCustomFieldValueDocument,
} from '../../models/featureCustomFieldValue/featureCustomFieldValue.pojo.model';

@Injectable()
export class FeatureCustomFieldValueRepository {
  constructor(
    @InjectModel(FeatureCustomFieldValuePOJO.name)
    private readonly valueModel: Model<FeatureCustomFieldValueDocument>,
  ) {}

  async create(
    valueData: Partial<FeatureCustomFieldValuePOJO>,
  ): Promise<FeatureCustomFieldValuePOJO> {
    const value = new this.valueModel(valueData);
    return value.save();
  }

  async findById(id: string | Types.ObjectId): Promise<FeatureCustomFieldValuePOJO | null> {
    return this.valueModel.findById(id).exec();
  }

  async findByConfiguration(
    featurePlanConfigurationId: string | Types.ObjectId,
  ): Promise<FeatureCustomFieldValuePOJO[]> {
    return this.valueModel
      .find({ featurePlanConfigurationId, isActive: true })
      .populate('customFieldId')
      .exec();
  }

  async findByPlan(planId: string | Types.ObjectId): Promise<FeatureCustomFieldValuePOJO[]> {
    return this.valueModel
      .find({ planId, isActive: true })
      .populate(['customFieldId', 'featureId'])
      .exec();
  }

  async findByFeature(featureId: string | Types.ObjectId): Promise<FeatureCustomFieldValuePOJO[]> {
    return this.valueModel
      .find({ featureId, isActive: true })
      .populate(['customFieldId', 'planId'])
      .exec();
  }

  async findByPlanAndFeature(
    planId: string | Types.ObjectId,
    featureId: string | Types.ObjectId,
  ): Promise<FeatureCustomFieldValuePOJO[]> {
    return this.valueModel
      .find({ planId, featureId, isActive: true })
      .populate('customFieldId')
      .exec();
  }

  async findByConfigurationAndField(
    featurePlanConfigurationId: string | Types.ObjectId,
    customFieldId: string | Types.ObjectId,
  ): Promise<FeatureCustomFieldValuePOJO | null> {
    return this.valueModel
      .findOne({ featurePlanConfigurationId, customFieldId, isActive: true })
      .populate('customFieldId')
      .exec();
  }

  async findByApplication(
    applicationId: string | Types.ObjectId,
  ): Promise<FeatureCustomFieldValuePOJO[]> {
    return this.valueModel
      .find({ applicationId, isActive: true })
      .populate(['customFieldId', 'planId', 'featureId'])
      .exec();
  }

  async findUnlimitedValues(
    applicationId?: string | Types.ObjectId,
  ): Promise<FeatureCustomFieldValuePOJO[]> {
    const query: any = { isUnlimited: true, isActive: true };
    if (applicationId) {
      query.applicationId = applicationId;
    }

    return this.valueModel.find(query).populate(['customFieldId', 'planId', 'featureId']).exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateData: Partial<FeatureCustomFieldValuePOJO>,
  ): Promise<FeatureCustomFieldValuePOJO | null> {
    return this.valueModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async updateByConfigurationAndField(
    featurePlanConfigurationId: string | Types.ObjectId,
    customFieldId: string | Types.ObjectId,
    updateData: Partial<FeatureCustomFieldValuePOJO>,
  ): Promise<FeatureCustomFieldValuePOJO | null> {
    return this.valueModel
      .findOneAndUpdate({ featurePlanConfigurationId, customFieldId }, updateData, { new: true })
      .exec();
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.valueModel.findByIdAndUpdate(id, { isActive: false }).exec();
    return !!result;
  }

  async hardDelete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.valueModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async bulkCreateOrUpdate(
    values: Array<Partial<FeatureCustomFieldValuePOJO>>,
  ): Promise<FeatureCustomFieldValuePOJO[]> {
    const operations = values.map((value) => ({
      updateOne: {
        filter: {
          featurePlanConfigurationId: value.featurePlanConfigurationId,
          customFieldId: value.customFieldId,
        },
        update: { $set: value },
        upsert: true,
      },
    }));

    await this.valueModel.bulkWrite(operations);

    // Retourner les valeurs créées/mises à jour
    const configIds = [...new Set(values.map((v) => v.featurePlanConfigurationId))];
    return this.valueModel
      .find({ featurePlanConfigurationId: { $in: configIds }, isActive: true })
      .populate('customFieldId')
      .exec();
  }

  async deleteByPlan(planId: string | Types.ObjectId): Promise<boolean> {
    const result = await this.valueModel.updateMany({ planId }, { isActive: false }).exec();
    return result.modifiedCount > 0;
  }

  async deleteByFeature(featureId: string | Types.ObjectId): Promise<boolean> {
    const result = await this.valueModel.updateMany({ featureId }, { isActive: false }).exec();
    return result.modifiedCount > 0;
  }

  async findAll(
    filters: {
      isActive?: boolean;
      planId?: string | Types.ObjectId;
      featureId?: string | Types.ObjectId;
      applicationId?: string | Types.ObjectId;
      isUnlimited?: boolean;
      featurePlanConfigurationId?: string | Types.ObjectId;
    } = {},
  ): Promise<FeatureCustomFieldValuePOJO[]> {
    const query: any = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.planId) {
      query.planId = filters.planId;
    }

    if (filters.featureId) {
      query.featureId = filters.featureId;
    }

    if (filters.applicationId) {
      query.applicationId = filters.applicationId;
    }

    if (filters.isUnlimited !== undefined) {
      query.isUnlimited = filters.isUnlimited;
    }

    if (filters.featurePlanConfigurationId) {
      query.featurePlanConfigurationId = filters.featurePlanConfigurationId;
    }

    return this.valueModel.find(query).populate(['customFieldId', 'planId', 'featureId']).exec();
  }

  async getFormattedDisplayValue(
    fieldValue: any,
    unit: string,
    isUnlimited: boolean,
  ): Promise<string> {
    if (isUnlimited || fieldValue === -1) {
      return 'Illimité';
    }

    if (fieldValue === 0) {
      return 'Aucun';
    }

    switch (unit) {
      case 'emails':
        return `${fieldValue} emails/mois`;
      case 'gb':
        return `${fieldValue} GB`;
      case 'users':
        return `${fieldValue} utilisateurs`;
      case 'api_calls':
        return `${fieldValue} appels API/mois`;
      case 'percentage':
        return `${fieldValue}%`;
      default:
        return `${fieldValue} ${unit}`;
    }
  }
}
