import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SaasPlanDocument, SaasPlanPOJO } from '@Data/models/saasPlan/saasPlan.pojo.model';

@Injectable()
export class SaasPlanRepository {
  constructor(
    @InjectModel(SaasPlanPOJO.name)
    private saasPlanModel: Model<SaasPlanDocument>,
  ) {}

  async getSaasPlanById(id: string): Promise<SaasPlanPOJO | null> {
    return await this.saasPlanModel.findById(id).lean().exec();
  }

  async findByApplication(applicationId: string): Promise<SaasPlanPOJO[]> {
    return await this.saasPlanModel.find({ saasApplication: applicationId }).lean().exec();
  }

  async createSaasPlan(planData: Partial<SaasPlanPOJO>): Promise<SaasPlanPOJO> {
    const plan = new this.saasPlanModel(planData);
    return await plan.save();
  }

  async updateSaasPlan(
    id: string,
    updateData: Partial<SaasPlanPOJO>,
  ): Promise<SaasPlanPOJO | null> {
    return await this.saasPlanModel.findByIdAndUpdate(id, updateData, { new: true }).lean().exec();
  }

  async deleteSaasPlan(id: string): Promise<boolean> {
    const result = await this.saasPlanModel.findByIdAndDelete(id);
    return result !== null;
  }
}
