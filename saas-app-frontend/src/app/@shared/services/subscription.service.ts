import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface SubscriptionStats {
  activeSubscriptions: number;
  monthlyRevenue: number;
  pendingSubscriptions: number;
  newClients: number;
  totalSubscriptions: number;
  cancelledSubscriptions: number;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  amount: number;
  currency: string;
  customerName?: string;
  planName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private apiUrl = 'http://localhost:3001/api/v1';

  constructor(private http: HttpClient) {}

  // Obtenir les statistiques des abonnements
  getSubscriptionStats(): Observable<SubscriptionStats> {
    // Appel réel à l'API pour récupérer les statistiques d'abonnements
    return this.http
      .get<{ success: boolean; data: SubscriptionStats }>(
        `${this.apiUrl}/dashboard-subscriptions/stats`,
      )
      .pipe(
        map((resp: { success: boolean; data: SubscriptionStats }) => resp.data),
        catchError((error) => {
          console.error("Erreur lors de la récupération des statistiques d'abonnements:", error);
          // Retourner des données par défaut en cas d'erreur
          return of({
            activeSubscriptions: 0,
            monthlyRevenue: 0,
            pendingSubscriptions: 0,
            newClients: 0,
            totalSubscriptions: 0,
            cancelledSubscriptions: 0,
          });
        }),
      );
  }

  // Obtenir tous les abonnements
  getSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/dashboard-subscriptions`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des abonnements:', error);
        return of([]);
      }),
    );
  }

  // Obtenir les abonnements par statut
  getSubscriptionsByStatus(status: string): Observable<Subscription[]> {
    return this.http
      .get<Subscription[]>(`${this.apiUrl}/dashboard-subscriptions?status=${status}`)
      .pipe(
        catchError((error) => {
          console.error(`Erreur lors de la récupération des abonnements ${status}:`, error);
          return of([]);
        }),
      );
  }

  // Créer un nouvel abonnement
  createSubscription(subscription: Partial<Subscription>): Observable<Subscription> {
    return this.http
      .post<Subscription>(`${this.apiUrl}/dashboard-subscriptions`, subscription)
      .pipe(
        catchError((error) => {
          console.error("Erreur lors de la création de l'abonnement:", error);
          throw error;
        }),
      );
  }

  // Mettre à jour un abonnement
  updateSubscription(id: string, subscription: Partial<Subscription>): Observable<Subscription> {
    return this.http
      .put<Subscription>(`${this.apiUrl}/dashboard-subscriptions/${id}`, subscription)
      .pipe(
        catchError((error) => {
          console.error("Erreur lors de la mise à jour de l'abonnement:", error);
          throw error;
        }),
      );
  }

  // Supprimer un abonnement
  deleteSubscription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/dashboard-subscriptions/${id}`).pipe(
      catchError((error) => {
        console.error("Erreur lors de la suppression de l'abonnement:", error);
        throw error;
      }),
    );
  }
}
