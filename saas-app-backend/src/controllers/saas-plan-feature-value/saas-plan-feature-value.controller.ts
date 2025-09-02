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
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SaasPlanFeatureValueService } from '../../services/saas-plan-feature-value/saas-plan-feature-value.service';
import { CreateSaasPlanFeatureValueDto, UpdateSaasPlanFeatureValueDto, BulkUpdatePlanFeatureValuesDto } from '../../services/dto/saas-plan-feature-value/saas-plan-feature-value.dto';

@ApiTags('Plan Feature Values')
@Controller('api/v1/plan-feature-values')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SaasPlanFeatureValueController {
  constructor(
    private readonly saasPlanFeatureValueService: SaasPlanFeatureValueService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new plan feature value' })
  @ApiResponse({
    status: 201,
    description: 'Plan feature value created successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFeatureValueDto: CreateSaasPlanFeatureValueDto) {
    const featureValue = await this.saasPlanFeatureValueService.create(createFeatureValueDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Plan feature value created successfully',
      data: featureValue,
    };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk update plan feature values' })
  @ApiResponse({
    status: 200,
    description: 'Plan feature values updated successfully',
  })
  async bulkUpdate(@Body() bulkUpdateDto: BulkUpdatePlanFeatureValuesDto) {
    const featureValues = await this.saasPlanFeatureValueService.bulkUpdateForPlan(bulkUpdateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Plan feature values updated successfully',
      data: featureValues,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all plan feature values' })
  @ApiQuery({ name: 'planId', required: false, description: 'Filter by plan ID' })
  @ApiQuery({ name: 'featureId', required: false, description: 'Filter by feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan feature values retrieved successfully',
  })
  async findAll(@Query('planId') planId?: string, @Query('featureId') featureId?: string) {
    let featureValues;

    if (planId) {
      featureValues = await this.saasPlanFeatureValueService.findByPlanId(planId);
    } else if (featureId) {
      featureValues = await this.saasPlanFeatureValueService.findByFeatureId(featureId);
    } else {
      featureValues = await this.saasPlanFeatureValueService.findAll();
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Plan feature values retrieved successfully',
      data: featureValues,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan feature value by ID' })
  @ApiParam({ name: 'id', description: 'Feature value ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan feature value retrieved successfully',
  })
  async findOne(@Param('id') id: string) {
    const featureValue = await this.saasPlanFeatureValueService.findById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Plan feature value retrieved successfully',
      data: featureValue,
    };
  }

  @Get('plan/:planId/feature/:featureId')
  @ApiOperation({ summary: 'Get plan feature value by plan ID and feature ID' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan feature value retrieved successfully',
  })
  async findByPlanAndFeature(@Param('planId') planId: string, @Param('featureId') featureId: string) {
    const featureValue = await this.saasPlanFeatureValueService.findByPlanIdAndFeatureId(planId, featureId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Plan feature value retrieved successfully',
      data: featureValue,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update plan feature value' })
  @ApiParam({ name: 'id', description: 'Feature value ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan feature value updated successfully',
  })
  async update(@Param('id') id: string, @Body() updateFeatureValueDto: UpdateSaasPlanFeatureValueDto) {
    const featureValue = await this.saasPlanFeatureValueService.update(id, updateFeatureValueDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Plan feature value updated successfully',
      data: featureValue,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete plan feature value' })
  @ApiParam({ name: 'id', description: 'Feature value ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan feature value deleted successfully',
  })
  async remove(@Param('id') id: string) {
    await this.saasPlanFeatureValueService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Plan feature value deleted successfully',
    };
  }

  @Delete('plan/:planId')
  @ApiOperation({ summary: 'Delete all feature values for a plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan feature values deleted successfully',
  })
  async removeByPlan(@Param('planId') planId: string) {
    await this.saasPlanFeatureValueService.removeByPlanId(planId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Plan feature values deleted successfully',
    };
  }

  @Delete('feature/:featureId')
  @ApiOperation({ summary: 'Delete all values for a feature' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature values deleted successfully',
  })
  async removeByFeature(@Param('featureId') featureId: string) {
    await this.saasPlanFeatureValueService.removeByFeatureId(featureId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Feature values deleted successfully',
    };
  }
}