import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SaasApplicationConfiguration extends Document {
  @Prop({ type: Types.ObjectId, ref: 'SaasApplication', required: true })
  applicationId: Types.ObjectId;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    default: 'string',
  })
  dataType: string;

  @Prop({ default: false })
  isSecret: boolean;

  @Prop()
  category: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const SaasApplicationConfigurationSchema = SchemaFactory.createForClass(
  SaasApplicationConfiguration,
);
