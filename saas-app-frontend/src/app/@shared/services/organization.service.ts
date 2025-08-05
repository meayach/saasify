import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface OrganizationSettings {
  _id?: string;
  companyName: string;
  email: string;
  phone: string;
  description: string;
  website?: string;
  industry?: string;
  timezone?: string;
  language?: string;
  logoUrl?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl || 'http://localhost:3001'}/api/organization`;

  constructor(private http: HttpClient) {}

  // Récupérer les paramètres de l'organisation
  getOrganizationSettings(): Observable<OrganizationSettings> {
    console.log('OrganizationService: Récupération des données depuis:', `${this.apiUrl}/settings`);

    return this.http.get<ApiResponse<OrganizationSettings>>(`${this.apiUrl}/settings`).pipe(
      map((response) => {
        console.log('OrganizationService: Données récupérées:', response);
        return response.data;
      }),
    );
  }

  // Sauvegarder les paramètres de l'organisation
  saveOrganizationSettings(settings: OrganizationSettings): Observable<OrganizationSettings> {
    return this.http
      .post<ApiResponse<OrganizationSettings>>(`${this.apiUrl}/settings`, settings)
      .pipe(map((response) => response.data));
  }

  // Mettre à jour les paramètres de l'organisation
  updateOrganizationSettings(settings: OrganizationSettings): Observable<OrganizationSettings> {
    console.log('OrganizationService: Envoi des données vers:', `${this.apiUrl}/settings`);
    console.log('OrganizationService: Données à envoyer:', settings);

    return this.http
      .put<ApiResponse<OrganizationSettings>>(`${this.apiUrl}/settings`, settings)
      .pipe(
        map((response) => {
          console.log('OrganizationService: Réponse reçue:', response);
          return response.data;
        }),
      );
  }

  // Uploader le logo
  uploadLogo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('logo', file);

    console.log('OrganizationService: Upload du logo vers:', `${this.apiUrl}/upload-logo`);

    return this.http
      .post<ApiResponse<{ logoUrl: string }>>(`${this.apiUrl}/upload-logo`, formData)
      .pipe(
        map((response) => {
          console.log('OrganizationService: Réponse upload logo:', response);
          return response;
        }),
      );
  }
}
