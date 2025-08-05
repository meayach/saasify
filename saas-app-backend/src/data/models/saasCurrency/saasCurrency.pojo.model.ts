import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasPricingPOJO } from '../saasPricing/saasPricing.pojo.model';

export type SaasCurrencyDocument = SaasCurrencyPOJO & Document;

@Schema()
export class SaasCurrencyPOJO {
  // zero to one
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop()
  name: string;

  @AutoMap()
  @Prop()
  symbol: string;

  @AutoMap(() => [SaasPricingPOJO])
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasPricingPOJO',
  })
  prices?: SaasPricingPOJO[];
}

export const SaasCurrencySchema = SchemaFactory.createForClass(SaasCurrencyPOJO);
