import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasApplicationPOJO } from '../saasApplication/saasApplication.pojo.model';
import { SaasPlanPOJO } from '../saasPlan/saasPlan.pojo.model';
import { SaasPricingPOJO } from '../saasPricing/saasPricing.pojo.model';

export type SaasOfferDocument = SaasOfferPOJO & Document;

@Schema()
export class SaasOfferPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop()
  offerName: string;

  @AutoMap(() => SaasApplicationPOJO)
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationPOJO',
  })
  saasApplication: SaasApplicationPOJO;

  @AutoMap(() => SaasPlanPOJO)
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasPlanPOJO',
  })
  plans?: SaasPlanPOJO[];
}

export const SaasOfferSchema = SchemaFactory.createForClass(SaasOfferPOJO);
// index for efficient lookup of offers by application
SaasOfferSchema.index({ saasApplication: 1 });
