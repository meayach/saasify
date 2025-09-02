import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApplicationFeature {
  _id?: string;
  name: string;
  key: string;
  unit: string;
  unitDisplayName: string;
  description?: string;
  applicationId: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateApplicationFeatureRequest {
  name: string;
  key: string;
  unit: string;
  unitDisplayName: string;
  description?: string;
  applicationId: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateApplicationFeatureRequest {
  name?: string;
  key?: string;
  unit?: string;
  unitDisplayName?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationFeatureService {
  private baseUrl = 'http://localhost:3001/api/v1/application-features';

  constructor(private http: HttpClient) {}

  createFeature(feature: CreateApplicationFeatureRequest): Observable<ApiResponse<ApplicationFeature>> {
    return this.http.post<ApiResponse<ApplicationFeature>>(this.baseUrl, feature);
  }

  getFeatures(applicationId?: string): Observable<ApiResponse<ApplicationFeature[]>> {
    let params = new HttpParams();
    if (applicationId) {
      params = params.set('applicationId', applicationId);
    }
    return this.http.get<ApiResponse<ApplicationFeature[]>>(this.baseUrl, { params });
  }

  getFeatureById(id: string): Observable<ApiResponse<ApplicationFeature>> {
    return this.http.get<ApiResponse<ApplicationFeature>>(`${this.baseUrl}/${id}`);
  }

  updateFeature(id: string, feature: UpdateApplicationFeatureRequest): Observable<ApiResponse<ApplicationFeature>> {
    return this.http.patch<ApiResponse<ApplicationFeature>>(`${this.baseUrl}/${id}`, feature);
  }

  deleteFeature(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  activateFeature(id: string): Observable<ApiResponse<ApplicationFeature>> {
    return this.http.patch<ApiResponse<ApplicationFeature>>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivateFeature(id: string): Observable<ApiResponse<ApplicationFeature>> {
    return this.http.patch<ApiResponse<ApplicationFeature>>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}