import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanDocument = Plan & Document;

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, enum: ['month', 'year'] })
  interval: 'month' | 'year';

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: false })
  stripeProductId: string;

  @Prop({ required: false })
  stripePriceId: string;

  @Prop({ required: true, default: 0 })
  maxUsers: number;

  @Prop({ required: true, default: 0 })
  maxApplications: number;

  @Prop({ required: true, default: false })
  hasApiAccess: boolean;

  @Prop({ required: true, default: false })
  hasAdvancedAnalytics: boolean;

  @Prop({ required: true, default: false })
  hasPrioritySupport: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
