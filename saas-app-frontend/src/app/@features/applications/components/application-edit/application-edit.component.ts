import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService, Application } from '../../../../@shared/services/application.service';
import { NotificationService } from '../../../../@shared/services/notification.service';
import { ApplicationRefreshService } from '../../../../@shared/services/application-refresh.service';

@Component({
  selector: 'app-application-edit',
  templateUrl: './application-edit.component.html',
  styleUrls: ['./application-edit.component.css'],
})
export class ApplicationEditComponent implements OnInit {
  applicationForm = {
    name: '',
    status: 'active' as 'active' | 'maintenance' | 'inactive',
  };

  isSubmitting = false;
  isLoading = true;
  applicationId: string | null = null;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private notificationService: NotificationService,
    private applicationRefreshService: ApplicationRefreshService,
  ) {}

  ngOnInit(): void {
    this.applicationId = this.route.snapshot.paramMap.get('id');
    if (this.applicationId) {
      this.loadApplication();
    } else {
      this.router.navigate(['/applications']);
    }
  }

  loadApplication(): void {
    if (!this.applicationId) return;

    this.applicationService.getApplications().subscribe({
      next: (applications) => {
        const app = applications.find((a) => a._id === this.applicationId);
        if (app) {
          this.applicationForm = {
            name: app.name,
            status: app.status,
          };
        } else {
          this.notificationService.error('Application non trouvée');
          this.router.navigate(['/applications']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur lors du chargement de l'application:", error);
        this.notificationService.error("Erreur lors du chargement de l'application");
        this.isLoading = false;
        this.router.navigate(['/applications']);
      },
    });
  }

  onSubmit(): void {
    if (!this.applicationForm.name.trim()) {
      this.notificationService.warning("Le nom de l'application est requis.", 'Champ requis');
      return;
    }

    if (!this.applicationId) {
      this.notificationService.error("ID d'application manquant");
      return;
    }

    this.isSubmitting = true;

    this.applicationService.updateApplication(this.applicationId, this.applicationForm).subscribe({
      next: (application: Application) => {
        this.notificationService.success(
          `L'application "${application.name}" a été modifiée avec succès !`,
          'Application modifiée',
        );
        // Marquer qu'un rafraîchissement est nécessaire pour la liste
        localStorage.setItem('shouldRefreshApplications', 'true');
        this.applicationRefreshService.triggerRefresh();
        // Rediriger vers la liste des applications
        this.router.navigate(['/applications']);
      },
      error: (error: any) => {
        console.error('Erreur lors de la modification:', error);
        this.notificationService.error(
          "Une erreur est survenue lors de la modification de l'application.",
          'Erreur de modification',
        );
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/applications']);
  }
}
