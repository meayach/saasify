import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SaasPlanService } from '../../services/plan/saas-plan.service';
import {
  CreateSaasPlanDto,
  UpdateSaasPlanDto,
  SaasPlanResponseDto,
} from '../../services/dto/saas-plan.dto';

@ApiTags('SaaS Plans')
@Controller('plans')
@ApiBearerAuth()
export class SaasPlanController {
  constructor(private readonly planService: SaasPlanService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiResponse({
    status: 201,
    description: 'Plan created successfully',
    type: SaasPlanResponseDto,
  })
  create(@Body() createPlanDto: CreateSaasPlanDto): Promise<SaasPlanResponseDto> {
    return this.planService.create(createPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all plans' })
  @ApiQuery({ name: 'applicationId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Plans retrieved successfully',
  })
  findAll(
    @Query('applicationId') applicationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.planService.findAll(applicationId, pageNum, limitNum);
  }

  @Get('application/:applicationId')
  @ApiOperation({ summary: 'Get plans by application' })
  @ApiResponse({
    status: 200,
    description: 'Application plans retrieved successfully',
    type: [SaasPlanResponseDto],
  })
  findByApplication(@Param('applicationId') applicationId: string): Promise<SaasPlanResponseDto[]> {
    return this.planService.findByApplication(applicationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan retrieved successfully',
    type: SaasPlanResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  findOne(@Param('id') id: string): Promise<SaasPlanResponseDto> {
    return this.planService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update plan' })
  @ApiResponse({
    status: 200,
    description: 'Plan updated successfully',
    type: SaasPlanResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  update(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdateSaasPlanDto,
  ): Promise<SaasPlanResponseDto> {
    return this.planService.update(id, updatePlanDto);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate plan' })
  @ApiResponse({
    status: 200,
    description: 'Plan activated successfully',
    type: SaasPlanResponseDto,
  })
  activate(@Param('id') id: string): Promise<SaasPlanResponseDto> {
    return this.planService.activate(id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate plan' })
  @ApiResponse({
    status: 200,
    description: 'Plan deactivated successfully',
    type: SaasPlanResponseDto,
  })
  deactivate(@Param('id') id: string): Promise<SaasPlanResponseDto> {
    return this.planService.deactivate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete plan' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.planService.remove(id);
  }
}
