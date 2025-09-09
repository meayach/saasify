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
import { ApiService, Plan } from '../../../../@core/services/api.service';

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
  plans: Plan[] = [];
  selectedDefaultPlanId: string | null = null;
  isChangingPlan = false;
  tempSelectedPlanId: string | null = null;

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
    private apiService: ApiService,
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

          // 🎯 Récupérer le plan par défaut de l'application
          this.selectedDefaultPlanId = app.defaultPlanId || null;
          console.log(
            "🎯 Plan par défaut chargé depuis l'application:",
            this.selectedDefaultPlanId,
          );

          console.log(
            '📋 Application chargée:',
            app.name,
            'Status:',
            app.status,
            'isActive:',
            this.configurationForm.isActive,
            'defaultPlanId:',
            this.selectedDefaultPlanId,
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
        // Charger les plans associés à cette application
        this.loadPlans();
      },
      error: (error) => {
        // Si aucune configuration n'existe, ce n'est pas une erreur
        console.info(
          "Aucune configuration existante trouvée, création d'une nouvelle configuration",
        );
        this.isLoading = false;
        // charger les plans même si pas de configuration
        this.loadPlans();
      },
    });
  }

  loadPlans(): void {
    if (!this.applicationId) return;

    // Charger TOUS les plans disponibles au lieu de seulement ceux liés à l'application
    this.apiService.getPlans().subscribe({
      next: (response: any) => {
        // Gérer la réponse qui peut être un objet avec des plans ou directement un tableau
        this.plans = response?.plans || response || [];
        console.log('🔍 Tous les plans chargés:', this.plans.length);
        console.log('📋 Plans disponibles:', this.plans);

        // Si aucun plan n'est trouvé, utiliser des plans par défaut
        if (this.plans.length === 0) {
          console.log('⚠️ Aucun plan trouvé, utilisation des plans par défaut');
          this.loadDefaultPlans();
        }

        // Preselect default plan if application has one
        if (this.currentApplication && this.currentApplication.defaultPlanId) {
          this.selectedDefaultPlanId = this.currentApplication.defaultPlanId;
          console.log('🎯 Plan par défaut sélectionné:', this.selectedDefaultPlanId);
        }
        // If application has no default but there's exactly one plan, preselect it
        else if (!this.selectedDefaultPlanId && this.plans && this.plans.length === 1) {
          const solePlanId = this.getPlanId(this.plans[0]);
          this.selectedDefaultPlanId = solePlanId;
          console.log('ℹ️ Un seul plan disponible — pré-sélection automatique:', solePlanId);
        }
      },
      error: (err: any) => {
        console.warn('Erreur lors du chargement des plans:', err);
        console.log('🔄 Chargement des plans par défaut...');
        this.loadDefaultPlans();
      },
    });
  }

  // Méthode pour charger des plans par défaut si l'API ne fonctionne pas
  loadDefaultPlans(): void {
    this.plans = [
      {
        id: 'plan-starter-2025',
        name: 'Plan Starter',
        description: 'Parfait pour débuter',
        price: 9.99,
        currency: 'EUR',
        billingCycle: 'MONTHLY',
        features: ['1 Application', 'Support email', 'Analytics de base'],
        applicationId: '',
        isActive: true,
        limitations: {},
      },
      {
        id: 'plan-pro-2025',
        name: 'Plan Pro',
        description: 'Pour les professionnels',
        price: 29.99,
        currency: 'EUR',
        billingCycle: 'MONTHLY',
        features: ['5 Applications', 'Support prioritaire', 'Analytics avancées'],
        applicationId: '',
        isActive: true,
        limitations: {},
      },
      {
        id: 'plan-enterprise-2025',
        name: 'Plan Enterprise',
        description: 'Pour les grandes entreprises',
        price: 99.99,
        currency: 'EUR',
        billingCycle: 'MONTHLY',
        features: ['Applications illimitées', 'Support 24/7', 'Analytics complètes'],
        applicationId: '',
        isActive: true,
        limitations: {},
      },
    ];
    console.log('✅ Plans par défaut chargés:', this.plans.length);
  }

  // Helper pour récupérer un id de plan compatible (_id ou id)
  getPlanId(plan: Plan | any): string {
    return plan && (plan.id || plan._id) ? plan.id || plan._id : '';
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
          const needsPlanUpdate =
            this.selectedDefaultPlanId &&
            this.currentApplication.defaultPlanId !== this.selectedDefaultPlanId;

          if (needsNameUpdate || needsStatusUpdate || needsPlanUpdate) {
            // Créer l'objet de mise à jour avec le nom et le statut
            const updateData: any = {};

            if (needsNameUpdate) {
              updateData.name = this.configurationForm.applicationName;
            }

            if (needsStatusUpdate) {
              updateData.status = this.configurationForm.isActive ? 'active' : 'inactive';
              updateData.isActive = this.configurationForm.isActive;
            }

            // Ajouter le plan par défaut s'il est sélectionné
            if (this.selectedDefaultPlanId) {
              updateData.defaultPlanId = this.selectedDefaultPlanId;
              console.log('💾 Sauvegarde du plan par défaut:', this.selectedDefaultPlanId);
            }

            this.applicationService.updateApplication(this.applicationId!, updateData).subscribe({
              next: () => {
                console.log('Application mise à jour avec succès:', updateData);
                // Mettre à jour l'application locale immédiatement
                if (this.currentApplication && this.selectedDefaultPlanId) {
                  this.currentApplication.defaultPlanId = this.selectedDefaultPlanId;
                }
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

  // Plan management methods
  getCurrentSelectedPlan(): any {
    if (!this.selectedDefaultPlanId || !this.plans) {
      return null;
    }
    return this.plans.find((plan) => this.getPlanId(plan) === this.selectedDefaultPlanId);
  }

  startChangingPlan(): void {
    console.log('🔄 Début du changement de plan');
    this.isChangingPlan = true;
    this.tempSelectedPlanId = null;
  }

  selectPlan(plan: any): void {
    const planId = this.getPlanId(plan);
    console.log('🎯 Plan sélectionné:', plan.name, 'ID:', planId);

    if (this.isChangingPlan) {
      // En mode changement, utiliser tempSelectedPlanId
      this.tempSelectedPlanId = planId;
    } else {
      // Sélection directe (premier choix)
      this.selectedDefaultPlanId = planId;
    }
  }

  confirmPlanChange(): void {
    if (this.tempSelectedPlanId) {
      console.log('✅ Confirmation du changement de plan vers:', this.tempSelectedPlanId);
      this.selectedDefaultPlanId = this.tempSelectedPlanId;
      this.cancelPlanChange();

      // Sauvegarder automatiquement le changement
      this.onSubmit();
    }
  }

  cancelPlanChange(): void {
    console.log('❌ Annulation du changement de plan');
    this.isChangingPlan = false;
    this.tempSelectedPlanId = null;
  }

  getPlanCycleLabel(cycle: string): string {
    const cycles: { [key: string]: string } = {
      MONTHLY: 'mois',
      YEARLY: 'an',
      WEEKLY: 'semaine',
      DAILY: 'jour',
    };
    return cycles[cycle] || 'mois';
  }
}
