import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaasSubscription } from '../../data/models/saassubscription/saas-subscription.model';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionStatus,
  BillingCycle,
} from '../dto/subscription.dto';

@Injectable()
export class SaasSubscriptionService {
  constructor(
    @InjectModel('SaasSubscription')
    private readonly subscriptionModel: Model<SaasSubscription>,
  ) {}

  async createSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SaasSubscription> {
    const subscription = new this.subscriptionModel({
      ...createSubscriptionDto,
      startDate: new Date(),
      status: 'ACTIVE',
    });
    return subscription.save();
  }

  async findAllSubscriptions(): Promise<SaasSubscription[]> {
    return this.subscriptionModel
      .find()
      .populate('planId')
      .populate('applicationId')
      .populate('customerId')
      .exec();
  }

  async findSubscriptionById(id: string): Promise<SaasSubscription> {
    const subscription = await this.subscriptionModel
      .findById(id)
      .populate('planId')
      .populate('applicationId')
      .populate('customerId')
      .exec();

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async findSubscriptionsByCustomer(customerId: string): Promise<SaasSubscription[]> {
    return this.subscriptionModel
      .find({ customerId })
      .populate('planId')
      .populate('applicationId')
      .exec();
  }

  async findSubscriptionsByApplication(applicationId: string): Promise<SaasSubscription[]> {
    return this.subscriptionModel
      .find({ applicationId })
      .populate('planId')
      .populate('customerId')
      .exec();
  }

  async updateSubscription(
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<SaasSubscription> {
    const subscription = await this.subscriptionModel
      .findByIdAndUpdate(id, updateSubscriptionDto, { new: true })
      .populate('planId')
      .populate('applicationId')
      .populate('customerId')
      .exec();

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async cancelSubscription(id: string): Promise<SaasSubscription> {
    const subscription = await this.subscriptionModel
      .findByIdAndUpdate(id, { status: 'CANCELLED', endDate: new Date() }, { new: true })
      .exec();

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async renewSubscription(id: string): Promise<SaasSubscription> {
    const subscription = await this.findSubscriptionById(id);

    // Calculate new end date based on billing cycle
    const newEndDate = new Date();
    if (subscription.billingCycle === BillingCycle.MONTHLY) {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else if (subscription.billingCycle === BillingCycle.YEARLY) {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    return this.updateSubscription(id, {
      endDate: newEndDate,
      status: SubscriptionStatus.ACTIVE,
    });
  }

  async deleteSubscription(id: string): Promise<void> {
    const result = await this.subscriptionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
  }

  async getSubscriptionAnalytics(applicationId?: string) {
    const matchStage = applicationId ? { applicationId } : {};

    const analytics = await this.subscriptionModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
        },
      },
    ]);

    return {
      analytics,
      totalSubscriptions: await this.subscriptionModel.countDocuments(matchStage),
      activeSubscriptions: await this.subscriptionModel.countDocuments({
        ...matchStage,
        status: 'ACTIVE',
      }),
    };
  }

  async getSubscriptionStats() {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Statistiques générales
      const totalSubscriptions = await this.subscriptionModel.countDocuments();
      const activeSubscriptions = await this.subscriptionModel.countDocuments({ status: 'ACTIVE' });
      const pendingSubscriptions = await this.subscriptionModel.countDocuments({
        status: 'PENDING',
      });
      const cancelledSubscriptions = await this.subscriptionModel.countDocuments({
        status: 'CANCELLED',
      });

      // Nouveaux clients ce mois
      const newClients = await this.subscriptionModel.countDocuments({
        startDate: { $gte: startOfMonth },
      });

      // Revenus mensuels (abonnements actifs)
      const revenueAggregation = await this.subscriptionModel.aggregate([
        { $match: { status: 'ACTIVE' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$price' },
          },
        },
      ]);

      const monthlyRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

      return {
        activeSubscriptions,
        monthlyRevenue,
        pendingSubscriptions,
        newClients,
        totalSubscriptions,
        cancelledSubscriptions,
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      return {
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        pendingSubscriptions: 0,
        newClients: 0,
        totalSubscriptions: 0,
        cancelledSubscriptions: 0,
      };
    }
  }

  async getDashboardSubscriptions(options: { status?: string; limit?: number; offset?: number }) {
    const { status, limit = 50, offset = 0 } = options;

    const query = status ? { status: status.toUpperCase() } : {};

    return this.subscriptionModel
      .find(query)
      .populate('planId')
      .populate('applicationId')
      .populate('customerId')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .exec();
  }
}
