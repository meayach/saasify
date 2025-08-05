import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  WEEKLY = 'WEEKLY',
}

@Schema({ timestamps: true })
export class SaasSubscription extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SaasPlan', required: true })
  planId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SaasApplication', required: true })
  applicationId: Types.ObjectId;

  @Prop({ type: String, enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
  status: SubscriptionStatus;

  @Prop({ type: String, enum: BillingCycle, required: true })
  billingCycle: BillingCycle;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 'USD' })
  currency: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  trialEndDate: Date;

  @Prop()
  cancelledAt: Date;

  @Prop()
  suspendedAt: Date;

  @Prop()
  nextBillingDate: Date;

  @Prop({ type: Object })
  currentUsage: Record<string, number>; // Track current usage against limits

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  paymentMethodId: string; // External payment method reference

  @Prop({ default: false })
  autoRenew: boolean;
}

export const SaasSubscriptionSchema = SchemaFactory.createForClass(SaasSubscription);
