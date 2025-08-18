import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SaasPlan, PlanType } from '../../data/models/saasPlan/saas-plan.model';
import { SaasPricing } from '../../data/models/saasPricing/saas-pricing.model';

@Injectable()
export class PlanManagementService {
  constructor(
    @InjectModel(SaasPlan.name)
    private planModel: Model<SaasPlan>,
    @InjectModel(SaasPricing.name)
    private pricingModel: Model<SaasPricing>,
  ) {}

  async getPlans(filters: { applicationId?: string; type?: PlanType; isActive?: boolean }) {
    const query: any = {};

    if (filters.applicationId) {
      query.applicationId = new Types.ObjectId(filters.applicationId);
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const plans = await this.planModel
      .find(query)
      .populate('currencyId')
      .populate('applicationId')
      .sort({ sortOrder: 1, createdAt: -1 });

    return plans;
  }

  async getPlanById(id: string) {
    const plan = await this.planModel.findById(id).populate('currencyId').populate('applicationId');

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async createPlan(createPlanDto: any) {
    const plan = new this.planModel({
      ...createPlanDto,
      currencyId: new Types.ObjectId(createPlanDto.currencyId),
      applicationId: new Types.ObjectId(createPlanDto.applicationId),
    });

    const savedPlan = await plan.save();
    return this.getPlanById(savedPlan._id.toString());
  }

  async updatePlan(id: string, updatePlanDto: any) {
    const plan = await this.planModel.findByIdAndUpdate(id, updatePlanDto, { new: true });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return this.getPlanById(id);
  }

  async deletePlan(id: string) {
    const plan = await this.planModel.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async getPlanPricing(planId: string) {
    const pricing = await this.pricingModel
      .find({ planId: new Types.ObjectId(planId) })
      .populate('currencyId')
      .populate('planId');

    return pricing;
  }

  async createPlanPricing(planId: string, pricingDto: any) {
    const pricing = new this.pricingModel({
      ...pricingDto,
      planId: new Types.ObjectId(planId),
      currencyId: new Types.ObjectId(pricingDto.currencyId),
      applicationId: new Types.ObjectId(pricingDto.applicationId),
    });

    return pricing.save();
  }
}
