import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasWorkspacePOJO } from '@Data/models/saasworkspace/saasWorkspace.pojo.model';
import { UserRolePOJO } from './user.role.pojo.model';

export type UserDocument = UserPOJO & Document;

@Schema()
export class UserPOJO {
  _id: mongoose.Schema.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true, unique: true })
  username: string;

  @AutoMap()
  @Prop({ required: true, unique: true })
  email: string;

  @AutoMap()
  @Prop()
  firstName: string;

  @AutoMap()
  @Prop()
  lastName: string;

  @AutoMap()
  @Prop()
  realmUserId: string;

  @AutoMap()
  @Prop()
  createdAt: Date;

  @AutoMap()
  @Prop()
  activated: boolean;

  @AutoMap()
  @Prop()
  userRole?: UserRolePOJO;

  @AutoMap()
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @AutoMap()
  @Prop()
  streetAddress: string;

  @AutoMap()
  @Prop()
  streetAddressTwo: string;

  @AutoMap()
  @Prop()
  city: string;

  @AutoMap()
  @Prop()
  state: string;

  @AutoMap()
  @Prop()
  zipCode: string;

  @AutoMap()
  @Prop({ required: true })
  password: string;

  @AutoMap()
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasWorkspacePOJO',
  })
  workspace?: SaasWorkspacePOJO;
}

export const UserSchema = SchemaFactory.createForClass(UserPOJO);
