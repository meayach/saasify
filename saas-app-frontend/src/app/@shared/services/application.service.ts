import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Application {
  _id?: string;
  name: string;
  logoUrl?: string;
  defaultPlanId?: string;
  status: 'active' | 'maintenance' | 'inactive';
  isActive?: boolean;
  deployedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApplicationStats {
  totalApplications: number;
  activeApplications: number;
  deploymentsToday: number;
  maintenanceApplications: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private baseUrl = 'http://localhost:3001/api/v1/dashboard-applications';

  constructor(private http: HttpClient) {}

  // Récupérer les statistiques des applications
  getApplicationStats(): Observable<ApplicationStats> {
    return this.http.get<ApplicationStats>(`${this.baseUrl}/stats`);
  }

  // Alias pour la compatibilité
  getStats(): Observable<ApplicationStats> {
    return this.getApplicationStats();
  }

  // Récupérer toutes les applications
  getApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.baseUrl}`);
  }

  // Créer une nouvelle application
  createApplication(application: Partial<Application>): Observable<Application> {
    return this.http.post<Application>(`${this.baseUrl}`, application);
  }

  // Mettre à jour une application
  updateApplication(id: string, application: Partial<Application>): Observable<Application> {
    return this.http.put<Application>(`${this.baseUrl}/${id}`, application);
  }

  // Mettre à jour le statut d'une application
  updateApplicationStatus(id: string, isActive: boolean): Observable<Application> {
    return this.http.patch<Application>(`${this.baseUrl}/${id}/status`, { isActive });
  }

  // Supprimer une application
  deleteApplication(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
