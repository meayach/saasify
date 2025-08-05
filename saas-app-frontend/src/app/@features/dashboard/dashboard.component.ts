import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../@store/app.reducer';
import { AuthUser, UserRole } from '../../@core/models/user.model';
import * as AuthActions from '../../@store/auth/auth.actions';

@Component({
  selector: 'app-main-dashboard',
  template: `
    <div class="dashboard-container">
      <app-header [user]="user$ | async"></app-header>

      <div class="dashboard-content">
        <div class="welcome-section" *ngIf="user$ | async as user">
          <h1>Welcome back, {{ user.firstName }}!</h1>
          <p class="role-badge">{{ user.role | titlecase }}</p>
        </div>

        <!-- Customer Admin Dashboard -->
        <div *ngIf="isCustomerAdmin$ | async" class="admin-dashboard">
          <app-customer-admin-dashboard></app-customer-admin-dashboard>
        </div>

        <!-- Customer Manager Dashboard -->
        <div *ngIf="isCustomerManager$ | async" class="manager-dashboard">
          <app-customer-manager-dashboard></app-customer-manager-dashboard>
        </div>

        <!-- Customer Developer Dashboard -->
        <div *ngIf="isCustomerDeveloper$ | async" class="developer-dashboard">
          <app-customer-developer-dashboard></app-customer-developer-dashboard>
        </div>

        <!-- Super Admin Dashboard -->
        <div *ngIf="isSuperAdmin$ | async" class="super-admin-dashboard">
          <app-super-admin-dashboard></app-super-admin-dashboard>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
        background-color: #f8f9fa;
      }

      .dashboard-content {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .welcome-section {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
      }

      .welcome-section h1 {
        margin: 0 0 0.5rem 0;
        color: #333;
      }

      .role-badge {
        background: #007bff;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.875rem;
        display: inline-block;
      }

      .admin-dashboard,
      .manager-dashboard,
      .developer-dashboard,
      .super-admin-dashboard {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  user$: Observable<AuthUser | null>;
  isCustomerAdmin$: Observable<boolean>;
  isCustomerManager$: Observable<boolean>;
  isCustomerDeveloper$: Observable<boolean>;
  isSuperAdmin$: Observable<boolean>;

  constructor(private store: Store<AppState>, private router: Router) {
    this.user$ = this.store.select((state) => state.auth.user);

    this.isCustomerAdmin$ = this.store.select(
      (state) => state.auth.user?.role === UserRole.CUSTOMER_ADMIN,
    );

    this.isCustomerManager$ = this.store.select(
      (state) => state.auth.user?.role === UserRole.CUSTOMER_MANAGER,
    );

    this.isCustomerDeveloper$ = this.store.select(
      (state) => state.auth.user?.role === UserRole.CUSTOMER_DEVELOPER,
    );

    this.isSuperAdmin$ = this.store.select(
      (state) => state.auth.user?.role === UserRole.SUPER_ADMIN,
    );
  }

  ngOnInit(): void {
    // Load user profile if not already loaded
    this.store.dispatch(AuthActions.loadUserProfile());
  }
}
