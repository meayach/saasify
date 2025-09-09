import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PlanFeatureService } from '../../services/planFeature/planFeature.service';
import { FeatureStatus } from '../../data/models/feature/feature.pojo.model';

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
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Plan features retrieved successfully' })
  async getPlanFeatures(
    @Param('planId') planId: string,
    @Query('includeInactive') includeInactive?: boolean,
  ) {
    try {
      this.logger.log(`Getting features for plan: ${planId}`);

      const planFeatures = await this.planFeatureService.getPlanFeatures(planId, includeInactive);

      return planFeatures;
    } catch (error) {
      this.logger.error(`Error getting plan features for ${planId}:`, error);
      throw new HttpException('Failed to retrieve plan features', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('plan/:planId/features')
  @ApiOperation({ summary: 'Configure features for a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan features configured successfully' })
  @ApiResponse({ status: 400, description: 'Invalid configuration data' })
  async configurePlanFeatures(
    @Param('planId') planId: string,
    @Body() features: CreatePlanFeatureConfigurationDto[],
  ) {
    try {
      this.logger.log(`Configuring features for plan ${planId}: ${JSON.stringify(features)}`);

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

      const result = await this.planFeatureService.configurePlanFeatures(planId, features);

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

  @Put('plan/:planId/feature/:featureId')
  @ApiOperation({ summary: 'Update a specific feature configuration for a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Feature configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Feature configuration not found' })
  async updatePlanFeature(
    @Param('planId') planId: string,
    @Param('featureId') featureId: string,
    @Body() updateDto: UpdatePlanFeatureConfigurationDto,
  ) {
    try {
      this.logger.log(
        `Updating feature ${featureId} for plan ${planId}: ${JSON.stringify(updateDto)}`,
      );

      const result = await this.planFeatureService.updatePlanFeature(planId, featureId, updateDto);

      if (!result) {
        throw new HttpException('Feature configuration not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(
        `Feature configuration updated successfully for plan ${planId}, feature ${featureId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Error updating plan feature ${featureId} for plan ${planId}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update feature configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('plan/:planId/feature/:featureId')
  @ApiOperation({ summary: 'Remove a feature from a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Feature removed from plan successfully' })
  @ApiResponse({ status: 404, description: 'Feature configuration not found' })
  async removePlanFeature(@Param('planId') planId: string, @Param('featureId') featureId: string) {
    try {
      this.logger.log(`Removing feature ${featureId} from plan ${planId}`);

      const result = await this.planFeatureService.removePlanFeature(planId, featureId);

      if (!result) {
        throw new HttpException('Feature configuration not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(`Feature ${featureId} removed from plan ${planId} successfully`);
      return { message: 'Feature removed from plan successfully' };
    } catch (error) {
      this.logger.error(`Error removing plan feature ${featureId} from plan ${planId}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to remove feature from plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('plan/:planId/feature/:featureId/consumption')
  @ApiOperation({ summary: 'Get consumption data for a plan feature' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Consumption data retrieved successfully' })
  async getFeatureConsumption(
    @Param('planId') planId: string,
    @Param('featureId') featureId: string,
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      this.logger.log(`Getting consumption for feature ${featureId} in plan ${planId}`);

      const consumption = await this.planFeatureService.getFeatureConsumption(planId, featureId, {
        period: period as any,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });

      return consumption;
    } catch (error) {
      this.logger.error(
        `Error getting consumption for feature ${featureId} in plan ${planId}:`,
        error,
      );
      throw new HttpException(
        'Failed to retrieve consumption data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('plan/:planId/feature/:featureId/consumption')
  @ApiOperation({ summary: 'Record consumption for a plan feature' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({ status: 201, description: 'Consumption recorded successfully' })
  async recordConsumption(
    @Param('planId') planId: string,
    @Param('featureId') featureId: string,
    @Body()
    consumptionData: {
      subscriptionId: string;
      quantity: number;
      metadata?: any;
    },
  ) {
    try {
      this.logger.log(`Recording consumption for feature ${featureId} in plan ${planId}`);

      const result = await this.planFeatureService.recordConsumption(
        planId,
        featureId,
        consumptionData.subscriptionId,
        consumptionData.quantity,
        consumptionData.metadata,
      );

      this.logger.log(
        `Consumption recorded successfully for feature ${featureId} in plan ${planId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error recording consumption for feature ${featureId} in plan ${planId}:`,
        error,
      );
      throw new HttpException('Failed to record consumption', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('feature/:featureId/plans')
  @ApiOperation({ summary: 'Get all plans that use a specific feature' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getPlansWithFeature(@Param('featureId') featureId: string) {
    try {
      this.logger.log(`Getting plans that use feature: ${featureId}`);

      const plans = await this.planFeatureService.getPlansWithFeature(featureId);

      return plans;
    } catch (error) {
      this.logger.error(`Error getting plans with feature ${featureId}:`, error);
      throw new HttpException('Failed to retrieve plans', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
