import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PlanType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM = 'CUSTOM',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  ONE_TIME = 'ONE_TIME',
}

@Schema({ timestamps: true })
export class SaasPlan extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, enum: PlanType, required: true })
  type: PlanType;

  @Prop({ type: String, enum: BillingCycle, required: true })
  billingCycle: BillingCycle;

  @Prop({ required: true })
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'SaasCurrency', required: true })
  currencyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SaasApplication', required: true })
  applicationId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isPopular: boolean;

  @Prop({ type: Object })
  features: Record<string, any>; // Feature limits and permissions

  @Prop({ type: Object })
  limits: Record<string, number>; // Usage limits (users, storage, API calls, etc.)

  @Prop({ type: [String], default: [] })
  includedFeatures: string[];

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const SaasPlanSchema = SchemaFactory.createForClass(SaasPlan);
