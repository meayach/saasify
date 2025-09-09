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
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FeatureService } from '../../services/feature/feature.service';
import { FeatureCategory, FeatureStatus } from '../../data/models/feature/feature.pojo.model';

// DTOs for API requests/responses
export class CreateFeatureDto {
  name!: string;
  description!: string;
  category!: FeatureCategory;
  applicationId?: string;
  isGlobal?: boolean;
  status?: FeatureStatus;
  customFields?: any[];
}

export class UpdateFeatureDto {
  name?: string;
  description?: string;
  category?: FeatureCategory;
  status?: FeatureStatus;
  customFields?: any[];
}

export class FeatureQueryDto {
  applicationId?: string;
  category?: FeatureCategory;
  status?: FeatureStatus;
  isGlobal?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

@ApiTags('Features')
@Controller('api/features')
export class FeatureController {
  private readonly logger = new Logger(FeatureController.name);

  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @ApiOperation({ summary: 'Get all features' })
  @ApiQuery({ name: 'applicationId', required: false })
  @ApiQuery({ name: 'category', required: false, enum: FeatureCategory })
  @ApiQuery({ name: 'status', required: false, enum: FeatureStatus })
  @ApiQuery({ name: 'isGlobal', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Features retrieved successfully' })
  async getFeatures(@Query() query: FeatureQueryDto) {
    try {
      this.logger.log(`Getting features with query: ${JSON.stringify(query)}`);

      const page = query.page || 1;
      const limit = query.limit || 50;
      const skip = (page - 1) * limit;

      const result = await this.featureService.findMany(
        {
          ...(query.applicationId && {
            $or: [{ applicationId: query.applicationId }, { isGlobal: true }],
          }),
          ...(query.category && { category: query.category }),
          ...(query.status && { status: query.status }),
          ...(query.isGlobal !== undefined && { isGlobal: query.isGlobal }),
          ...(query.search && {
            $or: [
              { name: { $regex: query.search, $options: 'i' } },
              { description: { $regex: query.search, $options: 'i' } },
            ],
          }),
        },
        {
          skip,
          limit,
          sort: { category: 1, name: 1 },
        },
      );

      const total = await this.featureService.countDocuments({
        ...(query.applicationId && {
          $or: [{ applicationId: query.applicationId }, { isGlobal: true }],
        }),
        ...(query.category && { category: query.category }),
        ...(query.status && { status: query.status }),
        ...(query.isGlobal !== undefined && { isGlobal: query.isGlobal }),
        ...(query.search && {
          $or: [
            { name: { $regex: query.search, $options: 'i' } },
            { description: { $regex: query.search, $options: 'i' } },
          ],
        }),
      });

      return {
        data: result,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Error getting features:', error);
      throw new HttpException('Failed to retrieve features', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('categories/list')
  @ApiOperation({ summary: 'Get available feature categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories() {
    try {
      return Object.values(FeatureCategory).map((category) => ({
        value: category,
        label: this.getCategoryLabel(category),
      }));
    } catch (error) {
      this.logger.error('Error getting categories:', error);
      throw new HttpException('Failed to retrieve categories', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('statuses/list')
  @ApiOperation({ summary: 'Get available feature statuses' })
  @ApiResponse({ status: 200, description: 'Statuses retrieved successfully' })
  async getStatuses() {
    try {
      return Object.values(FeatureStatus).map((status) => ({
        value: status,
        label: this.getStatusLabel(status),
      }));
    } catch (error) {
      this.logger.error('Error getting statuses:', error);
      throw new HttpException('Failed to retrieve statuses', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private getCategoryLabel(category: FeatureCategory): string {
    const labels = {
      [FeatureCategory.CORE]: 'Fonctionnalités de base',
      [FeatureCategory.ADVANCED]: 'Fonctionnalités avancées',
      [FeatureCategory.PREMIUM]: 'Fonctionnalités premium',
      [FeatureCategory.ADDON]: 'Modules complémentaires',
    };
    return labels[category] || category;
  }

  private getStatusLabel(status: FeatureStatus): string {
    const labels = {
      [FeatureStatus.ACTIVE]: 'Actif',
      [FeatureStatus.INACTIVE]: 'Inactif',
      [FeatureStatus.LIMITED]: 'Limité',
      [FeatureStatus.COMING_SOON]: 'Bientôt disponible',
    };
    return labels[status] || status;
  }

  @Post(':featureId/custom-fields')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a custom field to a feature' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({ status: 201, description: 'Custom field created successfully' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  async addCustomField(
    @Param('featureId') featureId: string,
    @Body() createFieldDto: CreateFeatureCustomFieldDto,
  ) {
    return this.featureService.addCustomField(featureId, createFieldDto);
  }

  @Get(':featureId')
  @ApiOperation({ summary: 'Get feature by ID with its custom fields' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Feature found' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  async getFeatureWithFields(@Param('featureId') featureId: string) {
    return this.featureService.getFeatureWithFields(featureId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all features with optional filters' })
  @ApiQuery({ name: 'applicationId', required: false, description: 'Filter by application ID' })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: FeatureCategory,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'isGlobal',
    required: false,
    type: 'boolean',
    description: 'Filter by global status',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: 'boolean',
    description: 'Filter by active status',
  })
  @ApiResponse({ status: 200, description: 'Features retrieved successfully' })
  async getAllFeatures(
    @Query('applicationId') applicationId?: string,
    @Query('category') category?: FeatureCategory,
    @Query('isGlobal') isGlobal?: boolean,
    @Query('isActive') isActive?: boolean,
  ) {
    const filters = {
      applicationId,
      category,
      isGlobal,
      isActive,
    };

    // Remove undefined values
    Object.keys(filters).forEach(
      (key) =>
        filters[key as keyof typeof filters] === undefined &&
        delete filters[key as keyof typeof filters],
    );

    return this.featureService.getAllFeatures(filters);
  }

  @Get('applications/:applicationId')
  @ApiOperation({ summary: 'Get features for a specific application' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiQuery({
    name: 'includeGlobal',
    required: false,
    type: 'boolean',
    description: 'Include global features',
    default: true,
  })
  @ApiResponse({ status: 200, description: 'Application features retrieved successfully' })
  async getApplicationFeatures(
    @Param('applicationId') applicationId: string,
    @Query('includeGlobal') includeGlobal = true,
  ) {
    return this.featureService.getApplicationFeatures(applicationId, includeGlobal);
  }

  @Get('categories/:category')
  @ApiOperation({ summary: 'Get features by category' })
  @ApiParam({ name: 'category', enum: FeatureCategory, description: 'Feature category' })
  @ApiQuery({ name: 'applicationId', required: false, description: 'Filter by application ID' })
  @ApiResponse({ status: 200, description: 'Features by category retrieved successfully' })
  async getFeaturesByCategory(
    @Param('category') category: FeatureCategory,
    @Query('applicationId') applicationId?: string,
  ) {
    return this.featureService.getFeaturesByCategory(category, applicationId);
  }

  @Get('roles/:role')
  @ApiOperation({ summary: 'Get features by role' })
  @ApiParam({ name: 'role', enum: FeatureRole, description: 'Feature role' })
  @ApiQuery({ name: 'applicationId', required: false, description: 'Filter by application ID' })
  @ApiResponse({ status: 200, description: 'Features by role retrieved successfully' })
  async getFeaturesByRole(
    @Param('role') role: FeatureRole,
    @Query('applicationId') applicationId?: string,
  ) {
    return this.featureService.getFeaturesByRole(role, applicationId);
  }

  @Put(':featureId')
  @ApiOperation({ summary: 'Update a feature' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Feature updated successfully' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  async updateFeature(
    @Param('featureId') featureId: string,
    @Body() updateData: Partial<CreateFeatureDto>,
  ) {
    return this.featureService.updateFeature(featureId, updateData);
  }

  @Put('custom-fields/:fieldId')
  @ApiOperation({ summary: 'Update a custom field' })
  @ApiParam({ name: 'fieldId', description: 'Custom field ID' })
  @ApiResponse({ status: 200, description: 'Custom field updated successfully' })
  @ApiResponse({ status: 404, description: 'Custom field not found' })
  async updateCustomField(
    @Param('fieldId') fieldId: string,
    @Body() updateData: Partial<CreateFeatureCustomFieldDto>,
  ) {
    return this.featureService.updateCustomField(fieldId, updateData);
  }

  @Delete(':featureId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a feature' })
  @ApiParam({ name: 'featureId', description: 'Feature ID' })
  @ApiResponse({ status: 204, description: 'Feature deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  async deleteFeature(@Param('featureId') featureId: string) {
    await this.featureService.deleteFeature(featureId);
  }

  @Delete('custom-fields/:fieldId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a custom field' })
  @ApiParam({ name: 'fieldId', description: 'Custom field ID' })
  @ApiResponse({ status: 204, description: 'Custom field deleted successfully' })
  @ApiResponse({ status: 404, description: 'Custom field not found' })
  async deleteCustomField(@Param('fieldId') fieldId: string) {
    await this.featureService.deleteCustomField(fieldId);
  }
}
