import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  SaasPlanFeatureValueService,
  CreatePlanFeatureValueDto,
  UpdatePlanFeatureValueDto,
} from '../../services/feature/saas-plan-feature-value.service';

export interface BulkUpdatePlanFeaturesDto {
  features: Array<{
    featureId: string;
    value: number;
    isUnlimited?: boolean;
  }>;
}

@ApiTags('Plan Feature Values')
@Controller('api/v1/plans/:planId/features')
export class SaasPlanFeatureValueController {
  constructor(private readonly planFeatureValueService: SaasPlanFeatureValueService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a feature value for a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 201, description: 'Plan feature value created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Param('planId') planId: string,
    @Body() createDto: Omit<CreatePlanFeatureValueDto, 'planId'>,
  ) {
    return this.planFeatureValueService.create({
      ...createDto,
      planId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all feature values for a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan feature values retrieved successfully' })
  async findAll(@Param('planId') planId: string) {
    return this.planFeatureValueService.findByPlanId(planId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific plan feature value' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiParam({ name: 'id', description: 'Plan feature value ID' })
  @ApiResponse({ status: 200, description: 'Plan feature value retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan feature value not found' })
  async findOne(@Param('id') id: string) {
    return this.planFeatureValueService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a plan feature value' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiParam({ name: 'id', description: 'Plan feature value ID' })
  @ApiResponse({ status: 200, description: 'Plan feature value updated successfully' })
  @ApiResponse({ status: 404, description: 'Plan feature value not found' })
  async update(@Param('id') id: string, @Body() updateDto: UpdatePlanFeatureValueDto) {
    return this.planFeatureValueService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a plan feature value' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiParam({ name: 'id', description: 'Plan feature value ID' })
  @ApiResponse({ status: 204, description: 'Plan feature value deleted successfully' })
  @ApiResponse({ status: 404, description: 'Plan feature value not found' })
  async remove(@Param('id') id: string) {
    return this.planFeatureValueService.remove(id);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk create or update feature values for a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan feature values updated successfully' })
  async bulkUpdate(
    @Param('planId') planId: string,
    @Body() bulkUpdateDto: BulkUpdatePlanFeaturesDto & { applicationId: string },
  ) {
    return this.planFeatureValueService.bulkCreateOrUpdate(
      planId,
      bulkUpdateDto.applicationId,
      bulkUpdateDto.features,
    );
  }
}
