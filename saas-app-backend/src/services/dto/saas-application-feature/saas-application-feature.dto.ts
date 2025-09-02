import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaasApplicationFeatureDto {
  @ApiProperty({ description: 'Feature name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Feature unique key' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ description: 'Display name for the unit' })
  @IsString()
  @IsNotEmpty()
  unitDisplayName: string;

  @ApiPropertyOptional({ description: 'Feature description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Application ID' })
  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @ApiPropertyOptional({ description: 'Is feature active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateSaasApplicationFeatureDto {
  @ApiPropertyOptional({ description: 'Feature name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'Feature unique key' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  key?: string;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  unit?: string;

  @ApiPropertyOptional({ description: 'Display name for the unit' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  unitDisplayName?: string;

  @ApiPropertyOptional({ description: 'Feature description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is feature active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}