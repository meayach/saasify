import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasOfferPOJO } from '../saasOffer/saasOffer.pojo.model';
import { SaasPlanPOJO } from '../saasPlan/saasPlan.pojo.model';
import { SaasCurrencyPOJO } from '../saasCurrency/saasCurrency.pojo.model';

export type SaasPricingDocument = SaasPricingPOJO & Document;

@Schema()
export class SaasPricingPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop()
  price: number;

  @AutoMap(() => SaasOfferPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasOfferPOJO',
  })
  offer?: SaasOfferPOJO;

  @AutoMap(() => SaasPlanPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasPlanPOJO',
  })
  plan?: SaasPlanPOJO;

  @AutoMap(() => SaasCurrencyPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasCurrencyPOJO',
  })
  currency?: SaasCurrencyPOJO;
}

export const SaasPricingSchema = SchemaFactory.createForClass(SaasPricingPOJO);
