import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum FeatureCategory {
  STORAGE = 'storage',
  COMMUNICATION = 'communication',
  API = 'api',
  ANALYTICS = 'analytics',
  SUPPORT = 'support',
  SECURITY = 'security',
  INTEGRATION = 'integration',
  CUSTOMIZATION = 'customization',
  REPORTING = 'reporting',
  USER_MANAGEMENT = 'user_management',
  OTHER = 'other',
}

export enum FeatureRole {
  SAAS_CUSTOMER_ADMIN = 'SAAS_CUSTOMER_ADMIN',
  MANAGER = 'MANAGER',
  DEVELOPER = 'DEVELOPER',
  SUBSCRIBER = 'SUBSCRIBER',
  ALL = 'ALL',
}

export enum FeatureStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  LIMITED = 'limited',
  UNLIMITED = 'unlimited',
}

export enum FieldDataType {
  NUMBER = 'number',
  STRING = 'string',
  BOOLEAN = 'boolean',
  DATE = 'date',
  ENUM = 'enum',
  JSON = 'json',
}

export enum FieldUnit {
  BYTES = 'bytes',
  KILOBYTES = 'kb',
  MEGABYTES = 'mb',
  GIGABYTES = 'gb',
  TERABYTES = 'tb',
  COUNT = 'count',
  EMAILS = 'emails',
  USERS = 'users',
  REQUESTS = 'requests',
  TRANSACTIONS = 'transactions',
  API_CALLS = 'api_calls',
  PROJECTS = 'projects',
  WORKSPACES = 'workspaces',
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  MONTHS = 'months',
  YEARS = 'years',
  MBPS = 'mbps',
  GBPS = 'gbps',
  PERCENTAGE = 'percentage',
  CURRENCY = 'currency',
  NONE = 'none',
}

