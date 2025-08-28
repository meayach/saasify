import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService, Application } from '../../../../@shared/services/application.service';
import {
  ApplicationConfigurationService,
  ApplicationConfigurationResponse,
} from '../../../../@shared/services/application-configuration.service';
import {
  PaymentMethods,
  DEFAULT_PAYMENT_METHODS,
} from '../../../../@shared/constants/payment-methods';
import { NotificationService } from '../../../../@shared/services/notification.service';
import { ApplicationRefreshService } from '../../../../@shared/services/application-refresh.service';

export interface ApplicationConfiguration {
  applicationName: string;
  domainName: string;
  logo?: File;
  isActive: boolean;
  paymentMethods: PaymentMethods;
}

@Component({
  selector: 'app-application-configure',
  templateUrl: './application-configure.component.html',
  styleUrls: ['./application-configure.component.css'],
})
export class ApplicationConfigureComponent implements OnInit {
  applicationId: string | null = null;
  isLoading = true;
  isSubmitting = false;

  currentApplication: Application | null = null;
  existingConfiguration: ApplicationConfigurationResponse | null = null;

  configurationForm: ApplicationConfiguration = {
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
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private configurationService: ApplicationConfigurationService,
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

    // Écouter les changements d'applications pour synchroniser le toggle
    this.applicationRefreshService.refreshNeeded$.subscribe(() => {
      console.log("🔄 Changement d'application détecté, rechargement...");
      if (this.applicationId) {
        this.loadApplicationData();
      }
    });

    // Test de notification au chargement
    setTimeout(() => {
      this.notificationService.info(
        'Le formulaire de configuration est prêt à être utilisé.',
        'Configuration prête',
      );
    }, 1000);
  }

  loadApplication(): void {
    if (!this.applicationId) return;

    this.applicationService.getApplications().subscribe({
      next: (applications) => {
        const app = applications.find((a) => a._id === this.applicationId);
        if (app) {
          this.currentApplication = app;
          this.configurationForm.applicationName = app.name;
          this.configurationForm.domainName =
            app.name.toLowerCase().replace(/\s+/g, '-') + '.saasify.com';

          // Utiliser isActive si disponible, sinon déduire du status
          this.configurationForm.isActive =
            app.isActive !== undefined ? app.isActive : app.status === 'active';

          console.log(
            '📋 Application chargée:',
            app.name,
            'Status:',
            app.status,
            'isActive:',
            this.configurationForm.isActive,
          );

          // Charger la configuration existante
          this.loadExistingConfiguration();
        } else {
          this.notificationService.error('Application non trouvée');
          this.router.navigate(['/applications']);
        }
      },
      error: (error) => {
        console.error("Erreur lors du chargement de l'application:", error);
        this.notificationService.error("Erreur lors du chargement de l'application");
        this.isLoading = false;
        this.router.navigate(['/applications']);
      },
    });
  }

