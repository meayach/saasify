import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  PlanFeatureService,
  PlanFeatureConfigDto,
} from '../../services/planFeature/planFeature.service';

@ApiTags('Plan Features')
@Controller('plans')
export class PlanFeatureController {
  constructor(private readonly planFeatureService: PlanFeatureService) {}

  @Post(':planId/features')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Configure features for a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 201, description: 'Plan features configured successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Plan or features not found' })
  async configurePlanFeatures(
    @Param('planId') planId: string,
    @Body() body: { applicationId: string; features: PlanFeatureConfigDto[] },
  ) {
    return this.planFeatureService.configurePlanFeatures(planId, body.applicationId, body.features);
  }

  @Get(':planId/features')
  @ApiOperation({ summary: 'Get all features configured for a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan features retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlanFeatures(@Param('planId') planId: string, @Body() body: { applicationId: string }) {
    return this.planFeatureService.getPlanFeatures(planId, body.applicationId);
  }

  @Post(':planId/features/:featureId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a feature to a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({ status: 201, description: 'Feature added to plan successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Plan or feature not found' })
  async addFeatureToPlan(
    @Param('planId') planId: string,
    @Param('featureId') featureId: string,
    @Body() body: { applicationId: string } & Omit<PlanFeatureConfigDto, 'featureId'>,
  ) {
    const { applicationId, ...configDto } = body;
    return this.planFeatureService.addFeatureToPlan(planId, featureId, applicationId, configDto);
  }

  @Put(':planId/features/:featureId')
  @ApiOperation({ summary: 'Update feature configuration for a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Feature configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Plan or feature configuration not found' })
  async updateFeatureConfiguration(
    @Param('planId') planId: string,
    @Param('featureId') featureId: string,
    @Body() body: { applicationId: string } & Partial<Omit<PlanFeatureConfigDto, 'featureId'>>,
  ) {
    const { applicationId, ...updateData } = body;
    return this.planFeatureService.updateFeatureConfiguration(
      planId,
      featureId,
      applicationId,
      updateData,
    );
  }

  @Delete(':planId/features/:featureId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a feature from a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({ status: 204, description: 'Feature removed from plan successfully' })
  @ApiResponse({ status: 404, description: 'Plan or feature configuration not found' })
  async removeFeatureFromPlan(
    @Param('planId') planId: string,
    @Param('featureId') featureId: string,
    @Body() body: { applicationId: string },
  ) {
    await this.planFeatureService.removeFeatureFromPlan(planId, featureId, body.applicationId);
  }

  @Get('applications/:applicationId/available-features')
  @ApiOperation({ summary: 'Get available features for an application' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Available features retrieved successfully' })
  async getAvailableFeatures(@Param('applicationId') applicationId: string) {
    return this.planFeatureService.getAvailableFeatures(applicationId);
  }

  @Put(':planId/features/order')
  @ApiOperation({ summary: 'Update the order of features in a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Feature order updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateFeatureOrder(
    @Param('planId') planId: string,
    @Body()
    body: {
      applicationId: string;
      featureOrders: Array<{ featureId: string; sortOrder: number }>;
    },
  ) {
    return this.planFeatureService.updateFeatureOrder(
      planId,
      body.applicationId,
      body.featureOrders,
    );
  }
}
