import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
}

export enum CardBrand {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  AMERICAN_EXPRESS = 'AMERICAN_EXPRESS',
  DISCOVER = 'DISCOVER',
  DINERS_CLUB = 'DINERS_CLUB',
  JCB = 'JCB',
}

@Schema({ timestamps: true })
export class PaymentMethod extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: PaymentMethodType, required: true })
  type: PaymentMethodType;

  @Prop({ required: true })
  isDefault: boolean;

  @Prop({ default: true })
  isActive: boolean;

  // Card-specific fields
  @Prop()
  last4: string; // Last 4 digits of card

  @Prop({ type: String, enum: CardBrand })
  brand: CardBrand;

  @Prop()
  expiryMonth: number;

  @Prop()
  expiryYear: number;

  @Prop()
  holderName: string;

  // Gateway-specific fields
  @Prop()
  gatewayPaymentMethodId: string; // Stripe payment method ID, PayPal account ID, etc.

  @Prop()
  gatewayCustomerId: string; // Stripe customer ID, PayPal payer ID, etc.

  @Prop({ default: 'stripe' })
  gateway: string; // Payment gateway (stripe, paypal, etc.)

  // Billing address
  @Prop({ type: Object })
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  fingerprint: string; // Unique identifier for the payment method

  @Prop()
  lastUsed: Date;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);
