import { Injectable } frexport class ApplicationService {
  private baseUrl = 'http://localhost:3001/api/v1/dashboard-applications'; // URL corrigée

  constructor(private http: HttpClient) {}@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Application {
  _id?: string;
  name: string;
  description: string;
  status: 'active' | 'maintenance' | 'inactive';
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
  private baseUrl = 'http://localhost:3000/api/v1'; // URL de votre backend NestJS

  constructor(private http: HttpClient) {}

  // Récupérer les statistiques des applications
  getApplicationStats(): Observable<ApplicationStats> {
    return this.http.get<ApplicationStats>(`${this.baseUrl}/dashboard-applications/stats`);
  }

  // Récupérer toutes les applications
  getApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.baseUrl}/dashboard-applications`);
  }

  // Créer une nouvelle application
  createApplication(application: Partial<Application>): Observable<Application> {
    return this.http.post<Application>(`${this.baseUrl}/dashboard-applications`, application);
  }

  // Mettre à jour une application
  updateApplication(id: string, application: Partial<Application>): Observable<Application> {
    return this.http.put<Application>(`${this.baseUrl}/dashboard-applications/${id}`, application);
  }

  // Supprimer une application
  deleteApplication(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/dashboard-applications/${id}`);
  }
}
