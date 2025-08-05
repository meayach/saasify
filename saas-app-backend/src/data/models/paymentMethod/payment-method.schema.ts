import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentMethodDocument = PaymentMethod & Document;

@Schema({ timestamps: true })
export class PaymentMethod {
  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  type: string; // 'card', 'paypal', etc.

  @Prop({ required: false })
  last4: string;

  @Prop({ required: false })
  brand: string;

  @Prop({ required: false })
  expiryMonth: number;

  @Prop({ required: false })
  expiryYear: number;

  @Prop({ required: true, default: false })
  isDefault: boolean;

  @Prop({ required: false })
  stripePaymentMethodId: string;

  @Prop({ required: false })
  paypalAccountId: string;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);
