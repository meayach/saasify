import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../../@store/app.reducer';
import { SaasApplication } from '../../../@core/models/application.model';

@Component({
  selector: 'app-customer-admin-dashboard',
  template: `
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h2>Administrator Dashboard</h2>
        <p>Manage your team, configuration, and monitor performance</p>
      </div>

      <div class="dashboard-grid">
        <!-- Quick Stats -->
        <div class="stats-card">
          <h3>Team Overview</h3>
          <div class="stat-item">
            <span class="stat-number">12</span>
            <span class="stat-label">Active Users</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">3</span>
            <span class="stat-label">Applications</span>
          </div>
        </div>

        <!-- Applications Management -->
        <div class="applications-card">
          <div class="card-header">
            <h3>Applications</h3>
            <button class="btn btn-primary" (click)="createApplication()">
              <i class="pi pi-plus"></i> New App
            </button>
          </div>
          <div class="applications-list">
            <div class="app-item" *ngFor="let app of applications$ | async">
              <div class="app-info">
                <h4>{{ app.name }}</h4>
                <span class="app-status" [class]="'status-' + app.status.toLowerCase()">
                  {{ app.status }}
                </span>
              </div>
              <div class="app-actions">
                <button class="btn btn-sm" (click)="configureApp(app.id)">
                  <i class="pi pi-cog"></i>
                </button>
                <button class="btn btn-sm" (click)="viewMetrics(app.id)">
                  <i class="pi pi-chart-line"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Management -->
        <div class="team-card">
          <div class="card-header">
            <h3>Team Management</h3>
            <button class="btn btn-secondary" (click)="inviteUser()">
              <i class="pi pi-user-plus"></i> Invite
            </button>
          </div>
          <div class="team-list">
            <div class="team-member">
              <div class="member-info">
                <div class="member-avatar"></div>
                <div>
                  <h4>John Doe</h4>
                  <span>Manager</span>
                </div>
              </div>
              <span class="member-status active">Active</span>
            </div>
            <div class="team-member">
              <div class="member-info">
                <div class="member-avatar"></div>
                <div>
                  <h4>Jane Smith</h4>
                  <span>Developer</span>
                </div>
              </div>
              <span class="member-status active">Active</span>
            </div>
          </div>
        </div>

        <!-- Configuration Panel -->
        <div class="config-card">
          <h3>Configuration</h3>
          <div class="config-options">
            <div class="config-item" (click)="openPaymentSettings()">
              <i class="pi pi-credit-card"></i>
              <span>Payment Methods</span>
              <i class="pi pi-chevron-right"></i>
            </div>
            <div class="config-item" (click)="openSecuritySettings()">
              <i class="pi pi-shield"></i>
              <span>Security Settings</span>
              <i class="pi pi-chevron-right"></i>
            </div>
            <div class="config-item" (click)="openIntegrations()">
              <i class="pi pi-link"></i>
              <span>Integrations</span>
              <i class="pi pi-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-dashboard {
        padding: 1.5rem;
      }

      .dashboard-header {
        margin-bottom: 2rem;
      }

      .dashboard-header h2 {
        margin: 0 0 0.5rem 0;
        color: #333;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .stats-card,
      .applications-card,
      .team-card,
      .config-card {
        background: white;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        padding: 1.5rem;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .card-header h3 {
        margin: 0;
      }

      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: #007bff;
      }

      .app-item,
      .team-member {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e1e5e9;
        border-radius: 6px;
        margin-bottom: 0.5rem;
      }

      .app-status {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .status-active {
        background: #d4edda;
        color: #155724;
      }
      .status-development {
        background: #fff3cd;
        color: #856404;
      }
      .status-production {
        background: #d1ecf1;
        color: #0c5460;
      }

      .member-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #007bff;
        margin-right: 1rem;
      }

      .member-info {
        display: flex;
        align-items: center;
      }

      .member-status.active {
        color: #28a745;
        font-weight: 500;
      }

      .config-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e1e5e9;
        border-radius: 6px;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .config-item:hover {
        background: #f8f9fa;
      }

      .config-item i:first-child {
        margin-right: 1rem;
        color: #007bff;
      }

      .config-item span {
        flex: 1;
      }
    `,
  ],
})
export class CustomerAdminDashboardComponent implements OnInit {
  applications$: Observable<SaasApplication[]>;

  constructor(private store: Store<AppState>) {
    this.applications$ = this.store.select((state) => state.application.applications);
  }

  ngOnInit(): void {
    // Load applications and team data
  }

  createApplication(): void {
    // Navigate to application creation
  }

  configureApp(appId: string): void {
    // Navigate to app configuration
  }

  viewMetrics(appId: string): void {
    // Navigate to app metrics
  }

  inviteUser(): void {
    // Open invite user dialog
  }

  openPaymentSettings(): void {
    // Navigate to payment settings
  }

  openSecuritySettings(): void {
    // Navigate to security settings
  }

  openIntegrations(): void {
    // Navigate to integrations
  }
}
