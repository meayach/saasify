import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationService, Application } from '../../../../@shared/services/application.service';
import { ApplicationConfigurationService } from '../../../../@shared/services/application-configuration.service';
import {
  PaymentMethods,
  DEFAULT_PAYMENT_METHODS,
} from '../../../../@shared/constants/payment-methods';
import { NotificationService } from '../../../../@shared/services/notification.service';
import { ApplicationRefreshService } from '../../../../@shared/services/application-refresh.service';

export interface NewApplicationConfiguration {
  applicationName: string;
  domainName: string;
  logo?: File;
  isActive: boolean;
  paymentMethods: PaymentMethods;
}

@Component({
  selector: 'app-application-new',
  templateUrl: './application-new.component.html',
  styleUrls: ['./application-new.component.css'],
})
export class ApplicationNewComponent implements OnInit {
  isLoading = false;
  isSubmitting = false;

  configurationForm: NewApplicationConfiguration = {
    applicationName: '',
    domainName: '',
    isActive: true,
    paymentMethods: { ...DEFAULT_PAYMENT_METHODS },
  };

  customFieldTypes = [
    { value: 'string', label: 'Type String' },
    { value: 'number', label: 'Type Number' },
    { value: 'boolean', label: 'Type Boolean' },
    { value: 'date', label: 'Type Date' },
  ];

  selectedLogo: File | null = null;
  logoPreview: string | null = null;

  constructor(
    public router: Router,
    private applicationService: ApplicationService,
    private configurationService: ApplicationConfigurationService,
    private notificationService: NotificationService,
    private applicationRefreshService: ApplicationRefreshService,
  ) {}

  ngOnInit(): void {
    // Notification d'accueil pour la nouvelle application
    setTimeout(() => {
      this.notificationService.info(
        'Créez une nouvelle application SaaS en quelques étapes simples.',
        'Nouvelle Application',
      );
    }, 500);
  }

  // Générer automatiquement le domaine basé sur le nom de l'application
  onApplicationNameChange(): void {
    if (this.configurationForm.applicationName.trim()) {
      this.configurationForm.domainName =
        this.configurationForm.applicationName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') + '.saasify.com';
    }
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogo = file;

      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    // Notification de début de création
    this.notificationService.info('Création de la nouvelle application en cours...', 'Création');

    // Étape 1: Créer l'application
    const newApplication: Partial<Application> = {
      name: this.configurationForm.applicationName,
      status: this.configurationForm.isActive ? ('active' as const) : ('inactive' as const),
    };

    this.applicationService.createApplication(newApplication).subscribe({
      next: (createdApp: Application) => {
        // Étape 2: Créer la configuration pour cette application
        if (!createdApp._id) {
          this.notificationService.error("Erreur: ID de l'application manquant");
          this.isSubmitting = false;
          return;
        }

        const configRequest = {
          applicationId: createdApp._id,
          applicationName: this.configurationForm.applicationName,
          domainName: this.configurationForm.domainName,
          isActive: this.configurationForm.isActive,
          paymentMethods: this.configurationForm.paymentMethods,
          logo: this.selectedLogo || undefined,
        };

        this.configurationService.saveConfiguration(configRequest).subscribe({
          next: (savedConfig) => {
            this.notificationService.success(
              `Nouvelle application "${this.configurationForm.applicationName}" créée avec succès !`,
              'Application créée',
            );

            this.isSubmitting = false;

            // Déclencher le rafraîchissement de la liste des applications
            this.applicationRefreshService.triggerRefresh();

            // Rediriger vers la liste des applications
            this.router.navigate(['/applications']);
          },
          error: (configError) => {
            console.error('Erreur lors de la création de la configuration:', configError);
            this.notificationService.error(
              'Application créée mais erreur lors de la configuration. Vous pouvez la configurer plus tard.',
              'Erreur partielle',
            );
            this.isSubmitting = false;

            // Marquer qu'un rafraîchissement est nécessaire
            localStorage.setItem('shouldRefreshApplications', 'true');

            // Déclencher le rafraîchissement de la liste des applications
            this.applicationRefreshService.triggerRefresh();

            this.router.navigate(['/applications']);
          },
        });
      },
      error: (error) => {
        console.error("Erreur lors de la création de l'application:", error);
        this.notificationService.error(
          "Erreur lors de la création de l'application. Veuillez réessayer.",
          'Erreur de création',
        );
        this.isSubmitting = false;
      },
    });
  }

  validateForm(): boolean {
    if (!this.configurationForm.applicationName.trim()) {
      this.notificationService.warning("Le nom de l'application est requis.", 'Champ requis');
      return false;
    }

    if (this.configurationForm.applicationName.length < 3) {
      this.notificationService.warning(
        "Le nom de l'application doit contenir au moins 3 caractères.",
        'Nom trop court',
      );
      return false;
    }

    if (!this.configurationForm.domainName.trim()) {
      this.notificationService.warning('Le nom de domaine est requis.', 'Champ requis');
      return false;
    }

    const hasPaymentMethod = Object.values(this.configurationForm.paymentMethods).some(
      (method) => method,
    );
    if (!hasPaymentMethod) {
      this.notificationService.warning(
        'Au moins une méthode de paiement doit être sélectionnée.',
        'Méthode de paiement requise',
      );
      return false;
    }

    return true;
  }

  onCancel(): void {
    this.router.navigate(['/applications']);
  }

  testNotifications(): void {
    this.notificationService.success(
      'Aperçu de notification de succès ! Votre application sera créée avec succès.',
      '✅ Aperçu Succès',
    );

    setTimeout(() => {
      this.notificationService.info(
        'Votre nouvelle application sera accessible via: ' + this.configurationForm.domainName,
        '🌐 Domaine généré',
      );
    }, 1000);
  }
}
