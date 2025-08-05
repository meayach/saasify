import { IsBoolean, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PasswordPolicyDto {
  @ApiProperty({ description: 'Minimum password length', example: 8 })
  @IsNumber()
  minLength: number;

  @ApiProperty({ description: 'Require uppercase letters' })
  @IsBoolean()
  requireUppercase: boolean;

  @ApiProperty({ description: 'Require lowercase letters' })
  @IsBoolean()
  requireLowercase: boolean;

  @ApiProperty({ description: 'Require numbers' })
  @IsBoolean()
  requireNumbers: boolean;

  @ApiProperty({ description: 'Require special characters' })
  @IsBoolean()
  requireSpecialChars: boolean;
}

export class LoginAttemptsDto {
  @ApiProperty({ description: 'Maximum login attempts', example: 5 })
  @IsNumber()
  maxAttempts: number;

  @ApiProperty({ description: 'Lockout duration in minutes', example: 30 })
  @IsNumber()
  lockoutDuration: number;
}

export class CreateSecuritySettingsDto {
  @ApiProperty({ description: 'Enable two-factor authentication' })
  @IsBoolean()
  twoFactorEnabled: boolean;

  @ApiProperty({ description: 'Session timeout in minutes', example: 120 })
  @IsNumber()
  sessionTimeout: number;

  @ApiProperty({ description: 'Password policy settings' })
  @ValidateNested()
  @Type(() => PasswordPolicyDto)
  passwordPolicy: PasswordPolicyDto;

  @ApiProperty({ description: 'Enable audit logging' })
  @IsBoolean()
  auditLogEnabled: boolean;

  @ApiProperty({ description: 'Login attempt settings' })
  @ValidateNested()
  @Type(() => LoginAttemptsDto)
  loginAttempts: LoginAttemptsDto;

  @ApiPropertyOptional({ description: 'Allowed IP ranges', type: [String] })
  @IsArray()
  @IsOptional()
  allowedIpRanges?: string[];

  @ApiProperty({ description: 'Enable API access' })
  @IsBoolean()
  apiAccessEnabled: boolean;

  @ApiPropertyOptional({ description: 'Webhook URLs', type: [String] })
  @IsArray()
  @IsOptional()
  webhookUrls?: string[];
}

export class UpdateSecuritySettingsDto {
  @ApiPropertyOptional({ description: 'Enable two-factor authentication' })
  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Session timeout in minutes' })
  @IsNumber()
  @IsOptional()
  sessionTimeout?: number;

  @ApiPropertyOptional({ description: 'Password policy settings' })
  @ValidateNested()
  @Type(() => PasswordPolicyDto)
  @IsOptional()
  passwordPolicy?: PasswordPolicyDto;

  @ApiPropertyOptional({ description: 'Enable audit logging' })
  @IsBoolean()
  @IsOptional()
  auditLogEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Login attempt settings' })
  @ValidateNested()
  @Type(() => LoginAttemptsDto)
  @IsOptional()
  loginAttempts?: LoginAttemptsDto;

  @ApiPropertyOptional({ description: 'Allowed IP ranges', type: [String] })
  @IsArray()
  @IsOptional()
  allowedIpRanges?: string[];

  @ApiPropertyOptional({ description: 'Enable API access' })
  @IsBoolean()
  @IsOptional()
  apiAccessEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Webhook URLs', type: [String] })
  @IsArray()
  @IsOptional()
  webhookUrls?: string[];
}
