import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PlanFeatureService } from '../../services/planFeature/planFeature.service';
import { FeatureStatus } from '../../data/models/featurePlanConfiguration/featurePlanConfiguration.pojo.model';

// DTOs for API requests/responses
export class CreatePlanFeatureConfigurationDto {
  planId!: string;
  featureId!: string;
  status!: FeatureStatus;
  priority?: number;
  customFieldValues?: Array<{
    fieldId: string;
    value: any;
  }>;
}

export class UpdatePlanFeatureConfigurationDto {
  status?: FeatureStatus;
  priority?: number;
  customFieldValues?: Array<{
    fieldId: string;
    value: any;
  }>;
}

export class PlanFeaturesDto {
  planId!: string;
  features!: CreatePlanFeatureConfigurationDto[];
}

@ApiTags('Plan Features')
@Controller('api/plan-features')
export class PlanFeatureController {
  private readonly logger = new Logger(PlanFeatureController.name);

  constructor(private readonly planFeatureService: PlanFeatureService) {}

  @Get('plan/:planId')
  @ApiOperation({ summary: 'Get all features for a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiQuery({ name: 'applicationId', required: true })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Plan features retrieved successfully' })
  async getPlanFeatures(
    @Param('planId') planId: string,
    @Query('applicationId') applicationId: string,
    @Query('includeInactive') includeInactive?: boolean,
  ) {
    try {
      this.logger.log(`Getting features for plan: ${planId}, application: ${applicationId}`);

      const planFeatures = await this.planFeatureService.getPlanFeatures(planId, applicationId);

      return planFeatures;
    } catch (error) {
      this.logger.error(`Error getting plan features for ${planId}:`, error);
      throw new HttpException('Failed to retrieve plan features', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('plan/:planId/features')
  @ApiOperation({ summary: 'Configure features for a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiQuery({ name: 'applicationId', required: true })
  @ApiResponse({ status: 200, description: 'Plan features configured successfully' })
  @ApiResponse({ status: 400, description: 'Invalid configuration data' })
  async configurePlanFeatures(
    @Param('planId') planId: string,
    @Query('applicationId') applicationId: string,
    @Body() features: CreatePlanFeatureConfigurationDto[],
  ) {
    try {
      this.logger.log(
        `Configuring features for plan ${planId}, application ${applicationId}: ${JSON.stringify(
          features,
        )}`,
      );

      // Validate features array
      if (!Array.isArray(features)) {
        throw new HttpException('Features must be an array', HttpStatus.BAD_REQUEST);
      }

      // Validate each feature configuration
      for (const feature of features) {
        if (!feature.featureId || !feature.status) {
          throw new HttpException(
            'Each feature must have featureId and status',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Map the DTOs to the service interface
      const mappedFeatures = features.map((feature) => ({
        featureId: feature.featureId,
        status: feature.status,
        customDisplayName: '',
        customDescription: '',
        isHighlighted: false,
        highlightText: '',
        sortOrder: feature.priority || 0,
        fieldValues:
          feature.customFieldValues?.map((cfv) => ({
            customFieldId: cfv.fieldId,
            fieldValue: cfv.value,
            isUnlimited: false,
            displayValue: cfv.value?.toString() || '',
          })) || [],
      }));

      const result = await this.planFeatureService.configurePlanFeatures(
        planId,
        applicationId,
        mappedFeatures,
      );

      this.logger.log(`Plan features configured successfully for plan: ${planId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error configuring plan features for ${planId}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to configure plan features',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
