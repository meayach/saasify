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
import { LoggerService } from '../../../../@core/services/logger.service';

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
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.logger.log('🚀 ApplicationNew - ngOnInit');

    // Vérifier si nous venons de la sélection de plan
    this.route.queryParams.subscribe((params) => {
      this.logger.log('📊 ApplicationNew - queryParams:', params);

      if (params['planId'] && params['planName']) {
        this.logger.log(
          '🎯 ApplicationNew - Plan reçu des queryParams:',
          params['planId'],
          params['planName'],
        );
        this.selectedPlan = {
          id: params['planId'],
          name: params['planName'],
        };

        // Aussi récupérer depuis localStorage si disponible
        const storedPlan = localStorage.getItem('selectedPlan');
        this.logger.log('📦 ApplicationNew - localStorage selectedPlan:', storedPlan);

        if (storedPlan) {
          this.selectedPlan = { ...this.selectedPlan, ...JSON.parse(storedPlan) };
          this.logger.log('✅ ApplicationNew - Plan final fusionné:', this.selectedPlan);
        }

        this.notificationService.info(
          `Plan ${this.selectedPlan.name} sélectionné. Finalisez maintenant la création de votre application.`,
          "Création d'application",
        );
      } else {
        this.logger.log('❌ ApplicationNew - Pas de plan dans les queryParams');
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
    this.logger.log('🔄 ApplicationNew - changePlan() appelée');
    this.router.navigate(['/subscriptions/plans'], {
      queryParams: { returnTo: 'create-application' },
    });
    this.logger.log(
      '🔄 ApplicationNew - Navigation vers /subscriptions/plans avec returnTo=create-application',
    );
  }

  // Méthode pour ajouter un plan (même logique que changePlan)
  addPlan(): void {
    this.logger.log('➕ ApplicationNew - addPlan() appelée');
    this.router.navigate(['/subscriptions/plans'], {
      queryParams: { returnTo: 'create-application' },
    });
    this.logger.log(
      '➕ ApplicationNew - Navigation vers /subscriptions/plans avec returnTo=create-application',
    );
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
    this.logger.log('🚀 onSubmit() - Début de la création');
    this.logger.log('📝 Données du formulaire:', this.configurationForm);
    this.logger.log('📋 Plan sélectionné:', this.selectedPlan);

    if (!this.validateForm()) {
      this.logger.log('❌ Validation du formulaire échouée');
      return;
    }

    this.logger.log('✅ Validation du formulaire réussie');
    this.isSubmitting = true;

    // Notification de début de création
    this.notificationService.info('Création de la nouvelle application en cours...', 'Création');

    // Inclure les informations du plan dans la création
    const planInfo = this.selectedPlan
      ? {
          defaultPlanId: this.selectedPlan.id || this.selectedPlan._id,
          selectedPlan: {
            id: this.selectedPlan.id || this.selectedPlan._id,
            name: this.selectedPlan.name,
            description: this.selectedPlan.description || '',
            price: this.selectedPlan.price || 0,
            currency: this.selectedPlan.currency || 'EUR',
            billingCycle: this.selectedPlan.billingCycle || 'MONTHLY',
            type: this.selectedPlan.type || 'STANDARD',
            isActive: this.selectedPlan.isActive !== undefined ? this.selectedPlan.isActive : true,
            isPopular: this.selectedPlan.isPopular || false,
            features: this.selectedPlan.features || this.selectedPlan.includedFeatures || [],
            createdAt: this.selectedPlan.createdAt || new Date(),
            updatedAt: this.selectedPlan.updatedAt || new Date(),
          },
        }
      : {};

    this.logger.log('📦 Informations complètes du plan à inclure:', planInfo);

    // Étape 1: Créer l'application
    const newApplication: Partial<Application> = {
      name: this.configurationForm.applicationName,
      status: this.configurationForm.isActive ? ('active' as const) : ('inactive' as const),
      ...planInfo, // Inclure les informations du plan
    };

    this.logger.log("🏗️ Données de l'application à créer:", newApplication);

    this.applicationService.createApplication(newApplication).subscribe({
      next: (createdApp: Application) => {
        this.logger.log('✅ Application créée avec succès:', createdApp);

        // Étape 2: Créer la configuration pour cette application
        if (!createdApp._id) {
          this.logger.log("❌ ID de l'application manquant");
          this.notificationService.error("Erreur: ID de l'application manquant");
          this.isSubmitting = false;
          return;
        }

        this.logger.log("🔧 Création de la configuration pour l'application:", createdApp._id);

        const configRequest = {
          applicationId: createdApp._id,
          applicationName: this.configurationForm.applicationName,
          domainName: this.configurationForm.domainName,
          isActive: this.configurationForm.isActive,
          paymentMethods: this.configurationForm.paymentMethods,
          logo: this.selectedLogo || undefined,
        };

        this.logger.log('📝 Données de configuration à sauvegarder:', configRequest);

        this.configurationService.saveConfiguration(configRequest).subscribe({
          next: (savedConfig) => {
            this.logger.log('✅ Configuration sauvegardée avec succès:', savedConfig);

            const successMessage = this.selectedPlan
              ? `Nouvelle application "${this.configurationForm.applicationName}" créée avec succès avec le plan ${this.selectedPlan.name} !`
              : `Nouvelle application "${this.configurationForm.applicationName}" créée avec succès !`;

            this.notificationService.success(successMessage, 'Application créée');

            this.isSubmitting = false;

            // Nettoyer le plan sélectionné après création réussie
            if (this.selectedPlan && createdApp._id) {
              // Sauvegarder le plan pour la page de configuration (format compatible)
              try {
                this.logger.log(
                  "💾 Sauvegarde du plan pour la page de configuration de l'app:",
                  createdApp._id,
                );
                // Sauvegarder avec les clés utilisées par le système de configuration
                localStorage.setItem('selectedPlan', JSON.stringify(this.selectedPlan));
                localStorage.setItem('selectedApplicationId', createdApp._id);

                // Aussi sauvegarder avec l'ancien format pour compatibilité
                localStorage.setItem(
                  `appDefaultPlan:${createdApp._id}`,
                  JSON.stringify(this.selectedPlan),
                );
              } catch (e) {
                this.logger.warn('Erreur lors de la sauvegarde du plan dans localStorage:', e);
              }
              this.logger.log('✅ Plan sauvegardé pour configuration ultérieure');
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
              this.logger.warn('Unable to persist app logo to localStorage', e);
            }

            // Déclencher le rafraîchissement de la liste des applications
            this.applicationRefreshService.triggerRefresh();

            // Rediriger vers la liste des applications
            this.router.navigate(['/applications']);
          },
          error: (configError) => {
            this.logger.error('❌ Erreur lors de la création de la configuration:', configError);
            this.logger.error("📊 Détails de l'erreur de config:", {
              message: configError.message,
              status: configError.status,
              statusText: configError.statusText,
              error: configError.error,
              url: configError.url,
            });
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
        this.logger.error("❌ Erreur lors de la création de l'application:", error);
        this.logger.error("📊 Détails de l'erreur:", {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          url: error.url,
        });
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