export interface Feature {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  category: FeatureCategory;
  roles: FeatureRole[];
  isActive: boolean;
  isGlobal: boolean;
  applicationId?: string;
  sortOrder: number;
  icon: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureCustomField {
  _id: string;
  fieldName: string;
  displayName: string;
  description: string;
  dataType: FieldDataType;
  unit: FieldUnit;
  featureId: string;
  defaultValue: any;
  minValue?: number;
  maxValue?: number;
  enumValues: string[];
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  validationRules: Record<string, any>;
  metadata: Record<string, any>;
}

export interface FeatureWithFields {
  feature: Feature;
  customFields: FeatureCustomField[];
}

export interface PlanFeatureConfiguration {
  _id: string;
  planId: string;
  featureId: string;
  status: FeatureStatus;
  metadata: Record<string, any>;
  isActive: boolean;
  sortOrder: number;
  customDisplayName: string;
  customDescription: string;
  isHighlighted: boolean;
  highlightText: string;
  applicationId: string;
}

export interface FeatureCustomFieldValue {
  _id: string;
  featurePlanConfigurationId: string;
  customFieldId: string;
  fieldValue: any;
  displayValue: string;
  isUnlimited: boolean;
  isActive: boolean;
  applicationId: string;
  planId: string;
  featureId: string;
  metadata: Record<string, any>;
}

export interface PlanFeatureResponse {
  configuration: PlanFeatureConfiguration;
  feature: Feature;
  customFields: FeatureCustomField[];
  fieldValues: FeatureCustomFieldValue[];
}

export interface PlanFeatures {
  planId: string;
  applicationId: string;
  features: PlanFeatureResponse[];
}

export interface CreateFeatureDto {
  name: string;
  displayName?: string;
  description?: string;
  category: FeatureCategory;
  roles?: FeatureRole[];
  isGlobal?: boolean;
  applicationId?: string;
  icon?: string;
  sortOrder?: number;
  metadata?: Record<string, any>;
}

export interface CreateFeatureCustomFieldDto {
  fieldName: string;
  displayName?: string;
  description?: string;
  dataType: FieldDataType;
  unit?: FieldUnit;
  defaultValue?: any;
  minValue?: number;
  maxValue?: number;
  enumValues?: string[];
  isRequired?: boolean;
  sortOrder?: number;
  validationRules?: Record<string, any>;
}

export interface PlanFeatureConfigDto {
  featureId: string;
  status: FeatureStatus;
  customDisplayName?: string;
  customDescription?: string;
  isHighlighted?: boolean;
  highlightText?: string;
  sortOrder?: number;
  fieldValues: Array<{
    customFieldId: string;
    fieldValue: any;
    isUnlimited?: boolean;
    displayValue?: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class FeatureManagementService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  // Feature CRUD operations
  createFeature(dto: CreateFeatureDto): Observable<FeatureWithFields> {
    return this.http.post<FeatureWithFields>(`${this.apiUrl}/features`, dto);
  }

  getAllFeatures(filters?: {
    applicationId?: string;
    category?: FeatureCategory;
    isGlobal?: boolean;
    isActive?: boolean;
  }): Observable<FeatureWithFields[]> {
    let url = `${this.apiUrl}/features`;
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    return this.http.get<FeatureWithFields[]>(url);
  }

  getFeatureById(featureId: string): Observable<FeatureWithFields> {
    return this.http.get<FeatureWithFields>(`${this.apiUrl}/features/${featureId}`);
  }

  getApplicationFeatures(
    applicationId: string,
    includeGlobal = true,
  ): Observable<FeatureWithFields[]> {
    return this.http.get<FeatureWithFields[]>(
      `${this.apiUrl}/features/applications/${applicationId}?includeGlobal=${includeGlobal}`,
    );
  }

  getFeaturesByCategory(
    category: FeatureCategory,
    applicationId?: string,
  ): Observable<FeatureWithFields[]> {
    let url = `${this.apiUrl}/features/categories/${category}`;
    if (applicationId) {
      url += `?applicationId=${applicationId}`;
    }
    return this.http.get<FeatureWithFields[]>(url);
  }

  getFeaturesByRole(role: FeatureRole, applicationId?: string): Observable<FeatureWithFields[]> {
    let url = `${this.apiUrl}/features/roles/${role}`;
    if (applicationId) {
      url += `?applicationId=${applicationId}`;
    }
    return this.http.get<FeatureWithFields[]>(url);
  }

  updateFeature(featureId: string, updateData: Partial<CreateFeatureDto>): Observable<Feature> {
    return this.http.put<Feature>(`${this.apiUrl}/features/${featureId}`, updateData);
  }

  deleteFeature(featureId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/features/${featureId}`);
  }

  // Custom Fields operations
  addCustomField(
    featureId: string,
    dto: CreateFeatureCustomFieldDto,
  ): Observable<FeatureCustomField> {
    return this.http.post<FeatureCustomField>(
      `${this.apiUrl}/features/${featureId}/custom-fields`,
      dto,
    );
  }

  updateCustomField(
    fieldId: string,
    updateData: Partial<CreateFeatureCustomFieldDto>,
  ): Observable<FeatureCustomField> {
    return this.http.put<FeatureCustomField>(
      `${this.apiUrl}/features/custom-fields/${fieldId}`,
      updateData,
    );
  }

  deleteCustomField(fieldId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/features/custom-fields/${fieldId}`);
  }

  // Plan Features operations
  configurePlanFeatures(
    planId: string,
    applicationId: string,
    features: PlanFeatureConfigDto[],
  ): Observable<PlanFeatures> {
    return this.http.post<PlanFeatures>(`${this.apiUrl}/plans/${planId}/features`, {
      applicationId,
      features,
    });
  }

  getPlanFeatures(planId: string, applicationId: string): Observable<PlanFeatures> {
    return this.http.get<PlanFeatures>(`${this.apiUrl}/plans/${planId}/features`, {
      body: { applicationId },
    });
  }

  addFeatureToPlan(
    planId: string,
    featureId: string,
    applicationId: string,
    config: Omit<PlanFeatureConfigDto, 'featureId'>,
  ): Observable<PlanFeatureResponse> {
    return this.http.post<PlanFeatureResponse>(
      `${this.apiUrl}/plans/${planId}/features/${featureId}`,
      {
        applicationId,
        ...config,
      },
    );
  }

