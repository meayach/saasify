import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  ONE_TIME = 'ONE_TIME',
  UPGRADE = 'UPGRADE',
  DOWNGRADE = 'DOWNGRADE',
}

@Schema({ timestamps: true })
export class SaasPayment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SaasSubscription' })
  subscriptionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SaasPlan', required: true })
  planId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'SaasCurrency', required: true })
  currencyId: Types.ObjectId;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ type: String, enum: PaymentType, required: true })
  type: PaymentType;

  @Prop()
  paymentMethodId: string; // External payment method reference

  @Prop()
  transactionId: string; // External transaction reference

  @Prop()
  paymentGateway: string; // Stripe, PayPal, etc.

  @Prop()
  paymentDate: Date;

  @Prop()
  failureReason: string;

  @Prop({ type: Object })
  gatewayResponse: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  invoiceUrl: string;

  @Prop()
  receiptUrl: string;
}

export const SaasPaymentSchema = SchemaFactory.createForClass(SaasPayment);
