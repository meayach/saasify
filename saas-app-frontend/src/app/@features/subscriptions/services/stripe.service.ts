import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

declare var Stripe: any;

export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentMethodData {
  type: string;
  card?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  billing_details?: {
    name: string;
    email: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripe: any;
  private elements: any;

  constructor(private http: HttpClient) {
    this.initializeStripe();
  }

  private initializeStripe(): void {
    // Load Stripe.js
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        this.stripe = window.Stripe(environment.stripePublicKey);
      };
      document.head.appendChild(script);
    } else {
      this.stripe = window.Stripe(environment.stripePublicKey);
    }
  }

  getStripe(): any {
    return this.stripe;
  }

  createElement(type: string, options: any = {}): any {
    if (!this.elements) {
      this.elements = this.stripe.elements();
    }
    return this.elements.create(type, options);
  }

  async confirmPayment(clientSecret: string, paymentMethodData: any): Promise<any> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    return this.stripe.confirmPayment({
      clientSecret,
      confirmParams: paymentMethodData,
    });
  }

  async confirmCardPayment(clientSecret: string, paymentMethod: any): Promise<any> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    return this.stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod,
    });
  }

  async createPaymentMethod(paymentMethodData: PaymentMethodData): Promise<any> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    return this.stripe.createPaymentMethod(paymentMethodData);
  }

  async retrievePaymentIntent(clientSecret: string): Promise<any> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    return this.stripe.retrievePaymentIntent(clientSecret);
  }

  // Backend API calls
  createSubscriptionPaymentIntent(data: {
    planId: string;
    billingCycle: string;
    paymentMethodId?: string;
    couponCode?: string;
  }) {
    return this.http.post<any>(
      `${environment.apiUrl}/api/v1/payments/create-subscription-intent`,
      data,
    );
  }

  savePaymentMethod(paymentMethodId: string) {
    return this.http.post<any>(`${environment.apiUrl}/api/v1/payments/save-payment-method`, {
      paymentMethodId,
    });
  }

  getPaymentMethods() {
    return this.http.get<any>(`${environment.apiUrl}/api/v1/payments/payment-methods`);
  }

  deletePaymentMethod(paymentMethodId: string) {
    return this.http.delete<any>(
      `${environment.apiUrl}/api/v1/payments/payment-methods/${paymentMethodId}`,
    );
  }

  setDefaultPaymentMethod(paymentMethodId: string) {
    return this.http.post<any>(`${environment.apiUrl}/api/v1/payments/set-default-payment-method`, {
      paymentMethodId,
    });
  }
}

// Add to window object for TypeScript
declare global {
  interface Window {
    Stripe: any;
  }
}
