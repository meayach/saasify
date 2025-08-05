import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SaasCurrency extends Document {
  @Prop({ required: true, unique: true })
  code: string; // USD, EUR, GBP, etc.

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string; // $, €, £, etc.

  @Prop({ default: 2 })
  decimalPlaces: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 1.0 })
  exchangeRate: number; // Exchange rate relative to base currency (USD)

  @Prop({ type: Date })
  lastUpdated: Date;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const SaasCurrencySchema = SchemaFactory.createForClass(SaasCurrency);
