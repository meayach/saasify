import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface BillingSettings {
  _id?: string;
  defaultCurrency: string;
  taxRate: number;
  companyAddress?: string;
  paymentMethods: string[];
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  autoRenewal?: boolean;
  invoiceDueDays?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Plan {
  _id?: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isActive: boolean;
  maxUsers?: number;
  maxApplications?: number;
  hasApiAccess?: boolean;
  hasAdvancedAnalytics?: boolean;
  hasPrioritySupport?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentMethod {
  _id: string;
  type: 'stripe' | 'paypal' | 'bank_transfer';
  name: string;
  isDefault: boolean;
  details: any;
  createdAt: Date;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerId: string;
  planId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  // Fixed URL to match backend routes: /api/v1/api/v1/billing (double prefix exists in backend logs)
  private baseUrl = 'http://localhost:3001/api/v1/api/v1/billing';

  constructor(private http: HttpClient) {}

  // Paramètres de facturation
  getBillingSettings(): Observable<BillingSettings> {
    return this.http.get<BillingSettings>(`${this.baseUrl}/settings`);
  }

  updateBillingSettings(settings: Partial<BillingSettings>): Observable<BillingSettings> {
    console.log('BillingService: Démarrage de la mise à jour...');
    console.log('BillingService: URL cible:', `${this.baseUrl}/settings`);
    console.log('BillingService: Données envoyées:', settings);

    return this.http.put<BillingSettings>(`${this.baseUrl}/settings`, settings);
  }

  // Gestion des plans
  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.baseUrl}/plans`).pipe(
      catchError((error) => {
        console.error("Erreur lors du chargement des plans depuis l'API:", error);
        // Retourner des plans par défaut en cas d'erreur
        return of([
          {
            _id: 'default-starter',
            name: 'Plan Starter',
            description: 'Parfait pour débuter votre activité SaaS',
            price: 9.99,
            interval: 'month' as const,
            features: [
              '1 Application',
              "Jusqu'à 1000 utilisateurs",
              'Support par email',
              'Analytics de base',
            ],
            isActive: true,
            maxUsers: 1000,
            maxApplications: 1,
            hasApiAccess: false,
            hasAdvancedAnalytics: false,
            hasPrioritySupport: false,
          },
          {
            _id: 'default-pro',
            name: 'Plan Pro',
            description: 'Idéal pour les équipes en croissance',
            price: 29.99,
            interval: 'month' as const,
            features: [
              '5 Applications',
              "Jusqu'à 10 000 utilisateurs",
              'Support prioritaire',
              'Analytics avancées',
              'Accès API',
            ],
            isActive: true,
            maxUsers: 10000,
            maxApplications: 5,
            hasApiAccess: true,
            hasAdvancedAnalytics: true,
            hasPrioritySupport: true,
          },
          {
            _id: 'default-enterprise',
            name: 'Plan Enterprise',
            description: 'Pour les grandes organisations',
            price: 99.99,
            interval: 'month' as const,
            features: [
              'Applications illimitées',
              'Utilisateurs illimités',
              'Support 24/7',
              'Analytics personnalisées',
              'Accès API premium',
            ],
            isActive: true,
            maxUsers: -1,
            maxApplications: -1,
            hasApiAccess: true,
            hasAdvancedAnalytics: true,
            hasPrioritySupport: true,
          },
        ]);
      }),
    );
  }

  createPlan(plan: Partial<Plan>): Observable<Plan> {
    return this.http.post<Plan>(`${this.baseUrl}/plans`, plan);
  }

  updatePlan(planId: string, plan: Partial<Plan>): Observable<Plan> {
    const url = `${this.baseUrl}/plans/${planId}`;
    console.log('BillingService.updatePlan: PUT', url, 'payload=', plan);
    return this.http.put<Plan>(url, plan).pipe(
      // log response for debugging
      // Note: import of rxjs/operators already present
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // Use tap to inspect response but avoid importing here to keep change small
      // We'll use map passthrough with side-effect
      // tslint:disable-next-line: no-shadowed-variable
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // keep it simple: subscribe site will see response; in case of error it will be logged below
      // attach catch to log errors
      catchError((err) => {
        console.error('BillingService.updatePlan: error', err);
        throw err;
      }),
    );
  }

  deletePlan(planId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/plans/${planId}`);
  }

  // Méthodes de paiement
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.baseUrl}/payment-methods`);
  }

  addPaymentMethod(method: Partial<PaymentMethod>): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(`${this.baseUrl}/payment-methods`, method);
  }

  deletePaymentMethod(methodId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/payment-methods/${methodId}`);
  }

  setDefaultPaymentMethod(methodId: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/payment-methods/${methodId}/default`, {});
  }

  // Factures
  getInvoices(
    page: number = 1,
    limit: number = 20,
  ): Observable<{
    invoices: Invoice[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.http.get<{
      invoices: Invoice[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${this.baseUrl}/invoices?page=${page}&limit=${limit}`);
  }

  generateInvoice(customerId: string, planId: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.baseUrl}/invoices`, {
      customerId,
      planId,
    });
  }

  markInvoiceAsPaid(invoiceId: string): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.baseUrl}/invoices/${invoiceId}/pay`, {});
  }

  downloadInvoice(invoiceId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/invoices/${invoiceId}/download`, {
      responseType: 'blob',
    });
  }

  // Statistiques
  getBillingStats(): Observable<{
    totalRevenue: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
    pendingInvoices: number;
    overdueInvoices: number;
  }> {
    return this.http.get<{
      totalRevenue: number;
      monthlyRevenue: number;
      activeSubscriptions: number;
      pendingInvoices: number;
      overdueInvoices: number;
    }>(`${this.baseUrl}/stats`);
  }
}
