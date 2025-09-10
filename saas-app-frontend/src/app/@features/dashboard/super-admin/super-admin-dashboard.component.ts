import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  OrganizationService,
  OrganizationSettings,
} from '../../../@shared/services/organization.service';

@Component({
  selector: 'app-super-admin-dashboard',
  template: `
    <div class="super-admin-dashboard">
      <div class="dashboard-header">
        <h2>Super Administrator Dashboard</h2>
        <p>Global platform management and system configuration</p>
      </div>

      <div class="dashboard-grid">
        <!-- Quick Stats -->
        <div class="stats-card">
          <h3>System Overview</h3>
          <div class="stat-item">
            <span class="stat-number">{{ totalApplications }}</span>
            <span class="stat-label">Total Applications</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ activeUsers }}</span>
            <span class="stat-label">Active Users</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">€{{ monthlyRevenue }}</span>
            <span class="stat-label">Monthly Revenue</span>
          </div>
        </div>

        <!-- Gestion des Applications -->
        <div class="applications-card">
          <div class="card-header">
            <h3>Gestion des Applications</h3>
            <button class="btn btn-primary" (click)="manageApplications()">
              Nouvelle Application
            </button>
          </div>
          <div class="applications-list">
            <div class="app-item" *ngFor="let app of recentApplications">
              <div class="app-info">
                <h4>{{ app.name }}</h4>
                <span class="app-status" [class]="'status-' + app.status.toLowerCase()">
                  {{ app.status }}
                </span>
              </div>
              <div class="app-actions">
                <button class="btn btn-sm" title="Configure">Configurer</button>
                <button class="btn btn-sm" title="View Metrics">Statistiques</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestion des Abonnements -->
        <div class="subscriptions-card">
          <div class="card-header">
            <h3>Gestion des Abonnements</h3>
            <button class="btn btn-primary" (click)="generateMonthlyReport()">
              Rapport Mensuel
            </button>
          </div>
          <div class="subscription-stats">
            <div class="stat-item">
              <span class="stat-number">{{ subscriptionStats.active }}</span>
              <span class="stat-label">Abonnements Actifs</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">€{{ subscriptionStats.revenue }}</span>
              <span class="stat-label">Revenus Mensuels</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ subscriptionStats.pending }}</span>
              <span class="stat-label">En Attente</span>
            </div>
          </div>
        </div>

        <!-- Paramètres de l'Organisation -->
        <div class="settings-card">
          <div class="card-header">
            <h3>Paramètres de l'Organisation</h3>
          </div>
          <form (ngSubmit)="saveOrganizationSettings()" #orgForm="ngForm">
            <div class="form-group">
              <label for="companyName">Nom de l'entreprise</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                [(ngModel)]="organizationSettings.companyName"
                class="form-control"
                required />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="organizationSettings.email"
                class="form-control"
                required />
            </div>

            <div class="form-group">
              <label for="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                [(ngModel)]="organizationSettings.phone"
                class="form-control" />
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                name="description"
                [(ngModel)]="organizationSettings.description"
                class="form-control"
                rows="3"></textarea>
            </div>

            <div class="form-group">
              <label for="website">Site Web</label>
              <input
                type="url"
                id="website"
                name="website"
                [(ngModel)]="organizationSettings.website"
                class="form-control" />
            </div>

            <div class="form-group">
              <label for="industry">Secteur</label>
              <select
                id="industry"
                name="industry"
                [(ngModel)]="organizationSettings.industry"
                class="form-control">
                <option value="">Sélectionner un secteur</option>
                <option value="Technologie">Technologie</option>
                <option value="Finance">Finance</option>
                <option value="Santé">Santé</option>
                <option value="Éducation">Éducation</option>
                <option value="Commerce">Commerce</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div class="form-actions">
              <input
                type="file"
                #logoInput
                (change)="onLogoChange($event)"
                accept="image/*"
                style="display: none;" />
              <button type="button" class="btn btn-secondary" (click)="logoInput.click()">
                Changer le logo
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!orgForm.form.valid || saving">
                {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Paramètres généraux -->
        <div class="general-settings-card">
          <h3>Paramètres</h3>
          <div class="settings-options">
            <div class="setting-item" (click)="modifySettings()">
              <span>Modifier</span>
            </div>
            <div class="setting-item" (click)="configureSettings()">
              <span>Configurer</span>
            </div>
            <div class="setting-item" (click)="manageSettings()">
              <span>Gérer</span>
            </div>
          </div>
        </div>

        <!-- Gestion des Plans de Facturation -->
        <div class="billing-card">
          <h3>Plans de Facturation</h3>
          <div class="billing-plans">
            <div class="plan-item" *ngFor="let plan of billingPlans">
              <div class="plan-info">
                <h4>{{ plan.name }}</h4>
                <span class="plan-price">{{ plan.price }}€/mois</span>
              </div>
              <div class="plan-actions">
                <button class="btn btn-sm">Modifier</button>
                <button class="btn btn-sm btn-danger">Supprimer</button>
              </div>
            </div>
          </div>
          <button class="btn btn-primary" (click)="createNewPlan()">Créer Nouveau Plan</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .super-admin-dashboard {
        padding: 2rem;
        background-color: #f8f9fa;
        min-height: 100vh;
      }

      .dashboard-header {
        margin-bottom: 2rem;
      }

      .dashboard-header h2 {
        color: #333;
        margin-bottom: 0.5rem;
      }

      .dashboard-header p {
        color: #666;
        margin: 0;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
      }

      .stats-card,
      .applications-card,
      .subscriptions-card,
      .settings-card,
      .general-settings-card,
      .billing-card {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .card-header h3 {
        margin: 0;
        color: #333;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
      }

      .stat-number {
        font-size: 1.5rem;
        font-weight: bold;
        color: #007bff;
      }

      .stat-label {
        color: #666;
      }

      .app-item,
      .plan-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e9ecef;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }

      .app-status {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        text-transform: uppercase;
      }

      .status-active {
        background-color: #d4edda;
        color: #155724;
      }

      .status-inactive {
        background-color: #f8d7da;
        color: #721c24;
      }

      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        font-size: 0.875rem;
        transition: all 0.2s;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background-color: #0056b3;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background-color: #545b62;
      }

      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }

      .btn-danger {
        background-color: #dc3545;
        color: white;
      }

      .btn-danger:hover {
        background-color: #c82333;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
      }

      .form-control {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 0.875rem;
      }

      .form-control:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .setting-item {
        padding: 0.75rem 1rem;
        border: 1px solid #e9ecef;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .setting-item:hover {
        background-color: #f8f9fa;
      }

      .subscription-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
      }
    `,
  ],
})
export class SuperAdminDashboardComponent implements OnInit {
  totalApplications = 15;
  activeUsers = 247;
  monthlyRevenue = 8450;
  saving = false;

