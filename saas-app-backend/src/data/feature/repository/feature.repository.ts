import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FeaturePOJO,
  FeatureDocument,
  FeatureCategory,
  FeatureRole,
} from '../../models/feature/feature.pojo.model';

@Injectable()
export class FeatureRepository {
  constructor(
    @InjectModel(FeaturePOJO.name)
    private readonly featureModel: Model<FeatureDocument>,
  ) {}

  async create(featureData: Partial<FeaturePOJO>): Promise<FeaturePOJO> {
    const feature = new this.featureModel(featureData);
    return feature.save();
  }

  async findById(id: string | Types.ObjectId): Promise<FeaturePOJO | null> {
    return this.featureModel.findById(id).exec();
  }

  async findByName(name: string): Promise<FeaturePOJO | null> {
    return this.featureModel.findOne({ name, isActive: true }).exec();
  }

  async findByApplication(
    applicationId: string | Types.ObjectId,
    includeGlobal = true,
  ): Promise<FeaturePOJO[]> {
    const query: any = {
      isActive: true,
      $or: [{ applicationId }],
    };

    if (includeGlobal) {
      query.$or.push({ isGlobal: true, applicationId: null });
    }

    return this.featureModel.find(query).sort({ sortOrder: 1, name: 1 }).exec();
  }

  async findByCategory(
    category: FeatureCategory,
    applicationId?: string | Types.ObjectId,
  ): Promise<FeaturePOJO[]> {
    const query: any = { category, isActive: true };

    if (applicationId) {
      query.$or = [{ applicationId }, { isGlobal: true, applicationId: null }];
    }

    return this.featureModel.find(query).sort({ sortOrder: 1, name: 1 }).exec();
  }

  async findByRole(
    role: FeatureRole,
    applicationId?: string | Types.ObjectId,
  ): Promise<FeaturePOJO[]> {
    const query: any = {
      roles: { $in: [role, FeatureRole.ALL] },
      isActive: true,
    };

    if (applicationId) {
      query.$or = [{ applicationId }, { isGlobal: true, applicationId: null }];
    }

    return this.featureModel.find(query).sort({ sortOrder: 1, name: 1 }).exec();
  }

  async findGlobalFeatures(): Promise<FeaturePOJO[]> {
    return this.featureModel
      .find({ isGlobal: true, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateData: Partial<FeaturePOJO>,
  ): Promise<FeaturePOJO | null> {
    return this.featureModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.featureModel.findByIdAndUpdate(id, { isActive: false }).exec();
    return !!result;
  }

  async hardDelete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.featureModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findAll(
    filters: {
      isActive?: boolean;
      applicationId?: string | Types.ObjectId;
      category?: FeatureCategory;
      isGlobal?: boolean;
    } = {},
  ): Promise<FeaturePOJO[]> {
    const query: any = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.applicationId) {
      query.applicationId = filters.applicationId;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.isGlobal !== undefined) {
      query.isGlobal = filters.isGlobal;
    }

    return this.featureModel.find(query).sort({ sortOrder: 1, name: 1 }).exec();
  }
}
