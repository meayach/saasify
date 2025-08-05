import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SecuritySettingsDocument = SecuritySettings & Document;

@Schema()
export class PasswordPolicy {
  @Prop({ required: true, default: 8 })
  minLength: number;

  @Prop({ required: true, default: true })
  requireUppercase: boolean;

  @Prop({ required: true, default: true })
  requireLowercase: boolean;

  @Prop({ required: true, default: true })
  requireNumbers: boolean;

  @Prop({ required: true, default: false })
  requireSpecialChars: boolean;
}

@Schema()
export class LoginAttempts {
  @Prop({ required: true, default: 5 })
  maxAttempts: number;

  @Prop({ required: true, default: 30 })
  lockoutDuration: number; // en minutes
}

@Schema({ timestamps: true })
export class SecuritySettings {
  @Prop({ required: true, default: false })
  twoFactorEnabled: boolean;

  @Prop({ required: true, default: 120 })
  sessionTimeout: number; // en minutes

  @Prop({ type: PasswordPolicy, required: true })
  passwordPolicy: PasswordPolicy;

  @Prop({ required: true, default: true })
  auditLogEnabled: boolean;

  @Prop({ type: LoginAttempts, required: true })
  loginAttempts: LoginAttempts;

  @Prop({ type: [String], default: [] })
  allowedIpRanges: string[];

  @Prop({ required: true, default: true })
  apiAccessEnabled: boolean;

  @Prop({ type: [String], default: [] })
  webhookUrls: string[];
}

export const SecuritySettingsSchema = SchemaFactory.createForClass(SecuritySettings);
