import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  planId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'EUR' })
  currency: string;

  @Prop({ required: true, enum: ['pending', 'paid', 'failed', 'cancelled'] })
  status: 'pending' | 'paid' | 'failed' | 'cancelled';

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ required: false })
  paidDate: Date;

  @Prop({ required: false })
  stripeInvoiceId: string;

  @Prop({ required: false })
  paypalInvoiceId: string;

  @Prop({ required: true })
  invoiceNumber: string;

  @Prop({ type: Object, required: false })
  metadata: any;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
