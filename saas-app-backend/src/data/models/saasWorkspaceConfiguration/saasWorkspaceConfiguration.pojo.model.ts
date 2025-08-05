import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasWorkspacePOJO } from '@Data/models/saasworkspace/saasWorkspace.pojo.model';

import { SaasPaymentMethodConfigurationPOJO } from '../saasPaymentMethodConfiguration/saasPaymentMethodConfiguration.pojo.model';

export type SaasWorkspaceConfigurationDocument = SaasWorkspaceConfigurationPOJO & Document;

@Schema()
export class SaasWorkspaceConfigurationPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap(() => SaasWorkspacePOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasWorkspacePOJO',
  })
  workspace?: SaasWorkspacePOJO;
  // one to many
  @AutoMap(() => [SaasPaymentMethodConfigurationPOJO])
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasPaymentMethodConfigurationPOJO',
  })
  paymentMethodConfigurations?: SaasPaymentMethodConfigurationPOJO[];
}

export const SaasWorkspaceConfigurationSchema = SchemaFactory.createForClass(
  SaasWorkspaceConfigurationPOJO,
);
