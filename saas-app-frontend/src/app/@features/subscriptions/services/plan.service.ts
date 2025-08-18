import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CreatePlanDto {
  name: string;
  description: string;
  type: string;
  billingCycle: string;
  price: number;
  currencyId: string;
  applicationId: string;
  features?: Record<string, any>;
  limits?: Record<string, number>;
  includedFeatures?: string[];
  isPopular?: boolean;
}

export interface UpdatePlanDto {
  name?: string;
  description?: string;
  price?: number;
  features?: Record<string, any>;
  limits?: Record<string, number>;
  includedFeatures?: string[];
  isActive?: boolean;
  isPopular?: boolean;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/plans`;

  constructor(private http: HttpClient) {}

  getPlans(applicationId?: string, type?: string): Observable<ApiResponse<any[]>> {
    let url = this.apiUrl;
    const params = new URLSearchParams();

    if (applicationId) params.append('applicationId', applicationId);
    if (type) params.append('type', type);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http.get<ApiResponse<any[]>>(url);
  }

  getPlanById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  createPlan(dto: CreatePlanDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, dto);
  }

  updatePlan(id: string, dto: UpdatePlanDto): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}`, dto);
  }

  deletePlan(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  getPlanPricing(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/pricing`);
  }
}
