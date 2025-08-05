import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CUSTOMER_ADMIN = 'CUSTOMER_ADMIN',
  CUSTOMER_MANAGER = 'CUSTOMER_MANAGER',
  CUSTOMER_DEVELOPER = 'CUSTOMER_DEVELOPER',
  END_USER = 'END_USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Prop()
  keycloakId: string;

  @Prop()
  phone: string;

  @Prop()
  avatar: string;

  @Prop({ type: Date })
  lastLoginAt: Date;

  @Prop({ type: Object })
  preferences: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  // Timestamps are automatically added by Mongoose when timestamps: true
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