  updateFeatureConfiguration(
    planId: string,
    featureId: string,
    applicationId: string,
    updateData: Partial<Omit<PlanFeatureConfigDto, 'featureId'>>,
  ): Observable<PlanFeatureResponse> {
    return this.http.put<PlanFeatureResponse>(
      `${this.apiUrl}/plans/${planId}/features/${featureId}`,
      {
        applicationId,
        ...updateData,
      },
    );
  }

  removeFeatureFromPlan(
    planId: string,
    featureId: string,
    applicationId: string,
  ): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/plans/${planId}/features/${featureId}`, {
      body: { applicationId },
    });
  }

  getAvailableFeatures(applicationId: string): Observable<Feature[]> {
    return this.http.get<Feature[]>(
      `${this.apiUrl}/plans/applications/${applicationId}/available-features`,
    );
  }

  updateFeatureOrder(
    planId: string,
    applicationId: string,
    featureOrders: Array<{ featureId: string; sortOrder: number }>,
  ): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/plans/${planId}/features/order`, {
      applicationId,
      featureOrders,
    });
  }

  // Utility methods
  getFeatureCategoryLabel(category: FeatureCategory): string {
    const labels: Record<FeatureCategory, string> = {
      [FeatureCategory.STORAGE]: 'Stockage',
      [FeatureCategory.COMMUNICATION]: 'Communication',
      [FeatureCategory.API]: 'API',
      [FeatureCategory.ANALYTICS]: 'Analytics',
      [FeatureCategory.SUPPORT]: 'Support',
      [FeatureCategory.SECURITY]: 'Sécurité',
      [FeatureCategory.INTEGRATION]: 'Intégrations',
      [FeatureCategory.CUSTOMIZATION]: 'Personnalisation',
      [FeatureCategory.REPORTING]: 'Rapports',
      [FeatureCategory.USER_MANAGEMENT]: 'Gestion des utilisateurs',
      [FeatureCategory.OTHER]: 'Autres',
    };
    return labels[category] || category;
  }

  getFeatureStatusLabel(status: FeatureStatus): string {
    const labels: Record<FeatureStatus, string> = {
      [FeatureStatus.ENABLED]: 'Activé',
      [FeatureStatus.DISABLED]: 'Désactivé',
      [FeatureStatus.LIMITED]: 'Limité',
      [FeatureStatus.UNLIMITED]: 'Illimité',
    };
    return labels[status] || status;
  }

  getFieldUnitLabel(unit: FieldUnit): string {
    const labels: Record<FieldUnit, string> = {
      [FieldUnit.EMAILS]: 'emails',
      [FieldUnit.USERS]: 'utilisateurs',
      [FieldUnit.GIGABYTES]: 'GB',
      [FieldUnit.API_CALLS]: 'appels API',
      [FieldUnit.HOURS]: 'heures',
      [FieldUnit.MONTHS]: 'mois',
      [FieldUnit.COUNT]: '',
      [FieldUnit.PERCENTAGE]: '%',
      [FieldUnit.NONE]: '',
      // Add more as needed
    };
    return labels[unit] || unit;
  }

  formatFieldValue(value: any, unit: FieldUnit, isUnlimited: boolean): string {
    if (isUnlimited || value === -1) {
      return 'Illimité';
    }

    if (value === 0) {
      return 'Aucun';
    }

    const unitLabel = this.getFieldUnitLabel(unit);

    if (unit === FieldUnit.EMAILS) {
      return `${value} emails/mois`;
    }

    if (unit === FieldUnit.GIGABYTES) {
      return `${value} GB`;
    }

    if (unit === FieldUnit.USERS) {
      return `${value} utilisateurs`;
    }

    if (unit === FieldUnit.API_CALLS) {
      return `${value} appels API/mois`;
    }

    if (unitLabel) {
      return `${value} ${unitLabel}`;
    }

    return value.toString();
  }
}
