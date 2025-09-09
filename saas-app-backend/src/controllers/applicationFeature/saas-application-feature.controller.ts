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
  SaasApplicationFeatureService,
  CreateFeatureDto,
  UpdateFeatureDto,
} from '../../services/feature/saas-application-feature.service';
import {
  FeatureType,
  FeatureUnit,
} from '../../data/models/saasApplicationFeature/saas-application-feature.model';

@ApiTags('Application Features')
@Controller('api/v1/applications/:applicationId/features')
export class SaasApplicationFeatureController {
  constructor(private readonly featureService: SaasApplicationFeatureService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new feature for an application' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiResponse({ status: 201, description: 'Feature created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Param('applicationId') applicationId: string,
    @Body() createFeatureDto: Omit<CreateFeatureDto, 'applicationId'>,
  ) {
    return this.featureService.create({
      ...createFeatureDto,
      applicationId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all features for an application' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Features retrieved successfully' })
  async findAll(@Param('applicationId') applicationId: string) {
    return this.featureService.findByApplicationId(applicationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific feature' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Feature retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  async findOne(@Param('id') id: string) {
    return this.featureService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a feature' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 200, description: 'Feature updated successfully' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  async update(@Param('id') id: string, @Body() updateFeatureDto: UpdateFeatureDto) {
    return this.featureService.update(id, updateFeatureDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a feature' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 204, description: 'Feature deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  async remove(@Param('id') id: string) {
    return this.featureService.remove(id);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reorder features for an application' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Features reordered successfully' })
  async reorder(
    @Param('applicationId') applicationId: string,
    @Body() reorderData: { features: Array<{ id: string; sortOrder: number }> },
  ) {
    return this.featureService.reorderFeatures(applicationId, reorderData.features);
  }
}

// Contrôleur séparé pour les endpoints utilitaires
@ApiTags('Features Utilities')
@Controller('api/v1/features')
export class FeatureUtilsController {
  @Get('types')
  @ApiOperation({ summary: 'Get all available feature types' })
  @ApiResponse({ status: 200, description: 'Feature types retrieved successfully' })
  getFeatureTypes() {
    return Object.values(FeatureType).map((type) => ({
      value: type,
      label: this.getTypeLabel(type),
    }));
  }

  @Get('units')
  @ApiOperation({ summary: 'Get all available feature units' })
  @ApiResponse({ status: 200, description: 'Feature units retrieved successfully' })
  getFeatureUnits() {
    return Object.values(FeatureUnit).map((unit) => ({
      value: unit,
      label: SaasApplicationFeatureService.getUnitLabel(unit),
    }));
  }

  @Get('units/categories')
  @ApiOperation({ summary: 'Get feature units grouped by categories' })
  @ApiResponse({ status: 200, description: 'Feature unit categories retrieved successfully' })
  getFeatureUnitCategories() {
    return {
      storage: [
        { value: FeatureUnit.BYTES, label: 'Bytes' },
        { value: FeatureUnit.KB, label: 'KB' },
        { value: FeatureUnit.MB, label: 'MB' },
        { value: FeatureUnit.GB, label: 'GB' },
        { value: FeatureUnit.TB, label: 'TB' },
      ],
      communications: [
        { value: FeatureUnit.EMAILS, label: 'Emails' },
        { value: FeatureUnit.SMS, label: 'SMS' },
        { value: FeatureUnit.CALLS, label: 'Appels' },
      ],
      api: [
        { value: FeatureUnit.API_CALLS, label: 'Appels API' },
        { value: FeatureUnit.REQUESTS, label: 'Requêtes' },
      ],
      users: [
        { value: FeatureUnit.USERS, label: 'Utilisateurs' },
        { value: FeatureUnit.ACCOUNTS, label: 'Comptes' },
        { value: FeatureUnit.SEATS, label: 'Sièges' },
      ],
      time: [
        { value: FeatureUnit.MINUTES, label: 'Minutes' },
        { value: FeatureUnit.HOURS, label: 'Heures' },
        { value: FeatureUnit.DAYS, label: 'Jours' },
        { value: FeatureUnit.MONTHS, label: 'Mois' },
      ],
      items: [
        { value: FeatureUnit.ITEMS, label: 'Éléments' },
        { value: FeatureUnit.PROJECTS, label: 'Projets' },
        { value: FeatureUnit.FILES, label: 'Fichiers' },
      ],
      other: [{ value: FeatureUnit.NONE, label: 'Aucune unité' }],
    };
  }

  private getTypeLabel(type: FeatureType): string {
    const labels: Record<FeatureType, string> = {
      [FeatureType.NUMERIC]: 'Numérique',
      [FeatureType.BOOLEAN]: 'Booléen',
      [FeatureType.TEXT]: 'Texte',
    };
    return labels[type] || type;
  }
}
