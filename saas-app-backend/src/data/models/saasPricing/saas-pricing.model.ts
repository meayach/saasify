import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PricingModel {
  FLAT_RATE = 'FLAT_RATE',
  TIERED = 'TIERED',
  VOLUME = 'VOLUME',
  USAGE_BASED = 'USAGE_BASED',
  FREEMIUM = 'FREEMIUM',
}

export enum BillingInterval {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY',
}

@Schema({ timestamps: true })
export class SaasPricing extends Document {
  @Prop({ type: Types.ObjectId, ref: 'SaasPlan', required: true })
  planId: Types.ObjectId;

  @Prop({ type: String, enum: PricingModel, required: true })
  model: PricingModel;

  @Prop({ type: String, enum: BillingInterval, required: true })
  interval: BillingInterval;

  @Prop({ required: true })
  basePrice: number;

  @Prop({ type: Types.ObjectId, ref: 'SaasCurrency', required: true })
  currencyId: Types.ObjectId;

  // Tiered pricing structure
  @Prop({ type: [Object] })
  tiers: Array<{
    from: number;
    to?: number; // null/undefined means unlimited
    price: number;
    flatFee?: number; // Optional flat fee for this tier
  }>;

  // Usage-based pricing
  @Prop({ type: Object })
  usageMetrics: Record<
    string,
    {
      unit: string; // requests, users, GB, etc.
      price: number; // price per unit
      includedQuantity?: number; // included in base price
    }
  >;

  // Setup fees
  @Prop({ default: 0 })
  setupFee: number;

  // Trial configuration
  @Prop({ default: 0 })
  trialDays: number;

  @Prop({ default: true })
  trialRequiresCreditCard: boolean;

  // Discounts
  @Prop({ type: Object })
  discounts: {
    annual?: number; // Discount percentage for annual billing
    volume?: Array<{
      minQuantity: number;
      discount: number; // percentage
    }>;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'SaasApplication', required: true })
  applicationId: Types.ObjectId;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const SaasPricingSchema = SchemaFactory.createForClass(SaasPricing);
