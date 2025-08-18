import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { PaymentMethod } from '../../data/models/paymentMethod/payment-method.model';
import { SaasPayment } from '../../data/models/SaasPayment/saas-payment.model';
import { User } from '../../data/models/user/user.model';
import { SaasPlan } from '../../data/models/saasPlan/saas-plan.model';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectModel(PaymentMethod.name)
    private paymentMethodModel: Model<PaymentMethod>,
    @InjectModel(SaasPayment.name)
    private paymentModel: Model<SaasPayment>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(SaasPlan.name)
    private planModel: Model<SaasPlan>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-07-30.basil',
    });
  }

  async getUserPaymentMethods(userId: string) {
    const paymentMethods = await this.paymentMethodModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .sort({ isDefault: -1, createdAt: -1 });

    return paymentMethods;
  }

  async addPaymentMethod(userId: string, createPaymentMethodDto: any) {
    const userForPayment = await this.userModel.findById(userId);
    if (!userForPayment) {
      throw new NotFoundException('User not found');
    }

    // Create payment method in Stripe if needed
    let stripePaymentMethodId = createPaymentMethodDto.stripePaymentMethodId;

    if (!stripePaymentMethodId && createPaymentMethodDto.cardToken) {
      const stripePaymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: createPaymentMethodDto.cardToken,
        },
      });
      stripePaymentMethodId = stripePaymentMethod.id;
    }

    // Check if this is the first payment method
    const existingMethods = await this.paymentMethodModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    const isDefault = existingMethods === 0 || createPaymentMethodDto.isDefault;

    // If setting as default, unset other default methods
    if (isDefault) {
      await this.paymentMethodModel.updateMany(
        { userId: new Types.ObjectId(userId) },
        { isDefault: false },
      );
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Cast to include stripeCustomerId property
    const userWithStripe = userForPayment as any;

    const paymentMethod = new this.paymentMethodModel({
      userId: new Types.ObjectId(userId),
      type: createPaymentMethodDto.type,
      isDefault,
      gatewayPaymentMethodId: stripePaymentMethodId,
      gatewayCustomerId: userWithStripe.stripeCustomerId,
      gateway: 'stripe',
      billingAddress: createPaymentMethodDto.billingAddress,
      ...createPaymentMethodDto,
    });

    return paymentMethod.save();
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    const paymentMethod = await this.paymentMethodModel.findOne({
      _id: paymentMethodId,
      userId: new Types.ObjectId(userId),
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    // Delete from Stripe if it exists
    if (paymentMethod.gatewayPaymentMethodId) {
      try {
        await this.stripe.paymentMethods.detach(paymentMethod.gatewayPaymentMethodId);
      } catch (error) {
        console.error('Error detaching payment method from Stripe:', error);
      }
    }

    // Soft delete
    await this.paymentMethodModel.findByIdAndUpdate(paymentMethodId, {
      isActive: false,
    });

    // If this was the default, set another one as default
    if (paymentMethod.isDefault) {
      const nextMethod = await this.paymentMethodModel.findOne({
        userId: new Types.ObjectId(userId),
        isActive: true,
      });

      if (nextMethod) {
        nextMethod.isDefault = true;
        await nextMethod.save();
      }
    }
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
    // Unset all default methods for user
    await this.paymentMethodModel.updateMany(
      { userId: new Types.ObjectId(userId) },
      { isDefault: false },
    );

    // Set the specified method as default
    const paymentMethod = await this.paymentMethodModel.findOneAndUpdate(
      {
        _id: paymentMethodId,
        userId: new Types.ObjectId(userId),
        isActive: true,
      },
      { isDefault: true },
      { new: true },
    );

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    return paymentMethod;
  }

  async getUserBillingHistory(userId: string) {
    const payments = await this.paymentModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('planId')
      .populate('subscriptionId')
      .sort({ createdAt: -1 })
      .limit(50);

    return payments;
  }

  async createSubscriptionPaymentIntent(userId: string, data: any) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = await this.planModel.findById(data.planId).populate('currencyId');
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Cast plan to access populated fields
    const planWithCurrency = plan as any;

    // Create or get Stripe customer
    const userWithStripe = user as any;
    let stripeCustomerId = userWithStripe.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      await this.userModel.findByIdAndUpdate(userId, {
        stripeCustomerId,
      });
    }

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(plan.price * 100), // Convert to cents
      currency: planWithCurrency.currencyId?.code?.toLowerCase() || 'usd',
      customer: stripeCustomerId,
      payment_method: data.paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        userId,
        planId: data.planId,
        billingCycle: data.billingCycle,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }
}
