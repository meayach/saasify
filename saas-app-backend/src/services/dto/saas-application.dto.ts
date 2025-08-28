import { IsString, IsEnum, IsOptional, IsUrl, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ApplicationStatus,
  ApplicationType,
} from '../../data/models/saasApplication/saas-application.model';

export class CreateSaasApplicationDto {
  @ApiProperty({ description: 'Application name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Application description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ApplicationType, description: 'Application type' })
  @IsEnum(ApplicationType)
  type: ApplicationType;

  @ApiProperty({ description: 'Application slug (unique identifier)' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Application logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Application website URL' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({ description: 'Application API URL' })
  @IsOptional()
  @IsUrl()
  apiUrl?: string;

  @ApiPropertyOptional({ description: 'Application tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Application settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Application metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateSaasApplicationDto {
  @ApiPropertyOptional({ description: 'Application name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Application description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ApplicationStatus, description: 'Application status' })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ description: 'Application logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Application website URL' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({ description: 'Application API URL' })
  @IsOptional()
  @IsUrl()
  apiUrl?: string;

  @ApiPropertyOptional({ description: 'Application tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Application settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Application metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SaasApplicationResponseDto {
  @ApiProperty({ description: 'Application ID' })
  id: string;

  @ApiProperty({ description: 'Application name' })
  name: string;

  @ApiProperty({ description: 'Application description' })
  description: string;

  @ApiProperty({ enum: ApplicationStatus, description: 'Application status' })
  status: ApplicationStatus;

  @ApiProperty({ enum: ApplicationType, description: 'Application type' })
  type: ApplicationType;

  @ApiProperty({ description: 'Owner ID' })
  ownerId: string;

  @ApiProperty({ description: 'Application slug' })
  slug: string;

  @ApiPropertyOptional({ description: 'Application logo URL' })
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Application website URL' })
  websiteUrl?: string;

  @ApiPropertyOptional({ description: 'Application API URL' })
  apiUrl?: string;

  @ApiProperty({ description: 'Application tags', type: [String] })
  tags: string[];

  @ApiPropertyOptional({ description: 'Application launch date' })
  launchedAt?: Date;

  @ApiPropertyOptional({ description: 'Application deployed date' })
  deployedAt?: Date;

  @ApiProperty({ description: 'Application creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Application last update date' })
  updatedAt: Date;
}
