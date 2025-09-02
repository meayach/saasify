import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationFeature } from './application-feature.service';

export interface PlanFeatureValue {
  _id?: string;
  planId: string;
  featureId: string;
  value: number;
  isUnlimited: boolean;
  displayValue: string;
  feature?: ApplicationFeature;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePlanFeatureValueRequest {
  planId: string;
  featureId: string;
  value: number;
  isUnlimited?: boolean;
  displayValue: string;
}

export interface UpdatePlanFeatureValueRequest {
  value?: number;
  isUnlimited?: boolean;
  displayValue?: string;
}

export interface BulkUpdatePlanFeatureValuesRequest {
  planId: string;
  featureValues: Array<{
    featureId: string;
    value: number;
    isUnlimited?: boolean;
    displayValue: string;
  }>;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PlanFeatureValueService {
  private baseUrl = 'http://localhost:3001/api/v1/plan-feature-values';

  constructor(private http: HttpClient) {}

  createPlanFeatureValue(featureValue: CreatePlanFeatureValueRequest): Observable<ApiResponse<PlanFeatureValue>> {
    return this.http.post<ApiResponse<PlanFeatureValue>>(this.baseUrl, featureValue);
  }

  bulkUpdatePlanFeatureValues(bulkUpdate: BulkUpdatePlanFeatureValuesRequest): Observable<ApiResponse<PlanFeatureValue[]>> {
    return this.http.post<ApiResponse<PlanFeatureValue[]>>(`${this.baseUrl}/bulk`, bulkUpdate);
  }

  getPlanFeatureValues(planId?: string, featureId?: string): Observable<ApiResponse<PlanFeatureValue[]>> {
    let params = new HttpParams();
    if (planId) {
      params = params.set('planId', planId);
    }
    if (featureId) {
      params = params.set('featureId', featureId);
    }
    return this.http.get<ApiResponse<PlanFeatureValue[]>>(this.baseUrl, { params });
  }

  getPlanFeatureValueById(id: string): Observable<ApiResponse<PlanFeatureValue>> {
    return this.http.get<ApiResponse<PlanFeatureValue>>(`${this.baseUrl}/${id}`);
  }

  getPlanFeatureValueByPlanAndFeature(planId: string, featureId: string): Observable<ApiResponse<PlanFeatureValue>> {
    return this.http.get<ApiResponse<PlanFeatureValue>>(`${this.baseUrl}/plan/${planId}/feature/${featureId}`);
  }

  updatePlanFeatureValue(id: string, featureValue: UpdatePlanFeatureValueRequest): Observable<ApiResponse<PlanFeatureValue>> {
    return this.http.patch<ApiResponse<PlanFeatureValue>>(`${this.baseUrl}/${id}`, featureValue);
  }

  deletePlanFeatureValue(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  deletePlanFeatureValuesByPlan(planId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/plan/${planId}`);
  }

  deletePlanFeatureValuesByFeature(featureId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/feature/${featureId}`);
  }

  // Helper method to generate display value
  generateDisplayValue(value: number, isUnlimited: boolean, unitDisplayName: string): string {
    if (isUnlimited || value === -1) {
      return 'Illimité';
    }
    return `${value} ${unitDisplayName}`;
  }
}