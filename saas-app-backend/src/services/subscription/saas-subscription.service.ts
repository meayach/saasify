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

  // Lazy require to avoid circular deps at module init
  private async getPlanModel(): Promise<Model<any>> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mongoose = require('mongoose');
    return mongoose.model('SaasPlan');
  }

  private async getApplicationModel(): Promise<Model<any>> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mongoose = require('mongoose');
    // The application data module registers the POJO model under SaasApplicationPOJO.name
    // which stores the `defaultPlanId` field used by the application repository.
    // Use that model name here so fallback lookups read the same documents the repo updates.
    try {
      return mongoose.model('SaasApplicationPOJO');
    } catch (e) {
      // Fallback to the older model name if POJO model isn't registered
      return mongoose.model('SaasApplication');
    }
  }

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
      // Revenus mensuels (abonnements actifs) — seulement pour les plans MONTHLY
      const revenueAggregation = await this.subscriptionModel.aggregate([
        // Ne considérer que les abonnements actifs
        { $match: { status: 'ACTIVE' } },
        // Lookup plan to get billingCycle
        {
          $lookup: {
            from: 'saasplans',
            localField: 'planId',
            foreignField: '_id',
            as: 'plan',
          },
        },
        { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
        // Filtrer uniquement les abonnements dont le plan a billingCycle MONTHLY
        { $match: { 'plan.billingCycle': 'MONTHLY' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$price' },
          },
        },
      ]);

      const subscriptionMonthlyRevenue =
        revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

      // Compute per-application configured plan revenue (selectedPlan or defaultPlanId)
      try {
        // Read applications directly from the raw collection to avoid model registration
        // issues during runtime. This is robust and reads the same documents our
        // maintenance scripts updated earlier.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mongoose = require('mongoose');
        // Try several ways to get the native MongoDB Db instance depending on
        // how/when mongoose was initialized in the running app.
        let db: any = null;
        try {
          // Prefer the model's connection if available
          if (this.subscriptionModel && (this.subscriptionModel as any).db) {
            const modelDb = (this.subscriptionModel as any).db;
            // If modelDb.client exists (modern mongoose), derive native Db
            if (modelDb.client && typeof modelDb.client.db === 'function') {
              db = modelDb.client.db();
            } else if (modelDb.db) {
              db = modelDb.db;
            } else if (modelDb.collection) {
              db = modelDb;
            }
          }
        } catch (e) {
          // ignore and fall back to global connection
        }

        if (!db && mongoose && mongoose.connection && mongoose.connection.db) {
          db = mongoose.connection.db;
        }

        if (!db) {
          throw new Error('No MongoDB native Db available to read SaasApplications');
        }

        const apps: any[] = await db.collection('SaasApplications').find({}).toArray();

        console.log('DEBUG: read', apps.length, 'applications from SaasApplications collection');

        let appsMonthlySum = 0;
        const defaultPlanIds: any[] = [];

        for (const app of apps) {
          // 1) embedded selectedPlan
          if (
            app.selectedPlan &&
            app.selectedPlan.price &&
            (app.selectedPlan.billingCycle === 'MONTHLY' ||
              app.selectedPlan.billing === 'MONTHLY' ||
              app.selectedPlan.interval === 'month')
          ) {
            appsMonthlySum += Number(app.selectedPlan.price) || 0;
          } else if (app.defaultPlanId) {
            defaultPlanIds.push(app.defaultPlanId);
          }
        }

        // batch-query raw 'plans' collection (robust to model registration issues)
        if (defaultPlanIds.length > 0) {
          console.log(
            'DEBUG: found defaultPlanIds sample (first 10):',
            defaultPlanIds.slice(0, 10),
          );
          // dedupe and convert to ObjectId using the same mongoose we've already required
          const ObjectId = mongoose.Types.ObjectId;
          const uniqueIds = Array.from(new Set(defaultPlanIds.map((id) => id.toString()))).map(
            (s) => ObjectId(s),
          );
          console.log('DEBUG: querying plans collection for', uniqueIds.length, 'unique ids');
          const rawPlans = await db
            .collection('plans')
            .find({ _id: { $in: uniqueIds } })
            .toArray();
          console.log('DEBUG: rawPlans fetched count=', rawPlans.length);
          for (const p of rawPlans) {
            if (
              p &&
              (p.billingCycle === 'MONTHLY' || p.billing === 'MONTHLY' || p.interval === 'month') &&
              p.price
            ) {
              appsMonthlySum += Number(p.price) || 0;
            }
          }
        }

        const finalMonthlyRevenue =
          Number(subscriptionMonthlyRevenue || 0) + Number(appsMonthlySum || 0);
        console.log(
          '📊 Computed monthly revenue: subscriptions=',
          subscriptionMonthlyRevenue,
          'apps=',
          appsMonthlySum,
          'total=',
          finalMonthlyRevenue,
        );

        return {
          activeSubscriptions,
          monthlyRevenue: finalMonthlyRevenue,
          pendingSubscriptions,
          newClients,
          totalSubscriptions,
          cancelledSubscriptions,
        };
      } catch (err) {
        console.warn('Error computing apps-based monthly revenue fallback:', err.message || err);
        // fallback to subscription-only value
        return {
          activeSubscriptions,
          monthlyRevenue: subscriptionMonthlyRevenue,
          pendingSubscriptions,
          newClients,
          totalSubscriptions,
          cancelledSubscriptions,
        };
      }

      // Note: all return paths for the try block have already returned. This line is intentionally omitted.
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
