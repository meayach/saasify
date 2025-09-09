import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FeaturePlanConfigurationPOJO,
  FeaturePlanConfigurationDocument,
  FeatureStatus,
} from '../../models/featurePlanConfiguration/featurePlanConfiguration.pojo.model';

@Injectable()
export class FeaturePlanConfigurationRepository {
  constructor(
    @InjectModel(FeaturePlanConfigurationPOJO.name)
    private readonly configModel: Model<FeaturePlanConfigurationDocument>,
  ) {}

  async create(
    configData: Partial<FeaturePlanConfigurationPOJO>,
  ): Promise<FeaturePlanConfigurationPOJO> {
    const config = new this.configModel(configData);
    return config.save();
  }

  async findById(id: string | Types.ObjectId): Promise<FeaturePlanConfigurationPOJO | null> {
    return this.configModel.findById(id).exec();
  }

  async findByPlan(planId: string | Types.ObjectId): Promise<FeaturePlanConfigurationPOJO[]> {
    return this.configModel
      .find({ planId, isActive: true })
      .sort({ sortOrder: 1 })
      .populate('featureId')
      .exec();
  }

  async findByFeature(featureId: string | Types.ObjectId): Promise<FeaturePlanConfigurationPOJO[]> {
    return this.configModel
      .find({ featureId, isActive: true })
      .sort({ sortOrder: 1 })
      .populate('planId')
      .exec();
  }

  async findByPlanAndFeature(
    planId: string | Types.ObjectId,
    featureId: string | Types.ObjectId,
  ): Promise<FeaturePlanConfigurationPOJO | null> {
    return this.configModel.findOne({ planId, featureId, isActive: true }).exec();
  }

  async findByApplication(
    applicationId: string | Types.ObjectId,
  ): Promise<FeaturePlanConfigurationPOJO[]> {
    return this.configModel
      .find({ applicationId, isActive: true })
      .sort({ sortOrder: 1 })
      .populate(['planId', 'featureId'])
      .exec();
  }

  async findByStatus(
    status: FeatureStatus,
    applicationId?: string | Types.ObjectId,
  ): Promise<FeaturePlanConfigurationPOJO[]> {
    const query: any = { status, isActive: true };
    if (applicationId) {
      query.applicationId = applicationId;
    }

    return this.configModel
      .find(query)
      .sort({ sortOrder: 1 })
      .populate(['planId', 'featureId'])
      .exec();
  }

  async findPlanFeatures(
    planId: string | Types.ObjectId,
    applicationId: string | Types.ObjectId,
  ): Promise<FeaturePlanConfigurationPOJO[]> {
    return this.configModel
      .find({ planId, applicationId, isActive: true })
      .sort({ sortOrder: 1 })
      .populate('featureId')
      .exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateData: Partial<FeaturePlanConfigurationPOJO>,
  ): Promise<FeaturePlanConfigurationPOJO | null> {
    return this.configModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async updateByPlanAndFeature(
    planId: string | Types.ObjectId,
    featureId: string | Types.ObjectId,
    updateData: Partial<FeaturePlanConfigurationPOJO>,
  ): Promise<FeaturePlanConfigurationPOJO | null> {
    return this.configModel
      .findOneAndUpdate({ planId, featureId }, updateData, { new: true })
      .exec();
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.configModel.findByIdAndUpdate(id, { isActive: false }).exec();
    return !!result;
  }

  async deleteByPlanAndFeature(
    planId: string | Types.ObjectId,
    featureId: string | Types.ObjectId,
  ): Promise<boolean> {
    const result = await this.configModel
      .findOneAndUpdate({ planId, featureId }, { isActive: false })
      .exec();
    return !!result;
  }

  async hardDelete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.configModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async bulkCreateOrUpdate(
    configs: Array<Partial<FeaturePlanConfigurationPOJO>>,
  ): Promise<FeaturePlanConfigurationPOJO[]> {
    const operations = configs.map((config) => ({
      updateOne: {
        filter: { planId: config.planId, featureId: config.featureId },
        update: { $set: config },
        upsert: true,
      },
    }));

    await this.configModel.bulkWrite(operations);

    // Retourner les configurations créées/mises à jour
    const planIds = [...new Set(configs.map((c) => c.planId))];
    return this.configModel
      .find({ planId: { $in: planIds }, isActive: true })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async updateSortOrder(
    planId: string | Types.ObjectId,
    sortUpdates: Array<{ featureId: string; sortOrder: number }>,
  ): Promise<boolean> {
    const bulkOps = sortUpdates.map((update) => ({
      updateOne: {
        filter: { planId, featureId: update.featureId },
        update: { $set: { sortOrder: update.sortOrder } },
      },
    }));

    const result = await this.configModel.bulkWrite(bulkOps);
    return result.modifiedCount === sortUpdates.length;
  }

  async findAll(
    filters: {
      isActive?: boolean;
      planId?: string | Types.ObjectId;
      featureId?: string | Types.ObjectId;
      applicationId?: string | Types.ObjectId;
      status?: FeatureStatus;
    } = {},
  ): Promise<FeaturePlanConfigurationPOJO[]> {
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

    if (filters.status) {
      query.status = filters.status;
    }

    return this.configModel
      .find(query)
      .sort({ sortOrder: 1 })
      .populate(['planId', 'featureId'])
      .exec();
  }
}
