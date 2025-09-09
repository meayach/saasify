import { Injectable, NotFoundException } from '@nestjs/common';
import mongoose from 'mongoose';
import { SaasFeatureValueRepository } from '../../data/saasFeatureValue/repository/saasFeatureValue.repository';
import { SaasApplicationRepository } from '../../data/saasApplication/repository/saasApplication.repository';
import { SaasPlanRepository } from '../../data/saasPlan/repository/saasPlan.repository';
import {
  CreateSaasFeatureValueDto,
  UpdateSaasFeatureValueDto,
  SaasFeatureValueResponseDto,
  BulkCreateFeatureValuesDto,
} from '../dto/saas-feature-value.dto';
import { FeatureUnit } from '../../data/models/saasFeatureValue/saasFeatureValue.pojo.model';

@Injectable()
export class SaasFeatureValueService {
  constructor(
    private readonly featureValueRepository: SaasFeatureValueRepository,
    private readonly applicationRepository: SaasApplicationRepository,
    private readonly planRepository: SaasPlanRepository,
  ) {}

  async createFeatureValue(dto: CreateSaasFeatureValueDto): Promise<SaasFeatureValueResponseDto> {
    // Vérifier que l'application existe
    const application = await this.applicationRepository.getSaasApplicationById(
      dto.saasApplicationId,
    );
    if (!application) {
      throw new NotFoundException('Application SaaS non trouvée');
    }

    // Vérifier que le plan existe
    const plan = await this.planRepository.getSaasPlanById(dto.saasPlanId);
    if (!plan) {
      throw new NotFoundException('Plan SaaS non trouvé');
    }

    // Générer automatiquement la valeur d'affichage si non fournie
    const displayValue = dto.displayValue || this.generateDisplayValue(dto.value, dto.unit);

    const featureValuePOJO = {
      featureName: dto.featureName,
      description: dto.description,
      featureType: dto.featureType,
      unit: dto.unit,
      value: dto.value,
      displayValue,
      saasApplication: new mongoose.Types.ObjectId(dto.saasApplicationId),
      saasPlan: new mongoose.Types.ObjectId(dto.saasPlanId),
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
    };

    const created = await this.featureValueRepository.createFeatureValue(featureValuePOJO as any);
    return this.mapToResponseDto(created);
  }

  async bulkCreateFeatureValues(
    dto: BulkCreateFeatureValuesDto,
  ): Promise<SaasFeatureValueResponseDto[]> {
    const results: SaasFeatureValueResponseDto[] = [];

    for (const featureValueDto of dto.featureValues) {
      try {
        const result = await this.createFeatureValue(featureValueDto);
        results.push(result);
      } catch (error) {
        // Log l'erreur mais continue avec les autres valeurs de fonctionnalités
        console.error(
          `Échec de création de la valeur de fonctionnalité: ${featureValueDto.featureName}`,
          error,
        );
      }
    }

    return results;
  }

  async getFeatureValuesByApplication(
    applicationId: string,
  ): Promise<SaasFeatureValueResponseDto[]> {
    const featureValues = await this.featureValueRepository.findByApplication(applicationId);
    return featureValues.map((fv) => this.mapToResponseDto(fv));
  }

  async getFeatureValuesByApplicationAndPlan(
    applicationId: string,
    planId: string,
  ): Promise<SaasFeatureValueResponseDto[]> {
    const featureValues = await this.featureValueRepository.findByApplicationAndPlan(
      applicationId,
      planId,
    );
    return featureValues.map((fv) => this.mapToResponseDto(fv));
  }

  async getFeaturesByApplicationGroupedByPlan(
    applicationId: string,
  ): Promise<Record<string, SaasFeatureValueResponseDto[]>> {
    const groupedFeatures = await this.featureValueRepository.getFeaturesByApplicationGroupedByPlan(
      applicationId,
    );

    const result: Record<string, SaasFeatureValueResponseDto[]> = {};
    Object.keys(groupedFeatures).forEach((planId) => {
      result[planId] = groupedFeatures[planId].map((fv) => this.mapToResponseDto(fv));
    });

    return result;
  }

