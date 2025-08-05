import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BillingSettingsDocument = BillingSettings & Document;

@Schema({ timestamps: true })
export class BillingSettings {
  @Prop({ required: true, default: 'EUR' })
  defaultCurrency: string;

  @Prop({ required: true, default: 0 })
  taxRate: number;

  @Prop({ required: false })
  companyAddress: string;

  @Prop({ type: [String], default: ['stripe', 'paypal'] })
  paymentMethods: string[];

  @Prop({ required: false })
  stripeKey: string;

  @Prop({ required: false })
  paypalClientId: string;

  @Prop({ required: true, default: true })
  autoRenewal: boolean;

  @Prop({ required: true, default: 30 })
  invoiceDueDays: number;

  @Prop({ required: false })
  companyName: string;

  @Prop({ required: false })
  companyEmail: string;

  @Prop({ required: false })
  companyPhone: string;
}

export const BillingSettingsSchema = SchemaFactory.createForClass(BillingSettings);
