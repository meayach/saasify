import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UserPOJO } from '../user/user.pojo.model';
import { SaasWorkspacePOJO } from '../saasworkspace/saasWorkspace.pojo.model';
import { SaasCustomerAdminPOJO } from '../saasCustomerAdmin/saasCustomerAdmin.pojo.model';

export type SaasOwnerDocument = SaasOwnerPOJO & Document;

@Schema()
export class SaasOwnerPOJO extends SaasCustomerAdminPOJO {
  @AutoMap()
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasWorkspacePOJO',
  })
  ownerWorkspace?: SaasWorkspacePOJO;
}

export const SaasOwnerSchema = SchemaFactory.createForClass(SaasOwnerPOJO);
