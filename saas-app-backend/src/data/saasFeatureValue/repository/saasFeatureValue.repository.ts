import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SaasFeatureValuePOJO,
  SaasFeatureValueDocument,
} from '../../models/saasFeatureValue/saasFeatureValue.pojo.model';

@Injectable()
export class SaasFeatureValueRepository {
  constructor(
    @InjectModel(SaasFeatureValuePOJO.name)
    private saasFeatureValueModel: Model<SaasFeatureValueDocument>,
  ) {}

  async createFeatureValue(
    featureValuePOJO: Partial<SaasFeatureValuePOJO>,
  ): Promise<SaasFeatureValuePOJO> {
    const featureValue = new this.saasFeatureValueModel(featureValuePOJO);
    return await featureValue.save();
  }

  async findById(id: string): Promise<SaasFeatureValuePOJO | null> {
    return await this.saasFeatureValueModel.findById(id).lean().exec();
  }

  async findByApplication(applicationId: string): Promise<SaasFeatureValuePOJO[]> {
    return await this.saasFeatureValueModel
      .find({ saasApplication: applicationId, isActive: true })
      .populate('saasPlan')
      .sort({ sortOrder: 1, featureName: 1 })
      .lean()
      .exec();
  }

  async findByPlan(planId: string): Promise<SaasFeatureValuePOJO[]> {
    return await this.saasFeatureValueModel
      .find({ saasPlan: planId, isActive: true })
      .sort({ sortOrder: 1, featureName: 1 })
      .lean()
      .exec();
  }

  async findByApplicationAndPlan(
    applicationId: string,
    planId: string,
  ): Promise<SaasFeatureValuePOJO[]> {
    return await this.saasFeatureValueModel
      .find({
        saasApplication: applicationId,
        saasPlan: planId,
        isActive: true,
      })
      .sort({ sortOrder: 1, featureName: 1 })
      .lean()
      .exec();
  }

  async updateFeatureValue(
    id: string,
    updateData: Partial<SaasFeatureValuePOJO>,
  ): Promise<SaasFeatureValuePOJO | null> {
    return await this.saasFeatureValueModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean()
      .exec();
  }

  async deleteFeatureValue(id: string): Promise<boolean> {
    const result = await this.saasFeatureValueModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
    return result !== null;
  }

  async bulkCreateFeatureValues(
    featureValues: Partial<SaasFeatureValuePOJO>[],
  ): Promise<SaasFeatureValuePOJO[]> {
    return await this.saasFeatureValueModel.insertMany(featureValues);
  }

  async getFeaturesByApplicationGroupedByPlan(
    applicationId: string,
  ): Promise<Record<string, SaasFeatureValuePOJO[]>> {
    const features = await this.saasFeatureValueModel
      .find({ saasApplication: applicationId, isActive: true })
      .populate('saasPlan', 'planName _id')
      .sort({ sortOrder: 1, featureName: 1 })
      .lean()
      .exec();

    const grouped: Record<string, SaasFeatureValuePOJO[]> = {};
    features.forEach((feature) => {
      const planId = String(feature.saasPlan);
      if (!grouped[planId]) {
        grouped[planId] = [];
      }
      grouped[planId].push(feature);
    });

    return grouped;
  }
}
