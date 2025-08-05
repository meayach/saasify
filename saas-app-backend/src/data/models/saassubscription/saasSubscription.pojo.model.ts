import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasOfferPOJO } from '../saasOffer/saasOffer.pojo.model';
import { SaasSubscriptionHistoryPOJO } from '../SaaSubscriptionHistory/SaasSubscriptionHistory.pojo.model';
import { SaasPlanPOJO } from '../saasPlan/saasPlan.pojo.model';

export type SaasSubscriptionDocument = SaasSubscriptionPOJO & Document;

@Schema()
export class SaasSubscriptionPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @Prop()
  @AutoMap()
  type: string;

  // relation to one Offer
  @AutoMap(() => SaasOfferPOJO)
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasOfferPOJO',
  })
  offer?: SaasOfferPOJO;

  // relation to Many SubscriptionHistory
  @AutoMap(() => [SaasSubscriptionHistoryPOJO])
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasSubscriptionHistoryPOJO',
  })
  subscriptionHistory?: SaasSubscriptionHistoryPOJO[];

  // relation to one Plan
  @AutoMap(() => SaasPlanPOJO)
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasPlanPOJO',
  })
  plan?: SaasPlanPOJO;
}

export const SaasSubscriptionSchema = SchemaFactory.createForClass(SaasSubscriptionPOJO);