  recentApplications = [
    { name: 'E-Commerce Platform', status: 'Active' },
    { name: 'CRM System', status: 'Active' },
    { name: 'Analytics Dashboard', status: 'Inactive' },
  ];

  subscriptionStats = {
    active: 45,
    revenue: 2450,
    pending: 3,
  };

  billingPlans = [
    { name: 'Basic', price: 29 },
    { name: 'Professional', price: 79 },
    { name: 'Enterprise', price: 199 },
  ];

  organizationSettings: OrganizationSettings = {
    companyName: '',
    email: '',
    phone: '',
    description: '',
    website: '',
    industry: '',
    timezone: 'Europe/Paris',
    language: 'Français',
  };

  constructor(private router: Router, private organizationService: OrganizationService) {}

  ngOnInit(): void {
    this.loadOrganizationSettings();
  }

  loadOrganizationSettings(): void {
    this.organizationService.getOrganizationSettings().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.organizationSettings = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des paramètres:', error);
        // Charger des valeurs par défaut en cas d'erreur
        this.organizationSettings = {
          companyName: 'Mon Entreprise SaaS',
          email: 'contact@monentreprise.com',
          phone: '+33 1 23 45 67 89',
          description: "Plateforme SaaS innovante pour la gestion d'entreprise",
          website: 'https://monentreprise.com',
          industry: 'Technologie',
          timezone: 'Europe/Paris',
          language: 'Français',
        };
      },
    });
  }

  saveOrganizationSettings(): void {
    this.saving = true;

    this.organizationService.updateOrganizationSettings(this.organizationSettings).subscribe({
      next: (response: any) => {
        this.saving = false;
        if (response.success) {
          // Optionnel: afficher une notification de succès
        }
      },
      error: (error) => {
        this.saving = false;
        console.error('Erreur lors de la sauvegarde:', error);
        // Optionnel: afficher une notification d'erreur
      },
    });
  }

  onLogoChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.organizationService.uploadLogo(file).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.organizationSettings.logoUrl = response.data.logoUrl;
          } else {
            console.error('Erreur upload:', response.message || "Erreur lors de l'upload du logo");
          }
        },
        error: (error) => {
          console.error("Erreur lors de l'upload du logo:", error);
          let errorMessage = "Erreur lors de l'upload du logo";

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          console.error("Message d'erreur final:", errorMessage);
        },
      });
    }
  }

  manageApplications(): void {
    this.router.navigate(['/dashboard/applications']);
  }

  generateMonthlyReport(): void {
    // Logique pour générer le rapport mensuel
  }

  modifySettings(): void {
    this.router.navigate(['/dashboard/settings'], { queryParams: { section: 'general' } });
  }

  configureSettings(): void {
    this.router.navigate(['/dashboard/settings'], { queryParams: { section: 'configuration' } });
  }

  manageSettings(): void {
    this.router.navigate(['/dashboard/settings'], { queryParams: { section: 'management' } });
  }

  createNewPlan(): void {
    // Logique pour créer un nouveau plan
  }
}
