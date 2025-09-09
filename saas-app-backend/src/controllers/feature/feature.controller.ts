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
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FeatureService } from '../../services/feature/feature.service';
import { FeatureCategory, FeatureRole } from '../../data/models/feature/feature.pojo.model';
import { FeatureStatus } from '../../data/models/featurePlanConfiguration/featurePlanConfiguration.pojo.model';
import {
  FieldDataType,
  FieldUnit,
} from '../../data/models/featureCustomField/featureCustomField.pojo.model';

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

export class CreateFeatureCustomFieldDto {
  fieldName!: string;
  displayName!: string;
  description?: string;
  dataType!: FieldDataType;
  unit?: FieldUnit;
  isRequired?: boolean;
  defaultValue?: any;
  validationRules?: any;
  enumValues?: string[];
  metadata?: Record<string, any>;
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

      // Use the existing getAllFeatures method
      let result;
      if (query.applicationId) {
        result = await this.featureService.getApplicationFeatures(query.applicationId);
      } else if (query.category) {
        result = await this.featureService.getFeaturesByCategory(query.category);
      } else {
        result = await this.featureService.getAllFeatures();
      }

      // Apply search filter if provided
      if (query.search) {
        const searchRegex = new RegExp(query.search, 'i');
        result = result.filter(
          (item) =>
            item.feature.name.match(searchRegex) || item.feature.description.match(searchRegex),
        );
      }

      // Apply status filter if provided
      if (query.status !== undefined) {
        // Note: status is typically on plan configurations, not features directly
        // For now, we'll skip this filter
      }

      // Apply isGlobal filter if provided
      if (query.isGlobal !== undefined) {
        result = result.filter((item) => item.feature.isGlobal === query.isGlobal);
      }

      const total = result.length;
      const skip = (page - 1) * limit;
      const paginatedResult = result.slice(skip, skip + limit);

      return {
        data: paginatedResult,
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
      [FeatureCategory.STORAGE]: 'Stockage',
      [FeatureCategory.COMMUNICATION]: 'Communication',
      [FeatureCategory.API]: 'API',
      [FeatureCategory.ANALYTICS]: 'Analytics',
      [FeatureCategory.SUPPORT]: 'Support',
      [FeatureCategory.SECURITY]: 'Sécurité',
      [FeatureCategory.INTEGRATION]: 'Intégration',
      [FeatureCategory.CUSTOMIZATION]: 'Personnalisation',
      [FeatureCategory.REPORTING]: 'Rapports',
      [FeatureCategory.USER_MANAGEMENT]: 'Gestion des utilisateurs',
      [FeatureCategory.OTHER]: 'Autre',
    };
    return labels[category] || category;
  }

  private getStatusLabel(status: FeatureStatus): string {
    const labels = {
      [FeatureStatus.ENABLED]: 'Activé',
      [FeatureStatus.DISABLED]: 'Désactivé',
      [FeatureStatus.LIMITED]: 'Limité',
      [FeatureStatus.UNLIMITED]: 'Illimité',
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