  loadExistingConfiguration(): void {
    if (!this.applicationId) return;

    this.configurationService.getConfiguration(this.applicationId).subscribe({
      next: (config) => {
        this.existingConfiguration = config;
        // Pré-remplir le formulaire avec la configuration existante
        this.configurationForm.applicationName = config.applicationName;
        this.configurationForm.domainName = config.domainName;
        // NE PAS écraser isActive - garder la valeur de l'application comme source de vérité
        // this.configurationForm.isActive = config.isActive;
        this.configurationForm.paymentMethods = { ...config.paymentMethods };
        this.isLoading = false;
      },
      error: (error) => {
        // Si aucune configuration n'existe, ce n'est pas une erreur
        console.info(
          "Aucune configuration existante trouvée, création d'une nouvelle configuration",
        );
        this.isLoading = false;
      },
    });
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

    if (!this.applicationId) {
      this.notificationService.error("ID de l'application manquant");
      return;
    }

    this.isSubmitting = true;

    // Notification de début de sauvegarde
    this.notificationService.info('Sauvegarde de la configuration en cours...', 'Sauvegarde');

    const configRequest = {
      applicationId: this.applicationId,
      applicationName: this.configurationForm.applicationName,
      domainName: this.configurationForm.domainName,
      isActive: this.configurationForm.isActive,
      paymentMethods: this.configurationForm.paymentMethods,
      logo: this.selectedLogo || undefined,
    };

    // Utiliser mise à jour si configuration existante, sinon créer
    const saveOperation = this.existingConfiguration
      ? this.configurationService.updateConfiguration(this.existingConfiguration._id, configRequest)
      : this.configurationService.saveConfiguration(configRequest);

    saveOperation.subscribe({
      next: (savedConfig) => {
        this.notificationService.success(
          `Configuration de l'application "${this.configurationForm.applicationName}" sauvegardée avec succès !`,
          'Configuration sauvegardée',
        );

        // Mettre à jour le nom et le statut de l'application si nécessaire
        if (this.currentApplication) {
          const needsNameUpdate =
            this.currentApplication.name !== this.configurationForm.applicationName;
          const needsStatusUpdate =
            this.currentApplication.status !==
            (this.configurationForm.isActive ? 'active' : 'inactive');

          if (needsNameUpdate || needsStatusUpdate) {
            // Créer l'objet de mise à jour avec le nom et le statut
            const updateData: any = {};

            if (needsNameUpdate) {
              updateData.name = this.configurationForm.applicationName;
            }

            if (needsStatusUpdate) {
              updateData.status = this.configurationForm.isActive ? 'active' : 'inactive';
              updateData.isActive = this.configurationForm.isActive;
            }

            this.applicationService.updateApplication(this.applicationId!, updateData).subscribe({
              next: () => {
                console.log('Application mise à jour avec succès:', updateData);
              },
              error: (error) => {
                console.error("Erreur lors de la mise à jour de l'application:", error);
              },
            });
          }
        }

        this.isSubmitting = false;

        // Marquer qu'un rafraîchissement est nécessaire
        localStorage.setItem('shouldRefreshApplications', 'true');

        // If backend returned a logoUrl or logoPath, persist it so the list can show it immediately for this app
        const logoValue = (savedConfig as any)?.logoUrl || (savedConfig as any)?.logoPath;
        if (logoValue && this.applicationId) {
          try {
            // Ensure we store a fully-qualified URL. The backend returns a relative path like "uploads/...".
            const fullLogoUrl = logoValue.startsWith('http')
              ? logoValue
              : `${window.location.protocol}//${window.location.hostname}:3001/${logoValue}`;
            console.debug('Persisting app logo to localStorage', this.applicationId, fullLogoUrl);
            localStorage.setItem(`appLogo:${this.applicationId}`, fullLogoUrl);
            // also tell the list which app was just configured
            localStorage.setItem('lastConfiguredAppId', this.applicationId);
            if (this.currentApplication) {
              this.currentApplication.logoUrl = fullLogoUrl;
            }
          } catch (e) {
            console.warn('Unable to persist app logo to localStorage', e);
          }
        }

        // Déclencher le rafraîchissement de la liste des applications
        this.applicationRefreshService.triggerRefresh();

        // Rediriger vers la liste des applications
        this.router.navigate(['/applications']);
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde de la configuration:', error);
        this.notificationService.error(
          'Erreur lors de la sauvegarde de la configuration. Veuillez réessayer.',
          'Erreur de sauvegarde',
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

  loadApplicationData(): void {
    if (!this.applicationId) return;

    this.applicationService.getApplications().subscribe({
      next: (applications) => {
        const app = applications.find((a) => a._id === this.applicationId);
        if (app) {
          this.currentApplication = app;
          // Mettre à jour seulement le statut actif, garder le reste de la configuration
          const newIsActive = app.isActive !== undefined ? app.isActive : app.status === 'active';

          console.log(
            '🔄 Rechargement données app:',
            app.name,
            'Status:',
            app.status,
            'isActive:',
            newIsActive,
          );

          // Mettre à jour seulement si c'est différent pour éviter les boucles
          if (this.configurationForm.isActive !== newIsActive) {
            this.configurationForm.isActive = newIsActive;
            console.log('✅ Toggle synchronisé:', newIsActive);
          }
        }
      },
      error: (error) => {
        console.error("Erreur lors du rechargement des données d'application:", error);
      },
    });
  }

  onToggleChange(event: any): void {
    const isActive = event.target.checked;
    console.log('🔄 Toggle configuration changé:', isActive);

    if (this.applicationId && this.currentApplication) {
      // Mettre à jour immédiatement l'état de l'application pour synchroniser avec les cartes
      this.applicationService.updateApplicationStatus(this.applicationId, isActive).subscribe({
        next: () => {
          console.log("✅ Statut de l'application mis à jour immédiatement");
          // Mettre à jour l'objet application local
          this.currentApplication!.status = isActive ? 'active' : 'inactive';
          this.currentApplication!.isActive = isActive;

          // Déclencher le rafraîchissement de la liste
          this.applicationRefreshService.triggerRefresh();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la mise à jour immédiate du statut:', error);
          // En cas d'erreur, remettre l'ancien état
          this.configurationForm.isActive = !isActive;
        },
      });
    }
  }
}
