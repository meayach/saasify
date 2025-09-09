import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  selectedPlan: any = null; // Plan présélectionné

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private configurationService: ApplicationConfigurationService,
    private notificationService: NotificationService,
    private applicationRefreshService: ApplicationRefreshService,
  ) {}

  ngOnInit(): void {
    // Vérifier si nous venons de la sélection de plan
    this.route.queryParams.subscribe((params) => {
      if (params['planId'] && params['planName']) {
        this.selectedPlan = {
          id: params['planId'],
          name: params['planName'],
        };

        // Aussi récupérer depuis localStorage si disponible
        const storedPlan = localStorage.getItem('selectedPlan');
        if (storedPlan) {
          this.selectedPlan = { ...this.selectedPlan, ...JSON.parse(storedPlan) };
        }

        this.notificationService.info(
          `Plan ${this.selectedPlan.name} sélectionné. Finalisez maintenant la création de votre application.`,
          "Création d'application",
        );
      }
    });

    // Notification d'accueil pour la nouvelle application
    setTimeout(() => {
      if (!this.selectedPlan) {
        this.notificationService.info(
          'Créez une nouvelle application SaaS en quelques étapes simples.',
          'Nouvelle Application',
        );
      }
    }, 1000);
  }

  // Méthode pour changer de plan
  changePlan(): void {
    this.router.navigate(['/subscriptions/plans'], {
      queryParams: { returnTo: 'create-application' },
    });
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

    // Inclure les informations du plan dans la création
    const planInfo = this.selectedPlan
      ? {
          selectedPlanId: this.selectedPlan.id,
          selectedPlanName: this.selectedPlan.name,
        }
      : {};

    // Étape 1: Créer l'application
    const newApplication: Partial<Application> = {
      name: this.configurationForm.applicationName,
      status: this.configurationForm.isActive ? ('active' as const) : ('inactive' as const),
      ...planInfo, // Inclure les informations du plan
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
            const successMessage = this.selectedPlan
              ? `Nouvelle application "${this.configurationForm.applicationName}" créée avec succès avec le plan ${this.selectedPlan.name} !`
              : `Nouvelle application "${this.configurationForm.applicationName}" créée avec succès !`;

            this.notificationService.success(successMessage, 'Application créée');

            this.isSubmitting = false;

            // Nettoyer le plan sélectionné après création réussie
            if (this.selectedPlan) {
              localStorage.removeItem('selectedPlan');
            }

            // If backend returned a logoPath/logoUrl, persist it so the list can show it immediately
            try {
              const logoValue = (savedConfig as any)?.logoUrl || (savedConfig as any)?.logoPath;
              if (logoValue && createdApp._id) {
                const fullLogoUrl = logoValue.startsWith('http')
                  ? logoValue
                  : `${window.location.protocol}//${window.location.hostname}:3001/${logoValue}`;
                localStorage.setItem(`appLogo:${createdApp._id}`, fullLogoUrl);
                localStorage.setItem('lastConfiguredAppId', createdApp._id);
              }
            } catch (e) {
              console.warn('Unable to persist app logo to localStorage', e);
            }

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
