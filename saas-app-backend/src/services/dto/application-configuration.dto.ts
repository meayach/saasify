import { AutoMap } from '@automapper/classes';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class PaymentMethodsDto {
  @AutoMap()
  @IsOptional()
  @IsBoolean()
  paypal?: boolean;

  @AutoMap()
  @IsOptional()
  @IsBoolean()
  wize?: boolean;

  @AutoMap()
  @IsOptional()
  @IsBoolean()
  payonner?: boolean;
}

export class ApplicationConfigurationCreateDto {
  @AutoMap()
  @IsString()
  applicationId: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  applicationName?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  domainName?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  logoPath?: string;

  @AutoMap()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @AutoMap()
  @IsOptional()
  paymentMethods?: PaymentMethodsDto;
}

export class ApplicationConfigurationUpdateDto {
  @AutoMap()
  @IsOptional()
  @IsString()
  applicationName?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  domainName?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  logoPath?: string;

  @AutoMap()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @AutoMap()
  @IsOptional()
  paymentMethods?: PaymentMethodsDto;
}

export class CreateApplicationConfigurationDto extends ApplicationConfigurationCreateDto {}
export class UpdateApplicationConfigurationDto extends ApplicationConfigurationUpdateDto {}
