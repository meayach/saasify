import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
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
import { PlanManagementService } from '../../services/plan/plan-management.service';
import { PlanType, BillingCycle } from '../../data/models/saasPlan/saas-plan.model';

export class CreatePlanDto {
  name: string;
  description: string;
  type: PlanType;
  billingCycle: BillingCycle;
  price: number;
  currencyId: string;
  applicationId: string;
  features?: Record<string, any>;
  limits?: Record<string, number>;
  includedFeatures?: string[];
  isPopular?: boolean;
}

export class UpdatePlanDto {
  name?: string;
  description?: string;
  price?: number;
  features?: Record<string, any>;
  limits?: Record<string, number>;
  includedFeatures?: string[];
  isActive?: boolean;
  isPopular?: boolean;
}

@ApiTags('Plan Management')
@Controller('api/v1/plans')
export class PlanManagementController {
  constructor(private readonly planManagementService: PlanManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available plans' })
  @ApiQuery({
    name: 'applicationId',
    required: false,
    description: 'Filter by application ID',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: PlanType,
    description: 'Filter by plan type',
  })
  @ApiResponse({
    status: 200,
    description: 'Plans retrieved successfully',
  })
  async getPlans(@Query('applicationId') applicationId?: string, @Query('type') type?: PlanType) {
    const plans = await this.planManagementService.getPlans({
      applicationId,
      type,
      isActive: true,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Plans retrieved successfully',
      data: plans,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan retrieved successfully',
  })
  async getPlanById(@Param('id') id: string) {
    const plan = await this.planManagementService.getPlanById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Plan retrieved successfully',
      data: plan,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiResponse({
    status: 201,
    description: 'Plan created successfully',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    const plan = await this.planManagementService.createPlan(createPlanDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Plan created successfully',
      data: plan,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan updated successfully',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updatePlan(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    const plan = await this.planManagementService.updatePlan(id, updatePlanDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Plan updated successfully',
      data: plan,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan deleted successfully',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deletePlan(@Param('id') id: string) {
    await this.planManagementService.deletePlan(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Plan deleted successfully',
    };
  }

  @Get(':id/pricing')
  @ApiOperation({ summary: 'Get plan pricing details' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan pricing retrieved successfully',
  })
  async getPlanPricing(@Param('id') id: string) {
    const pricing = await this.planManagementService.getPlanPricing(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Plan pricing retrieved successfully',
      data: pricing,
    };
  }
}
