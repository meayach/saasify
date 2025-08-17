import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationService, Application } from '../../../../@shared/services/application.service';
import { NotificationService } from '../../../../@shared/services/notification.service';

@Component({
  selector: 'app-application-create',
  templateUrl: './application-create.component.html',
  styleUrls: ['./application-create.component.css'],
})
export class ApplicationCreateComponent implements OnInit {
  applicationForm = {
    name: '',
    status: 'active' as 'active' | 'maintenance' | 'inactive',
  };

  isSubmitting = false;

  constructor(
    public router: Router,
    private applicationService: ApplicationService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {}

  onSubmit(): void {
    if (!this.applicationForm.name.trim()) {
      this.notificationService.warning("Le nom de l'application est requis.", 'Champ requis');
      return;
    }

    this.isSubmitting = true;

    this.applicationService.createApplication(this.applicationForm).subscribe({
      next: (application: Application) => {
        this.notificationService.success(
          `L'application "${application.name}" a été créée avec succès !`,
          'Application créée',
        );
        // Rediriger vers la liste des applications
        this.router.navigate(['/applications']);
      },
      error: (error: any) => {
        console.error('Erreur lors de la création:', error);
        this.notificationService.error(
          "Une erreur est survenue lors de la création de l'application.",
          'Erreur de création',
        );
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/applications']);
  }
}
