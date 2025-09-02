import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaasApplicationFeature, SaasApplicationFeatureDocument } from '../../data/models/saasApplicationFeature/saas-application-feature.model';
import { CreateSaasApplicationFeatureDto, UpdateSaasApplicationFeatureDto } from '../dto/saas-application-feature/saas-application-feature.dto';

@Injectable()
export class SaasApplicationFeatureService {
  constructor(
    @InjectModel(SaasApplicationFeature.name)
    private readonly saasApplicationFeatureModel: Model<SaasApplicationFeatureDocument>,
  ) {}

  async create(createFeatureDto: CreateSaasApplicationFeatureDto): Promise<SaasApplicationFeature> {
    try {
      const feature = new this.saasApplicationFeatureModel(createFeatureDto);
      return await feature.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Feature key already exists for this application');
      }
      throw error;
    }
  }

  async findAll(): Promise<SaasApplicationFeature[]> {
    return this.saasApplicationFeatureModel.find().sort({ sortOrder: 1, name: 1 }).exec();
  }

  async findByApplicationId(applicationId: string): Promise<SaasApplicationFeature[]> {
    return this.saasApplicationFeatureModel
      .find({ applicationId, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findById(id: string): Promise<SaasApplicationFeature> {
    const feature = await this.saasApplicationFeatureModel.findById(id).exec();
    if (!feature) {
      throw new NotFoundException(`Feature with ID "${id}" not found`);
    }
    return feature;
  }

  async update(id: string, updateFeatureDto: UpdateSaasApplicationFeatureDto): Promise<SaasApplicationFeature> {
    try {
      const feature = await this.saasApplicationFeatureModel
        .findByIdAndUpdate(id, updateFeatureDto, { new: true })
        .exec();
      
      if (!feature) {
        throw new NotFoundException(`Feature with ID "${id}" not found`);
      }
      
      return feature;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Feature key already exists for this application');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.saasApplicationFeatureModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Feature with ID "${id}" not found`);
    }
  }

  async deactivate(id: string): Promise<SaasApplicationFeature> {
    return this.update(id, { isActive: false });
  }

  async activate(id: string): Promise<SaasApplicationFeature> {
    return this.update(id, { isActive: true });
  }
}