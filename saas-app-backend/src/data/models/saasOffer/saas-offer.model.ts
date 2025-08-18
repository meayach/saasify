import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OfferType {
  DISCOUNT = 'DISCOUNT',
  TRIAL_EXTENSION = 'TRIAL_EXTENSION',
  UPGRADE = 'UPGRADE',
  SEASONAL = 'SEASONAL',
  PROMOTIONAL = 'PROMOTIONAL',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_MONTHS = 'FREE_MONTHS',
}

@Schema({ timestamps: true })
export class SaasOffer extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, enum: OfferType, required: true })
  type: OfferType;

  @Prop({ type: String, enum: DiscountType })
  discountType: DiscountType;

  @Prop()
  discountValue: number; // Percentage or fixed amount

  @Prop({ type: Types.ObjectId, ref: 'SaasCurrency' })
  currencyId: Types.ObjectId;

  @Prop({ required: true })
  validFrom: Date;

  @Prop({ required: true })
  validUntil: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'SaasPlan' }] })
  applicablePlans: Types.ObjectId[]; // Plans this offer applies to

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  maxUsage: number; // Maximum number of times this offer can be used

  @Prop({ default: 0 })
  currentUsage: number; // Current usage count

  @Prop()
  couponCode: string; // Optional coupon code

  @Prop({ type: Object })
  conditions: Record<string, any>; // Additional conditions for the offer

  @Prop({ type: Types.ObjectId, ref: 'SaasApplication', required: true })
  applicationId: Types.ObjectId;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const SaasOfferSchema = SchemaFactory.createForClass(SaasOffer);
