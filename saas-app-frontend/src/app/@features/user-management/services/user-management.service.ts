import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  plan: string;
  role: 'customer' | 'admin' | 'manager';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  plan: string;
  role: 'customer' | 'admin' | 'manager';
  password: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  streetAddress?: string;
  city?: string;
  zipCode?: string;
  plan?: string;
  role?: 'customer' | 'admin' | 'manager';
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtenir tous les utilisateurs
  getAllUsers(): Observable<User[]> {
    console.log('🔍 Appel API - Récupération de tous les utilisateurs...');
    return this.http.get<User[]>(`${this.baseUrl}/api/v1/user-management`);
  }

  // Obtenir un utilisateur par ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/api/v1/user-management/${id}`);
  }

  // Créer un nouvel utilisateur
  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/api/v1/user-management`, userData);
  }

  // Mettre à jour un utilisateur
  updateUser(id: string, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/api/v1/user-management/${id}`, userData);
  }

  // Supprimer un utilisateur
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/user-management/${id}`);
  }

  // Activer/Désactiver un utilisateur
  toggleUserStatus(id: string, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/api/v1/user-management/${id}/status`, {
      isActive,
    });
  }

  // Réinitialiser le mot de passe d'un utilisateur
  resetUserPassword(id: string): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(
      `${this.baseUrl}/api/v1/user-management/${id}/reset-password`,
      {},
    );
  }
}
