import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasSubscriptionPOJO } from '../saassubscription/saasSubscription.pojo.model';
import { UserPOJO } from '../user/user.pojo.model';

export type SaasCustomerAdminDocument = SaasCustomerAdminPOJO & Document;

@Schema()
export class SaasCustomerAdminPOJO extends UserPOJO {}

export const SaasCustomerAdminSchema = SchemaFactory.createForClass(SaasCustomerAdminPOJO);
