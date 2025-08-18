import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  streetAddress?: string;
  city?: string;
  zipCode?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/v1/users`;

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    const token = localStorage.getItem('authToken');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      }),
    };
  }

  /**
   * Récupère le profil utilisateur actuel
   */
  getCurrentUserProfile(): Observable<UserProfile> {
    const token = localStorage.getItem('authToken');

    if (token) {
      return this.http
        .get<ApiResponse<UserProfile>>(`${this.apiUrl}/profile`, this.getHttpOptions())
        .pipe(
          map((response) => {
            if (response.success && response.data) {
              return response.data;
            }
            throw new Error(response.message || 'Erreur lors de la récupération du profil');
          }),
          catchError((err) => {
            // If protected profile endpoint returns 404 (not found), try fallback by email
            const isNotFound = err && (err.status === 404 || err === 'Utilisateur non trouvé');
            if (isNotFound) {
              try {
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const email = currentUser?.email;
                if (email) {
                  return this.http
                    .get<UserProfile>(`${this.apiUrl}/email/${encodeURIComponent(email)}`)
                    .pipe(
                      map((response: any) => {
                        if (response && response.data) {
                          return response.data as UserProfile;
                        }
                        return response as UserProfile;
                      }),
                      catchError(this.handleError),
                    );
                }
              } catch (e) {
                // JSON parse error or other problem - fall through to throw original error
              }
            }

            return throwError(() => err);
          }),
        );
    }

    // Fallback: if we don't have a token, try to fetch by email using the public endpoint
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const email = currentUser?.email;
      if (email) {
        return this.http.get<UserProfile>(`${this.apiUrl}/email/${encodeURIComponent(email)}`).pipe(
          map((response: any) => {
            // Backend may return the user DTO directly or wrapped; normalize
            if (response && response.data) {
              return response.data as UserProfile;
            }
            return response as UserProfile;
          }),
          catchError(this.handleError),
        );
      }
    } catch (e) {
      // ignore JSON parse errors and fall through to error
    }

    return throwError(() => new Error('Utilisateur non authentifié'));
  }

  /**
   * Met à jour le profil utilisateur
   */
  updateUserProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    // Nettoyer les données avant envoi
    const cleanProfile = {
      firstName: profile.firstName?.trim(),
      lastName: profile.lastName?.trim(),
      email: profile.email?.trim(),
      phoneNumber: profile.phoneNumber?.trim() || '',
      streetAddress: profile.streetAddress?.trim() || '',
      city: profile.city?.trim() || '',
      zipCode: profile.zipCode?.trim() || '',
    };

    return this.http
      .put<ApiResponse<UserProfile>>(`${this.apiUrl}/profile`, cleanProfile, this.getHttpOptions())
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            // Mettre à jour le localStorage avec les nouvelles données
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const updatedUser = { ...currentUser, ...response.data };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

            return response.data;
          }
          throw new Error(response.message || 'Erreur lors de la mise à jour du profil');
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Change le mot de passe de l'utilisateur
   */
  changePassword(passwordData: PasswordChangeRequest): Observable<any> {
    return this.http
      .put<ApiResponse<any>>(`${this.apiUrl}/change-password`, passwordData, this.getHttpOptions())
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data || { message: 'Mot de passe modifié avec succès' };
          }
          throw new Error(response.message || 'Erreur lors du changement de mot de passe');
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Vérifie si l'email est disponible (pour la modification)
   */
  checkEmailAvailability(email: string, currentUserId?: string): Observable<boolean> {
    const params = currentUserId ? `?userId=${currentUserId}` : '';
    return this.http
      .get<ApiResponse<{ available: boolean }>>(
        `${this.apiUrl}/check-email/${email}${params}`,
        this.getHttpOptions(),
      )
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data.available;
          }
          return false;
        }),
        catchError(() => {
          // En cas d'erreur, on assume que l'email n'est pas disponible
          return throwError("Erreur lors de la vérification de l'email");
        }),
      );
  }

  /**
   * Supprime le compte utilisateur
   */
  deleteAccount(): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/account`, this.getHttpOptions()).pipe(
      map((response) => {
        if (response.success) {
          // Nettoyer le localStorage
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
          localStorage.removeItem('isLoggedIn');
          return response.data || { message: 'Compte supprimé avec succès' };
        }
        throw new Error(response.message || 'Erreur lors de la suppression du compte');
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Validation côté client pour le profil
   */
  validateProfile(profile: Partial<UserProfile>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!profile.firstName?.trim()) {
      errors.push('Le prénom est obligatoire');
    }

    if (!profile.lastName?.trim()) {
      errors.push('Le nom est obligatoire');
    }

    if (!profile.email?.trim()) {
      errors.push("L'email est obligatoire");
    } else if (!this.isValidEmail(profile.email)) {
      errors.push("L'email n'est pas valide");
    }

    if (profile.phoneNumber && !this.isValidPhoneNumber(profile.phoneNumber)) {
      errors.push("Le numéro de téléphone n'est pas valide");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validation côté client pour le changement de mot de passe
   */
  validatePasswordChange(passwordData: PasswordChangeRequest & { confirmPassword: string }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!passwordData.currentPassword) {
      errors.push('Le mot de passe actuel est obligatoire');
    }

    if (!passwordData.newPassword) {
      errors.push('Le nouveau mot de passe est obligatoire');
    } else {
      if (passwordData.newPassword.length < 8) {
        errors.push('Le nouveau mot de passe doit contenir au moins 8 caractères');
      }

      if (!/(?=.*[a-z])/.test(passwordData.newPassword)) {
        errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
      }

      if (!/(?=.*[A-Z])/.test(passwordData.newPassword)) {
        errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
      }

      if (!/(?=.*\d)/.test(passwordData.newPassword)) {
        errors.push('Le mot de passe doit contenir au moins un chiffre');
      }
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('Les mots de passe ne correspondent pas');
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.push("Le nouveau mot de passe doit être différent de l'ancien");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(?:\+33|0)[1-9](?:[.\-\s]?\d{2}){4}$/;
    return phoneRegex.test(phone.replace(/[\s\-\.]/g, ''));
  }

  private handleError(error: any): Observable<never> {
    console.error('UserService Error:', error);

    let errorMessage = "Une erreur inattendue s'est produite";

    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.error) {
        errorMessage = error.error.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Gestion des codes d'erreur HTTP spécifiques
    switch (error.status) {
      case 400:
        errorMessage = 'Données invalides: ' + errorMessage;
        break;
      case 401:
        errorMessage = 'Session expirée, veuillez vous reconnecter';
        // Rediriger vers la page de login
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('isLoggedIn');
        break;
      case 403:
        errorMessage = "Vous n'avez pas les permissions nécessaires";
        break;
      case 404:
        errorMessage = 'Utilisateur non trouvé';
        break;
      case 409:
        errorMessage = 'Cet email est déjà utilisé par un autre compte';
        break;
      case 500:
        errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
        break;
      case 0:
        errorMessage = 'Impossible de se connecter au serveur';
        break;
    }

    return throwError(errorMessage);
  }
}
