import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaasPlan } from '../../data/models/saasPlan/saas-plan.model';
import { CreateSaasPlanDto, UpdateSaasPlanDto, SaasPlanResponseDto } from '../dto/saas-plan.dto';

@Injectable()
export class SaasPlanService {
  constructor(@InjectModel(SaasPlan.name) private planModel: Model<SaasPlan>) {}

  async create(createPlanDto: CreateSaasPlanDto): Promise<SaasPlanResponseDto> {
    const createdPlan = new this.planModel(createPlanDto);
    const savedPlan = await createdPlan.save();
    return this.mapToResponseDto(savedPlan);
  }

  async findAll(
    applicationId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    plans: SaasPlanResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const filter = applicationId ? { applicationId } : {};

    const [plans, total] = await Promise.all([
      this.planModel
        .find(filter)
        .populate('currencyId', 'code symbol name')
        .skip(skip)
        .limit(limit)
        .sort({ sortOrder: 1, createdAt: -1 })
        .exec(),
      this.planModel.countDocuments(filter).exec(),
    ]);

    return {
      plans: plans.map((plan) => this.mapToResponseDto(plan)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<SaasPlanResponseDto> {
    const plan = await this.planModel
      .findById(id)
      .populate('currencyId', 'code symbol name')
      .exec();

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return this.mapToResponseDto(plan);
  }

  async findByApplication(applicationId: string): Promise<SaasPlanResponseDto[]> {
    const plans = await this.planModel
      .find({ applicationId, isActive: true })
      .populate('currencyId', 'code symbol name')
      .sort({ sortOrder: 1 })
      .exec();

    return plans.map((plan) => this.mapToResponseDto(plan));
  }

  async update(id: string, updatePlanDto: UpdateSaasPlanDto): Promise<SaasPlanResponseDto> {
    const updatedPlan = await this.planModel
      .findByIdAndUpdate(id, updatePlanDto, { new: true })
      .populate('currencyId', 'code symbol name')
      .exec();

    if (!updatedPlan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return this.mapToResponseDto(updatedPlan);
  }

  async remove(id: string): Promise<void> {
    const result = await this.planModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
  }

  async activate(id: string): Promise<SaasPlanResponseDto> {
    return this.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<SaasPlanResponseDto> {
    return this.update(id, { isActive: false });
  }

  private mapToResponseDto(plan: any): SaasPlanResponseDto {
    return {
      id: plan._id.toString(),
      name: plan.name,
      description: plan.description,
      type: plan.type,
      billingCycle: plan.billingCycle,
      price: plan.price,
      currency: plan.currencyId
        ? {
            id: plan.currencyId._id?.toString() || plan.currencyId,
            code: plan.currencyId.code || 'USD',
            symbol: plan.currencyId.symbol || '$',
          }
        : null,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      includedFeatures: plan.includedFeatures || [],
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
