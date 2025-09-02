import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SaasApplicationFeatureDocument = SaasApplicationFeature & Document;

@Schema({ timestamps: true })
export class SaasApplicationFeature extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  unitDisplayName: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'SaasApplication', required: true })
  applicationId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const SaasApplicationFeatureSchema = SchemaFactory.createForClass(SaasApplicationFeature);

// Create compound index for applicationId and key to ensure uniqueness per application
SaasApplicationFeatureSchema.index({ applicationId: 1, key: 1 }, { unique: true });