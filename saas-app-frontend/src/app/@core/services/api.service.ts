import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER_ADMIN' | 'CUSTOMER_MANAGER' | 'CUSTOMER_DEVELOPER';
  isActive: boolean;
  companyName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Application {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  ownerId: string;
  logoUrl?: string;
  websiteUrl?: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Plan {
  id?: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'WEEKLY';
  features: string[];
  limitations: any;
  applicationId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Subscription {
  id?: string;
  planId: string;
  applicationId: string;
  customerId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
  startDate: Date;
  endDate?: Date;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'WEEKLY';
  price: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl || 'http://localhost:3001/api/v1';

  constructor(private http: HttpClient) {}

  // User API
  createUser(user: Partial<User>): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, user);
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: string, user: Partial<User>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }

  // Application API
  createApplication(application: Partial<Application>): Observable<any> {
    return this.http.post(`${this.baseUrl}/applications`, application);
  }

  getApplications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/applications`);
  }

  getMyApplications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/applications/my-applications`);
  }

  getApplicationById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/applications/${id}`);
  }

  updateApplication(id: string, application: Partial<Application>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/applications/${id}`, application);
  }

  deleteApplication(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/applications/${id}`);
  }

  launchApplication(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/applications/${id}/launch`, {});
  }

  // Plan API
  createPlan(plan: Partial<Plan>): Observable<any> {
    return this.http.post(`${this.baseUrl}/plans`, plan);
  }

  getPlans(): Observable<any> {
    return this.http.get(`${this.baseUrl}/plans`);
  }

  getPlansByApplication(applicationId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/plans/application/${applicationId}`);
  }

  getPlanById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/plans/${id}`);
  }

  updatePlan(id: string, plan: Partial<Plan>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/plans/${id}`, plan);
  }

  deletePlan(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/plans/${id}`);
  }

  activatePlan(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/plans/${id}/activate`, {});
  }

  deactivatePlan(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/plans/${id}/deactivate`, {});
  }

  // Subscription API
  createSubscription(subscription: Partial<Subscription>): Observable<any> {
    return this.http.post(`${this.baseUrl}/subscriptions`, subscription);
  }

  getSubscriptions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/subscriptions`);
  }

  getSubscriptionsByCustomer(customerId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/subscriptions/customer/${customerId}`);
  }

  getSubscriptionById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/subscriptions/${id}`);
  }

  updateSubscription(id: string, subscription: Partial<Subscription>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/subscriptions/${id}`, subscription);
  }

  cancelSubscription(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/subscriptions/${id}/cancel`, {});
  }

  renewSubscription(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/subscriptions/${id}/renew`, {});
  }

  // Analytics
  getSubscriptionAnalytics(applicationId?: string): Observable<any> {
    const params = applicationId ? `?applicationId=${applicationId}` : '';
    return this.http.get(`${this.baseUrl}/subscriptions/analytics${params}`);
  }

  getPaymentAnalytics(customerId?: string): Observable<any> {
    const params = customerId ? `?customerId=${customerId}` : '';
    return this.http.get(`${this.baseUrl}/payments/analytics${params}`);
  }
}
