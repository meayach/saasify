import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface User {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
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

export interface UpdateUserDto {
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
  private apiUrl = 'http://127.0.0.1:3001/api/v1/user-management';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  getAllUsers(): Observable<User[]> {
    console.log('🔍 Appel API - Récupération de tous les utilisateurs...');
    return this.http.get<User[]>(this.apiUrl).pipe(
      map((users) => {
        console.log('✅ Utilisateurs reçus:', users);
        return users;
      }),
      catchError(this.handleError),
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createUser(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData).pipe(catchError(this.handleError));
  }

  updateUser(id: string, userData: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData).pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  updateUserStatus(id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'): Observable<User> {
    return this.http
      .patch<User>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(catchError(this.handleError));
  }

  resetUserPassword(id: string): Observable<{ temporaryPassword: string }> {
    return this.http
      .post<{ temporaryPassword: string }>(`${this.apiUrl}/${id}/reset-password`, {})
      .pipe(catchError(this.handleError));
  }
}
