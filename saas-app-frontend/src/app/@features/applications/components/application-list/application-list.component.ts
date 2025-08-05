import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApplicationService,
  Application,
  ApplicationStats,
} from '../../../../@shared/services/application.service';
import { NotificationService } from '../../../../@shared/services/notification.service';
import { ConfirmationModalService } from '../../../../@shared/services/confirmation-modal.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css'],
})
export class ApplicationListComponent implements OnInit {
  applications: Application[] = [];
  applicationStats: ApplicationStats = {
    totalApplications: 0,
    activeApplications: 0,
    deploymentsToday: 0,
    maintenanceApplications: 0,
  };
  loading = true;

  constructor(
    public router: Router,
    private applicationService: ApplicationService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService,
  ) {}

  ngOnInit(): void {
    this.loadApplications();
    this.loadApplicationStats();
  }

  loadApplications(): void {
    this.loading = true;
    this.applicationService.getApplications().subscribe({
      next: (applications) => {
        this.applications = applications;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des applications:', error);
        this.notificationService.error('Erreur lors du chargement des applications');
        this.loading = false;
        // Données de fallback pour la démonstration
        this.applications = [
          {
            _id: '1',
            name: 'SaaS App 1',
            description: 'Application de gestion commerciale',
            status: 'active',
            createdAt: new Date('2024-01-15'),
          },
          {
            _id: '2',
            name: 'SaaS App 2',
            description: 'Application de facturation',
            status: 'active',
            createdAt: new Date('2024-02-10'),
          },
          {
            _id: '3',
            name: 'SaaS App 3',
            description: 'Application de gestion de stock',
            status: 'maintenance',
            createdAt: new Date('2024-03-05'),
          },
        ];
      },
    });
  }

  loadApplicationStats(): void {
    this.applicationService.getApplicationStats().subscribe({
      next: (stats) => {
        this.applicationStats = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        // Données de fallback
        this.applicationStats = {
          totalApplications: 3,
          activeApplications: 2,
          deploymentsToday: 1,
          maintenanceApplications: 1,
        };
      },
    });
  }

  createNewApplication(): void {
    this.router.navigate(['/applications/new']);
  }

  editApplication(id: string): void {
    this.router.navigate(['/applications/edit', id]);
  }

  deleteApplication(id: string): void {
    const app = this.applications.find((a) => a._id === id);
    const appName = app ? app.name : 'cette application';

    this.confirmationModalService
      .confirm({
        title: "Supprimer l'application",
        message: `Êtes-vous sûr de vouloir supprimer "${appName}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.applicationService.deleteApplication(id).subscribe({
            next: () => {
              this.notificationService.success(
                `L'application "${appName}" a été supprimée avec succès`,
              );
              this.loadApplications();
            },
            error: (error) => {
              console.error('Erreur lors de la suppression:', error);
              this.notificationService.error("Erreur lors de la suppression de l'application");
            },
          });
        }
      });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'maintenance':
        return '#f59e0b';
      case 'inactive':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'maintenance':
        return 'Maintenance';
      case 'inactive':
        return 'Inactif';
      default:
        return 'Inconnu';
    }
  }
}
