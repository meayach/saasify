import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { PaymentMethods, DEFAULT_PAYMENT_METHODS } from '../constants/payment-methods';

export interface ApplicationConfigurationRequest {
  applicationId: string;
  applicationName: string;
  domainName: string;
  isActive: boolean;
  logo?: File;
  paymentMethods: PaymentMethods;
}

export interface ApplicationConfigurationResponse {
  _id: string;
  applicationId: string;
  applicationName: string;
  domainName: string;
  isActive: boolean;
  logoUrl?: string;
  paymentMethods: {
    paypal: boolean;
    wize: boolean;
    payonner: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationConfigurationService {
  private baseUrl = 'http://localhost:3001/api/v1/application-configuration';
  private useMockData = false; // Mode production - connecté à la base de données

  constructor(private http: HttpClient) {}

  // Créer ou mettre à jour une configuration d'application
  saveConfiguration(
    config: ApplicationConfigurationRequest,
  ): Observable<ApplicationConfigurationResponse> {
    if (this.useMockData) {
      // Simulation de sauvegarde avec délai
      const mockResponse: ApplicationConfigurationResponse = {
        _id: 'mock-' + Date.now(),
        applicationId: config.applicationId,
        applicationName: config.applicationName,
        domainName: config.domainName,
        isActive: config.isActive,
        paymentMethods: config.paymentMethods || { ...DEFAULT_PAYMENT_METHODS },
        logoUrl: config.logo ? 'mock-logo-url.png' : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return of(mockResponse).pipe(delay(1500)); // Délai de 1.5 secondes pour simuler l'API
    }

    // Si il y a un logo, utiliser FormData, sinon JSON
    if (config.logo) {
      const formData = new FormData();
      formData.append('applicationId', config.applicationId);
      formData.append('applicationName', config.applicationName);
      formData.append('domainName', config.domainName);
      formData.append('isActive', config.isActive.toString());
      formData.append('paymentMethods', JSON.stringify(config.paymentMethods));
      formData.append('logo', config.logo);

      return this.http.post<ApplicationConfigurationResponse>(`${this.baseUrl}`, formData);
    } else {
      // Envoyer en JSON sans logo
      const jsonData = {
        applicationId: config.applicationId,
        applicationName: config.applicationName,
        domainName: config.domainName,
        isActive: config.isActive,
        paymentMethods: config.paymentMethods,
      };

      return this.http.post<ApplicationConfigurationResponse>(`${this.baseUrl}`, jsonData);
    }
  }

  // Récupérer la configuration d'une application
  getConfiguration(applicationId: string): Observable<ApplicationConfigurationResponse> {
    if (this.useMockData) {
      // Simuler qu'aucune configuration n'existe encore
      return throwError({ status: 404, message: 'Configuration non trouvée' });
    }
    return this.http.get<ApplicationConfigurationResponse>(`${this.baseUrl}/${applicationId}`);
  }

  // Mettre à jour une configuration existante
  updateConfiguration(
    configId: string,
    config: Partial<ApplicationConfigurationRequest>,
  ): Observable<ApplicationConfigurationResponse> {
    if (this.useMockData) {
      // Simulation de mise à jour
      const mockResponse: ApplicationConfigurationResponse = {
        _id: configId,
        applicationId: config.applicationId || 'mock-app-id',
        applicationName: config.applicationName || 'Application Mock',
        domainName: config.domainName || 'mock.saasify.com',
        isActive: config.isActive !== undefined ? config.isActive : true,
        paymentMethods: config.paymentMethods || { ...DEFAULT_PAYMENT_METHODS },
        logoUrl: config.logo ? 'updated-logo-url.png' : undefined,
        createdAt: new Date(Date.now() - 86400000), // Il y a 1 jour
        updatedAt: new Date(),
      };
      return of(mockResponse).pipe(delay(1500));
    }

    // Si il y a un logo, utiliser FormData, sinon JSON
    if (config.logo) {
      const formData = new FormData();
      if (config.applicationName) {
        formData.append('applicationName', config.applicationName);
      }
      if (config.domainName) {
        formData.append('domainName', config.domainName);
      }
      if (config.isActive !== undefined) {
        formData.append('isActive', config.isActive.toString());
      }
      if (config.paymentMethods) {
        formData.append('paymentMethods', JSON.stringify(config.paymentMethods));
      }
      formData.append('logo', config.logo);

      return this.http.put<ApplicationConfigurationResponse>(
        `${this.baseUrl}/${configId}`,
        formData,
      );
    } else {
      // Envoyer en JSON sans logo
      const jsonData: any = {};
      if (config.applicationName) jsonData.applicationName = config.applicationName;
      if (config.domainName) jsonData.domainName = config.domainName;
      if (config.isActive !== undefined) jsonData.isActive = config.isActive;
      if (config.paymentMethods) jsonData.paymentMethods = config.paymentMethods;

      return this.http.put<ApplicationConfigurationResponse>(
        `${this.baseUrl}/${configId}`,
        jsonData,
      );
    }
  }

  // Supprimer une configuration
  deleteConfiguration(configId: string): Observable<void> {
    if (this.useMockData) {
      return of(undefined).pipe(delay(1000));
    }
    return this.http.delete<void>(`${this.baseUrl}/${configId}`);
  }

  // Lister toutes les configurations
  getAllConfigurations(): Observable<ApplicationConfigurationResponse[]> {
    if (this.useMockData) {
      return of([]).pipe(delay(500));
    }
    return this.http.get<ApplicationConfigurationResponse[]>(`${this.baseUrl}`);
  }
}
