import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasApplicationDocument,
  SaasApplicationPOJO,
} from '@Data/models/saasApplication/saasApplication.pojo.model';

@Injectable()
export class SaasApplicationRepository {
  constructor(
    @InjectModel(SaasApplicationPOJO.name)
    private saasApplicationModel: Model<SaasApplicationDocument>,
  ) {}

  async createSaasApplication(
    saasApplicationPOJO: SaasApplicationPOJO,
  ): Promise<SaasApplicationPOJO> {
    const newApplication = new this.saasApplicationModel(saasApplicationPOJO);
    return await newApplication.save();
  }

  async getAllSaasApplications(): Promise<SaasApplicationPOJO[]> {
    return await this.saasApplicationModel.find();
  }

  async getSaasApplicationById(id: string): Promise<SaasApplicationPOJO | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.saasApplicationModel.findById(id);
  }

  async updateSaasApplication(
    id: string,
    updateData: Partial<SaasApplicationPOJO>,
  ): Promise<SaasApplicationPOJO | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.saasApplicationModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true },
    );
  }

  async deleteSaasApplication(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.saasApplicationModel.findByIdAndDelete(id);
    return result !== null;
  }
}
