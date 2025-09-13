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
    // Try using the registered Mongoose model first
    try {
      const plan = await this.planModel
        .findById(id)
        .populate('currencyId')
        .populate('applicationId');

      if (plan) return plan;
    } catch (err) {
      // continue to raw lookup
    }

    // Fallback: read directly from the raw 'plans' collection in case Mongoose model
    // is not registered or documents exist outside the model mapping.
    try {
      const conn = this.planModel.db;

      let raw = null;

      // Try ObjectId lookup first (most common)
      try {
        raw = await conn.collection('plans').findOne({ _id: new Types.ObjectId(id) });
      } catch (err) {
        // invalid ObjectId or other driver error, try string lookup next
        console.warn(
          '[PlanManagementService] ObjectId lookup failed for id=',
          id,
          err?.message || err,
        );
      }

      // If not found by ObjectId, try plain string _id (some imports used strings)
      if (!raw) {
        raw = await conn.collection('plans').findOne({ _id: id });
      }

      if (!raw) {
        throw new NotFoundException('Plan not found');
      }

      // Return the raw document as-is. Consumers expect populated fields sometimes,
      // but most callers use price, billingCycle, and basic fields which exist here.
      return raw;
    } catch (err) {
      throw new NotFoundException('Plan not found');
    }
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