  async updateFeatureValue(
    id: string,
    dto: UpdateSaasFeatureValueDto,
  ): Promise<SaasFeatureValueResponseDto> {
    const existing = await this.featureValueRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Valeur de fonctionnalité avec l'ID ${id} non trouvée`);
    }

    const updateData: any = {};

    if (dto.featureName !== undefined) updateData.featureName = dto.featureName;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.featureType !== undefined) updateData.featureType = dto.featureType;
    if (dto.unit !== undefined) updateData.unit = dto.unit;
    if (dto.value !== undefined) {
      updateData.value = dto.value;
      // Régénérer la valeur d'affichage quand la valeur change
      const currentUnit = dto.unit || existing.unit;
      updateData.displayValue =
        dto.displayValue || this.generateDisplayValue(dto.value, currentUnit);
    }
    if (dto.displayValue !== undefined) {
      updateData.displayValue = dto.displayValue;
    }
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;

    const updatedFeatureValue = await this.featureValueRepository.updateFeatureValue(
      id,
      updateData,
    );
    if (!updatedFeatureValue) {
      throw new NotFoundException(`Valeur de fonctionnalité avec l'ID ${id} non trouvée`);
    }

    return this.mapToResponseDto(updatedFeatureValue);
  }

  async deleteFeatureValue(id: string): Promise<void> {
    const deleted = await this.featureValueRepository.deleteFeatureValue(id);
    if (!deleted) {
      throw new Error('Valeur de fonctionnalité introuvable');
    }
  }

  private mapToResponseDto(featureValue: any): SaasFeatureValueResponseDto {
    return {
      _id: featureValue._id.toString(),
      featureName: featureValue.featureName,
      description: featureValue.description,
      featureType: featureValue.featureType,
      unit: featureValue.unit,
      value: featureValue.value,
      displayValue: featureValue.displayValue,
      saasApplication: featureValue.saasApplication.toString(),
      saasPlan: featureValue.saasPlan.toString(),
      isActive: featureValue.isActive,
      sortOrder: featureValue.sortOrder,
      createdAt: featureValue.createdAt,
      updatedAt: featureValue.updatedAt,
    };
  }

  private generateDisplayValue(value: number, unit: FeatureUnit): string {
    if (value === -1) {
      return 'Illimité';
    }

    switch (unit) {
      case FeatureUnit.EMAILS:
        return `${value} emails/mois`;
      case FeatureUnit.USERS:
        return `${value} utilisateurs`;
      case FeatureUnit.BYTES:
        return `${value} bytes`;
      case FeatureUnit.KILOBYTES:
        return `${value} KB`;
      case FeatureUnit.MEGABYTES:
        return `${value} MB`;
      case FeatureUnit.GIGABYTES:
        return `${value} GB`;
      case FeatureUnit.TERABYTES:
        return `${value} TB`;
      case FeatureUnit.COUNT:
        return `${value}`;
      case FeatureUnit.REQUESTS:
        return `${value} requêtes/mois`;
      case FeatureUnit.TRANSACTIONS:
        return `${value} transactions/mois`;
      case FeatureUnit.MINUTES:
        return `${value} minutes`;
      case FeatureUnit.HOURS:
        return `${value} heures`;
      case FeatureUnit.DAYS:
        return `${value} jours`;
      case FeatureUnit.MONTHS:
        return `${value} mois`;
      case FeatureUnit.MBPS:
        return `${value} Mbps`;
      case FeatureUnit.GBPS:
        return `${value} Gbps`;
      case FeatureUnit.PERCENTAGE:
        return `${value}%`;
      case FeatureUnit.UNLIMITED:
        return 'Illimité';
      default:
        return `${value} ${unit}`;
    }
  }
}
