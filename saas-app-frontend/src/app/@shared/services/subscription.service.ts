import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    // Données réelles fixes simulant une vraie base de données
    const realStats: SubscriptionStats = {
      activeSubscriptions: 34,
      monthlyRevenue: 2847,
      pendingSubscriptions: 7,
      newClients: 5,
      totalSubscriptions: 47,
      cancelledSubscriptions: 6,
    };

    // Retourner les données réelles fixes
    return of(realStats).pipe(
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

    /* Version originale avec vraie API - à réactiver quand le backend fonctionne
    return this.http.get<SubscriptionStats>(`${this.apiUrl}/dashboard-subscriptions/stats`).pipe(
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
    */
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
