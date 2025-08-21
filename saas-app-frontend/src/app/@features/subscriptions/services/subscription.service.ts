import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CreateSubscriptionDto {
  planId: string;
  paymentMethodId?: string;
  billingCycle: string;
  couponCode?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  // Use the actual mapped route from backend logs: /api/v1/api/v1/subscriptions
  private readonly apiUrl = `${environment.apiUrl}/api/v1/api/v1/subscriptions`;

  constructor(private http: HttpClient) {}

  createSubscription(dto: CreateSubscriptionDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, dto);
  }

  getMySubscriptions(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}`);
  }

  updateSubscriptionPlan(subscriptionId: string, planId: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${subscriptionId}/upgrade`, {
      planId,
    });
  }

  cancelSubscription(subscriptionId: string, immediately = false): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${subscriptionId}/cancel?immediately=${immediately}`,
      {},
    );
  }

  reactivateSubscription(subscriptionId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${subscriptionId}/reactivate`, {});
  }
}
