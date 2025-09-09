import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SubscriptionConsumptionPOJO,
  SubscriptionConsumptionDocument,
  ConsumptionPeriod,
} from '../../models/subscriptionConsumption/subscriptionConsumption.pojo.model';

@Injectable()
export class SubscriptionConsumptionRepository {
  constructor(
    @InjectModel(SubscriptionConsumptionPOJO.name)
    private readonly consumptionModel: Model<SubscriptionConsumptionDocument>,
  ) {}

  async create(
    consumptionData: Partial<SubscriptionConsumptionPOJO>,
  ): Promise<SubscriptionConsumptionPOJO> {
    const consumption = new this.consumptionModel(consumptionData);
    return consumption.save();
  }

  async findById(id: string | Types.ObjectId): Promise<SubscriptionConsumptionPOJO | null> {
    return this.consumptionModel.findById(id).exec();
  }

  async findBySubscription(
    subscriptionId: string | Types.ObjectId,
  ): Promise<SubscriptionConsumptionPOJO[]> {
    return this.consumptionModel
      .find({ subscriptionId, isActive: true })
      .populate(['featureId', 'customFieldId'])
      .exec();
  }

  async findBySubscriber(
    subscriberId: string | Types.ObjectId,
  ): Promise<SubscriptionConsumptionPOJO[]> {
    return this.consumptionModel
      .find({ subscriberId, isActive: true })
      .populate(['subscriptionId', 'featureId', 'customFieldId'])
      .exec();
  }

  async findCurrentConsumption(
    subscriptionId: string | Types.ObjectId,
    featureId: string | Types.ObjectId,
    customFieldId: string | Types.ObjectId,
    period: ConsumptionPeriod,
  ): Promise<SubscriptionConsumptionPOJO | null> {
    const now = new Date();
    return this.consumptionModel
      .findOne({
        subscriptionId,
        featureId,
        customFieldId,
        period,
        periodStart: { $lte: now },
        periodEnd: { $gte: now },
        isActive: true,
      })
      .exec();
  }

  async findByPeriod(
    subscriptionId: string | Types.ObjectId,
    period: ConsumptionPeriod,
    startDate?: Date,
    endDate?: Date,
  ): Promise<SubscriptionConsumptionPOJO[]> {
    const query: any = { subscriptionId, period, isActive: true };

    if (startDate && endDate) {
      query.periodStart = { $gte: startDate };
      query.periodEnd = { $lte: endDate };
    }

    return this.consumptionModel
      .find(query)
      .populate(['featureId', 'customFieldId'])
      .sort({ periodStart: -1 })
      .exec();
  }

  async findLimitExceeded(
    applicationId?: string | Types.ObjectId,
    subscriberId?: string | Types.ObjectId,
  ): Promise<SubscriptionConsumptionPOJO[]> {
    const query: any = { isLimitExceeded: true, isActive: true };

    if (applicationId) {
      query.applicationId = applicationId;
    }

    if (subscriberId) {
      query.subscriberId = subscriberId;
    }

    return this.consumptionModel
      .find(query)
      .populate(['subscriptionId', 'featureId', 'customFieldId'])
      .sort({ updatedAt: -1 })
      .exec();
  }

  async incrementConsumption(
    subscriptionId: string | Types.ObjectId,
    featureId: string | Types.ObjectId,
    customFieldId: string | Types.ObjectId,
    incrementValue: number,
    period: ConsumptionPeriod,
  ): Promise<SubscriptionConsumptionPOJO | null> {
    const current = await this.findCurrentConsumption(
      subscriptionId,
      featureId,
      customFieldId,
      period,
    );

    if (current) {
      const newConsumption = current.consumptionValue + incrementValue;
      const isExceeded = current.limitValue !== -1 && newConsumption > current.limitValue;

      return this.consumptionModel
        .findByIdAndUpdate(
          current._id,
          {
            consumptionValue: newConsumption,
            isLimitExceeded: isExceeded,
          },
          { new: true },
        )
        .exec();
    }

    return null;
  }

  async resetConsumption(
    subscriptionId: string | Types.ObjectId,
    featureId: string | Types.ObjectId,
    customFieldId: string | Types.ObjectId,
    period: ConsumptionPeriod,
  ): Promise<SubscriptionConsumptionPOJO | null> {
    const current = await this.findCurrentConsumption(
      subscriptionId,
      featureId,
      customFieldId,
      period,
    );

    if (current) {
      const now = new Date();
      return this.consumptionModel
        .findByIdAndUpdate(
          current._id,
          {
            consumptionValue: 0,
            isLimitExceeded: false,
            lastResetDate: now,
            nextResetDate: this.calculateNextResetDate(period, now),
          },
          { new: true },
        )
        .exec();
    }

    return null;
  }

  async findConsumptionsToReset(): Promise<SubscriptionConsumptionPOJO[]> {
    const now = new Date();
    return this.consumptionModel
      .find({
        nextResetDate: { $lte: now },
        isActive: true,
      })
      .populate(['subscriptionId', 'featureId', 'customFieldId'])
      .exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateData: Partial<SubscriptionConsumptionPOJO>,
  ): Promise<SubscriptionConsumptionPOJO | null> {
    return this.consumptionModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.consumptionModel.findByIdAndUpdate(id, { isActive: false }).exec();
    return !!result;
  }

  async hardDelete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.consumptionModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getConsumptionSummary(
    subscriptionId: string | Types.ObjectId,
    period: ConsumptionPeriod,
  ): Promise<{
    totalFeatures: number;
    featuresWithLimits: number;
    exceededLimits: number;
    consumptions: SubscriptionConsumptionPOJO[];
  }> {
    const consumptions = await this.findByPeriod(subscriptionId, period);

    return {
      totalFeatures: consumptions.length,
      featuresWithLimits: consumptions.filter((c) => c.limitValue !== -1).length,
      exceededLimits: consumptions.filter((c) => c.isLimitExceeded).length,
      consumptions,
    };
  }

  private calculateNextResetDate(period: ConsumptionPeriod, currentDate: Date): Date {
    const nextReset = new Date(currentDate);

    switch (period) {
      case ConsumptionPeriod.HOURLY:
        nextReset.setHours(nextReset.getHours() + 1);
        break;
      case ConsumptionPeriod.DAILY:
        nextReset.setDate(nextReset.getDate() + 1);
        break;
      case ConsumptionPeriod.WEEKLY:
        nextReset.setDate(nextReset.getDate() + 7);
        break;
      case ConsumptionPeriod.MONTHLY:
        nextReset.setMonth(nextReset.getMonth() + 1);
        break;
      case ConsumptionPeriod.YEARLY:
        nextReset.setFullYear(nextReset.getFullYear() + 1);
        break;
      case ConsumptionPeriod.CURRENT_BILLING_CYCLE:
        // Calculer la prochaine date de facturation (logique métier spécifique)
        nextReset.setMonth(nextReset.getMonth() + 1);
        break;
      case ConsumptionPeriod.LIFETIME:
        // Pas de reset pour les limites à vie
        nextReset.setFullYear(nextReset.getFullYear() + 100);
        break;
      default:
        nextReset.setMonth(nextReset.getMonth() + 1);
    }

    return nextReset;
  }
}
