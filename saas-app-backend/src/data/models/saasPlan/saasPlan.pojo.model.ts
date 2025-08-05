import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasApplicationPOJO } from '../saasApplication/saasApplication.pojo.model';
import { SaasPricingPOJO } from '../saasPricing/saasPricing.pojo.model';
import { SaasOfferPOJO } from '../saasOffer/saasOffer.pojo.model';

export type SaasPlanDocument = SaasPlanPOJO & Document;

@Schema()
export class SaasPlanPOJO {
  @Prop()
  planName: string;

  @AutoMap()
  @Prop()
  groupId: string;

  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap(() => SaasApplicationPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationPOJO',
  })
  appliation?: SaasApplicationPOJO;

  @AutoMap(() => [SaasOfferPOJO])
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasOfferPOJO',
  })
  offers?: SaasOfferPOJO[];

  // one to many
  @AutoMap(() => [SaasPricingPOJO])
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasPricingPOJO',
  })
  pricing?: SaasPricingPOJO[];
}

export const SaasPlanSchema = SchemaFactory.createForClass(SaasPlanPOJO);
