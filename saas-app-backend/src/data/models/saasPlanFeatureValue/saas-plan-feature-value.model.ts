import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SaasPlanFeatureValueDocument = SaasPlanFeatureValue & Document;

@Schema({ timestamps: true })
export class SaasPlanFeatureValue extends Document {
  @Prop({ type: Types.ObjectId, ref: 'SaasPlan', required: true })
  planId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SaasApplicationFeature', required: true })
  featureId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  value: number;

  @Prop({ default: false })
  isUnlimited: boolean;

  @Prop({ required: true })
  displayValue: string;
}

export const SaasPlanFeatureValueSchema = SchemaFactory.createForClass(SaasPlanFeatureValue);

// Create compound index for planId and featureId to ensure uniqueness
SaasPlanFeatureValueSchema.index({ planId: 1, featureId: 1 }, { unique: true });