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
import { SaasApplicationFeatureService } from '../../services/saas-application-feature/saas-application-feature.service';
import { CreateSaasApplicationFeatureDto, UpdateSaasApplicationFeatureDto } from '../../services/dto/saas-application-feature/saas-application-feature.dto';

@ApiTags('Application Features')
@Controller('api/v1/application-features')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SaasApplicationFeatureController {
  constructor(
    private readonly saasApplicationFeatureService: SaasApplicationFeatureService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application feature' })
  @ApiResponse({
    status: 201,
    description: 'Feature created successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFeatureDto: CreateSaasApplicationFeatureDto) {
    const feature = await this.saasApplicationFeatureService.create(createFeatureDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Application feature created successfully',
      data: feature,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all application features' })
  @ApiQuery({ name: 'applicationId', required: false, description: 'Filter by application ID' })
  @ApiResponse({
    status: 200,
    description: 'Features retrieved successfully',
  })
  async findAll(@Query('applicationId') applicationId?: string) {
    const features = applicationId
      ? await this.saasApplicationFeatureService.findByApplicationId(applicationId)
      : await this.saasApplicationFeatureService.findAll();

    return {
      statusCode: HttpStatus.OK,
      message: 'Features retrieved successfully',
      data: features,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application feature by ID' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature retrieved successfully',
  })
  async findOne(@Param('id') id: string) {
    const feature = await this.saasApplicationFeatureService.findById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Feature retrieved successfully',
      data: feature,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update application feature' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature updated successfully',
  })
  async update(@Param('id') id: string, @Body() updateFeatureDto: UpdateSaasApplicationFeatureDto) {
    const feature = await this.saasApplicationFeatureService.update(id, updateFeatureDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Feature updated successfully',
      data: feature,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete application feature' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature deleted successfully',
  })
  async remove(@Param('id') id: string) {
    await this.saasApplicationFeatureService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Feature deleted successfully',
    };
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate application feature' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature deactivated successfully',
  })
  async deactivate(@Param('id') id: string) {
    const feature = await this.saasApplicationFeatureService.deactivate(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Feature deactivated successfully',
      data: feature,
    };
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate application feature' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature activated successfully',
  })
  async activate(@Param('id') id: string) {
    const feature = await this.saasApplicationFeatureService.activate(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Feature activated successfully',
      data: feature,
    };
  }
}