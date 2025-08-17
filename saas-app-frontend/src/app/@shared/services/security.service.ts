import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SecuritySettings {
  _id?: string;
  twoFactorEnabled: boolean;
  sessionTimeout: number; // en minutes
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  auditLogEnabled: boolean;
  loginAttempts: {
    maxAttempts: number;
    lockoutDuration: number; // en minutes
  };
  allowedIpRanges: string[];
  apiAccessEnabled: boolean;
  webhookUrls: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuditLog {
  _id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  timestamp: Date;
  details?: any;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private baseUrl = `${environment.apiUrl || 'http://localhost:3001/api/v1'}/api/security`;

  constructor(private http: HttpClient) {}

  // Valider les paramètres de sécurité avant envoi
  private validateSecuritySettings(settings: Partial<SecuritySettings>): string | null {
    if (settings.sessionTimeout && settings.sessionTimeout < 5) {
      return "La durée de session doit être d'au moins 5 minutes";
    }
    if (settings.sessionTimeout && settings.sessionTimeout > 1440) {
      return 'La durée de session ne peut pas dépasser 24 heures (1440 minutes)';
    }
    if (settings.passwordPolicy) {
      if (settings.passwordPolicy.minLength < 4) {
        return "La longueur minimale du mot de passe doit être d'au moins 4 caractères";
      }
      if (settings.passwordPolicy.minLength > 128) {
        return 'La longueur minimale du mot de passe ne peut pas dépasser 128 caractères';
      }
    }
    if (settings.loginAttempts) {
      if (settings.loginAttempts.maxAttempts < 1) {
        return "Le nombre maximum de tentatives de connexion doit être d'au moins 1";
      }
      if (settings.loginAttempts.lockoutDuration < 1) {
        return "La durée de verrouillage doit être d'au moins 1 minute";
      }
    }
    return null;
  }

  // Récupérer les paramètres de sécurité
  getSecuritySettings(): Observable<SecuritySettings> {
    console.log('SecurityService: Récupération des paramètres depuis:', `${this.baseUrl}/settings`);

    return this.http.get<ApiResponse<SecuritySettings>>(`${this.baseUrl}/settings`).pipe(
      map((response) => {
        console.log('SecurityService: Réponse reçue:', response);
        if (response.success) {
          return response.data;
        } else {
          throw new Error(
            response.message || 'Erreur lors du chargement des paramètres de sécurité',
          );
        }
      }),
    );
  }

  // Mettre à jour les paramètres de sécurité
  updateSecuritySettings(settings: Partial<SecuritySettings>): Observable<SecuritySettings> {
    console.log('SecurityService: Démarrage de la mise à jour...');
    console.log('SecurityService: URL cible:', `${this.baseUrl}/settings`);
    console.log('SecurityService: Données reçues:', settings);

    // Validation côté client
    const validationError = this.validateSecuritySettings(settings);
    if (validationError) {
      console.error('SecurityService: Erreur de validation:', validationError);
      return throwError(() => new Error(validationError));
    }

    console.log('SecurityService: Validation réussie');
    console.log('SecurityService: Envoi de la requête HTTP PUT...');

    return this.http.put<ApiResponse<SecuritySettings>>(`${this.baseUrl}/settings`, settings).pipe(
      map((response) => {
        console.log('SecurityService: Réponse HTTP reçue:', response);
        if (response.success) {
          console.log('SecurityService: Succès - données extraites:', response.data);
          return response.data;
        } else {
          console.error('SecurityService: Échec selon la réponse:', response.message);
          throw new Error(
            response.message || 'Erreur lors de la sauvegarde des paramètres de sécurité',
          );
        }
      }),
    );
  }

  // Récupérer les logs d'audit
  getAuditLogs(
    page: number = 1,
    limit: number = 50,
  ): Observable<{
    logs: AuditLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.http
      .get<
        ApiResponse<{
          logs: AuditLog[];
          total: number;
          page: number;
          totalPages: number;
        }>
      >(`${this.baseUrl}/audit-logs?page=${page}&limit=${limit}`)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || "Erreur lors du chargement des logs d'audit");
          }
        }),
      );
  }

  // Tester la connexion 2FA
  test2FA(code: string): Observable<{ valid: boolean }> {
    return this.http
      .post<ApiResponse<{ valid: boolean }>>(`${this.baseUrl}/test-2fa`, { code })
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || 'Erreur lors de la validation du code 2FA');
          }
        }),
      );
  }

  // Générer une nouvelle clé API
  generateApiKey(): Observable<{ apiKey: string }> {
    return this.http
      .post<ApiResponse<{ apiKey: string }>>(`${this.baseUrl}/generate-api-key`, {})
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || 'Erreur lors de la génération de la clé API');
          }
        }),
      );
  }

  // Révoquer une clé API
  revokeApiKey(apiKeyId: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/api-keys/${apiKeyId}`).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.message || 'Erreur lors de la révocation de la clé API');
        }
      }),
    );
  }
}
