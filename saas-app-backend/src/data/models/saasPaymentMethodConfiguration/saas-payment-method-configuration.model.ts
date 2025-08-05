import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CRYPTO = 'CRYPTO',
}

@Schema({ timestamps: true })
export class SaasPaymentMethodConfiguration extends Document {
  @Prop({ type: Types.ObjectId, ref: 'SaasApplication', required: true })
  applicationId: Types.ObjectId;

  @Prop({ type: String, enum: PaymentMethodType, required: true })
  type: PaymentMethodType;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  configuration: Record<string, any>; // Gateway-specific configuration

  @Prop({ type: [String], default: [] })
  supportedCurrencies: string[]; // Currency codes

  @Prop({ type: Object })
  fees: Record<string, number>; // Processing fees

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const SaasPaymentMethodConfigurationSchema = SchemaFactory.createForClass(
  SaasPaymentMethodConfiguration,
);
