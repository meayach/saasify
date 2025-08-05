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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SaasApplicationService } from '../../services/application/saas-application.service';
import {
  CreateSaasApplicationDto,
  UpdateSaasApplicationDto,
  SaasApplicationResponseDto,
} from '../../services/dto/saas-application.dto';

@ApiTags('SaaS Applications')
@Controller('applications')
@ApiBearerAuth()
export class SaasApplicationController {
  constructor(private readonly applicationService: SaasApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new SaaS application' })
  @ApiResponse({
    status: 201,
    description: 'Application created successfully',
    type: SaasApplicationResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Application with this slug already exists' })
  create(
    @Body() createApplicationDto: CreateSaasApplicationDto,
    @Request() req: any,
  ): Promise<SaasApplicationResponseDto> {
    // Get owner ID from the authenticated user
    const ownerId = req.user?.id || req.user?.sub;
    return this.applicationService.create(ownerId, createApplicationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  @ApiQuery({ name: 'ownerId', required: false, type: String, description: 'Filter by owner ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
  })
  findAll(
    @Query('ownerId') ownerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.applicationService.findAll(ownerId, pageNum, limitNum);
  }

  @Get('my-applications')
  @ApiOperation({ summary: 'Get current user applications' })
  @ApiResponse({
    status: 200,
    description: 'User applications retrieved successfully',
    type: [SaasApplicationResponseDto],
  })
  findMyApplications(@Request() req: any): Promise<SaasApplicationResponseDto[]> {
    const ownerId = req.user?.id || req.user?.sub;
    return this.applicationService.findByOwner(ownerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({
    status: 200,
    description: 'Application retrieved successfully',
    type: SaasApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  findOne(@Param('id') id: string): Promise<SaasApplicationResponseDto> {
    return this.applicationService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get application by slug' })
  @ApiResponse({
    status: 200,
    description: 'Application retrieved successfully',
    type: SaasApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  findBySlug(@Param('slug') slug: string): Promise<SaasApplicationResponseDto> {
    return this.applicationService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update application' })
  @ApiResponse({
    status: 200,
    description: 'Application updated successfully',
    type: SaasApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateSaasApplicationDto,
  ): Promise<SaasApplicationResponseDto> {
    return this.applicationService.update(id, updateApplicationDto);
  }

  @Post(':id/launch')
  @ApiOperation({ summary: 'Launch application' })
  @ApiResponse({
    status: 200,
    description: 'Application launched successfully',
    type: SaasApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  launch(@Param('id') id: string): Promise<SaasApplicationResponseDto> {
    return this.applicationService.launch(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete application' })
  @ApiResponse({ status: 200, description: 'Application deleted successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.applicationService.remove(id);
  }
}
