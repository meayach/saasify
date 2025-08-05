import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoMap } from '@automapper/classes';
import mongoose from 'mongoose';
import { UserPOJO } from '../user/user.pojo.model';
import { SaasWorkspaceConfigurationPOJO } from '../saasWorkspaceConfiguration/saasWorkspaceConfiguration.pojo.model';
import { SaasApplicationPOJO } from '../saasApplication/saasApplication.pojo.model';
import { SaasOwnerPOJO } from '../SaasOwner/saasOwner.pojo.model';

export type SaasWorkspaceDocument = SaasWorkspacePOJO & Document;

@Schema()
export class SaasWorkspacePOJO {
  @AutoMap()
  _id: mongoose.ObjectId;

  @Prop()
  @AutoMap()
  realmId: string;

  @Prop()
  @AutoMap()
  workspaceName: string;

  @Prop()
  @AutoMap()
  createdAt: Date;

  @AutoMap(() => SaasOwnerPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasOwnerPOJO',
  })
  owner: SaasOwnerPOJO;

  @AutoMap(() => [UserPOJO])
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPOJO',
  })
  users?: UserPOJO[];

  @AutoMap(() => SaasWorkspaceConfigurationPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasWorkspaceConfigurationPOJO',
  })
  workspaceConfiguration?: SaasWorkspaceConfigurationPOJO;

  // one to many
  @AutoMap(() => [SaasApplicationPOJO])
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasApplicationPOJO',
  })
  applications?: SaasApplicationPOJO[];
}

export const SaasWorkspaceSchema = SchemaFactory.createForClass(SaasWorkspacePOJO);
