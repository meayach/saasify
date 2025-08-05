import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasSubscriptionPOJO } from '../saassubscription/saasSubscription.pojo.model';
import { UserPOJO } from '../user/user.pojo.model';

export type SaasSubscriberDocument = SaasSubscriberPOJO & Document;

@Schema()
export class SaasSubscriberPOJO extends UserPOJO {
  ////

  // i have some automap error here
  //@AutoMap(() => SaasSubscriptionPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasSubscriptionPOJO',
  })
  subscription: SaasSubscriptionPOJO;
}

export const SaasSubscriberSchema = SchemaFactory.createForClass(SaasSubscriberPOJO);
