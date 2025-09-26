import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from '../../../../@core/services/theme.service';
import { Subscription } from 'rxjs';
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
import { ApiService } from '../../../../@core/services/api.service';
import { UserService, UserProfile } from '../../../../@shared/services/user.service';

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
  isDarkMode = false;
  private themeSubscription: Subscription | null = null;
  // User / header state (copied from dashboard for consistent header behavior)
  userRole = 'Admin';
  userName = '';
  userEmail = '';
  isDropdownOpen = false;
  userDropdownVisible = false;
  activeProfileSection = ''; // 'edit' | 'password'

  // Données du profil utilisateur pour édition
  userProfile: any = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    zipCode: '',
  };

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
  selectedDefaultPlanId: string | null = null;
  selectedPlanObject: any = null; // Objet complet du plan sélectionné pour l'affichage
  planCheckCompleted: boolean = false; // Flag pour indiquer que la vérification du plan est terminée
  isChangingPlan: boolean = false;
  tempSelectedPlanId: string | null = null;
  plans: any[] = [];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private configurationService: ApplicationConfigurationService,
    private notificationService: NotificationService,
    private applicationRefreshService: ApplicationRefreshService,
    private apiService: ApiService,
    private userService: UserService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.applicationId = this.route.snapshot.paramMap.get('id');

    // Charger les infos utilisateur pour le header
    this.loadUserInfo();

    if (this.applicationId) {
      this.loadApplication();
    } else {
      this.router.navigate(['/applications']);
    }

    // Écouter les changements d'applications pour synchroniser le toggle
    this.applicationRefreshService.refreshNeeded$.subscribe(() => {
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

    this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  loadUserInfo(): void {
    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
      const user = JSON.parse(currentUser);

      if (user.firstName && user.lastName) {
        this.userName = `${user.firstName} ${user.lastName}`;
      } else if (user.firstname && user.lastname) {
        this.userName = `${user.firstname} ${user.lastname}`;
      } else if (user.name) {
        this.userName = user.name;
      } else if (user.fullName) {
        this.userName = user.fullName;
      } else if (user.email) {
        this.userName = user.email.split('@')[0];
      } else {
        this.userName = 'Utilisateur';
      }

      this.userEmail = user.email || '';
      this.userRole =
        user.role === 'admin'
          ? 'Admin'
          : user.role === 'manager'
          ? 'Customer Manager'
          : 'Customer User';

      this.userProfile = {
        firstName: user.firstName || user.firstname || '',
        lastName: user.lastName || user.lastname || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || user.phone || '',
        streetAddress: user.streetAddress || user.address || '',
        city: user.city || '',
        zipCode: user.zipCode || user.zip || '',
      };
    } else {
      this.userName = 'Utilisateur';
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  editProfile(): void {
    this.userDropdownVisible = false;
    this.loadUserProfileFromServer();
    this.activeProfileSection = 'edit';
  }

  loadUserProfileFromServer(): void {
    this.userService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          streetAddress: profile.streetAddress || '',
          city: profile.city || '',
          zipCode: profile.zipCode || '',
        };

        try {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const updated = { ...currentUser, ...this.userProfile };
          localStorage.setItem('currentUser', JSON.stringify(updated));
        } catch (e) {
          // ignore localStorage errors
        }
      },
      error: (err) => {
        console.warn('Erreur récupération profil, utilisation des données locales.', err);
      },
    });
  }

  changePassword(): void {
    this.userDropdownVisible = false;
    this.activeProfileSection = 'password';
  }

  logout(): void {
    this.isDropdownOpen = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
    this.notificationService.success('Déconnexion réussie');
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

          // Prioriser selectedPlan.id sur defaultPlanId
          this.selectedDefaultPlanId = app.selectedPlan?.id || app.defaultPlanId || null;

          // Si l'application a déjà un selectedPlan complet, l'utiliser
          if (app.selectedPlan && app.selectedPlan.name) {
            this.selectedPlanObject = app.selectedPlan;
          }

          // Récupérer le plan sélectionné depuis localStorage (provenant de la sélection de plan)
          this.checkForSelectedPlanFromStorage();

          // Si on a un ID de plan mais pas les détails complets, les charger depuis l'API
          if (this.selectedDefaultPlanId && !this.selectedPlanObject) {
            this.loadPlanDetails(this.selectedDefaultPlanId);
          } else {
            // Marquer la vérification comme terminée si pas besoin de charger depuis l'API
            this.planCheckCompleted = true;
          }

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
                // Application mise à jour avec succès
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

  loadPlanDetails(planId: string): void {
    this.apiService.getPlanById(planId).subscribe({
      next: (plan) => {
        if (plan) {
          this.selectedPlanObject = plan;
          console.log('Plan details loaded from API:', plan);
        }
      },
      error: (error) => {
        console.warn('Erreur lors du chargement des détails du plan:', error);
      },
      complete: () => {
        // Marquer la vérification comme terminée même en cas d'erreur
        this.planCheckCompleted = true;
      },
    });
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

          // Mettre à jour seulement si c'est différent pour éviter les boucles
          if (this.configurationForm.isActive !== newIsActive) {
            this.configurationForm.isActive = newIsActive;
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

    if (this.applicationId && this.currentApplication) {
      // Mettre à jour immédiatement l'état de l'application pour synchroniser avec les cartes
      this.applicationService.updateApplicationStatus(this.applicationId, isActive).subscribe({
        next: () => {
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

  hasSelectedPlan(): boolean {
    // Si la vérification n'est pas encore terminée, retourner false
    if (!this.planCheckCompleted) {
      return false;
    }

    // Vérifier s'il y a un plan sélectionné (soit depuis localStorage soit défini manuellement)
    return (
      (this.selectedDefaultPlanId !== null && this.selectedDefaultPlanId !== undefined) ||
      (this.selectedPlanObject !== null && this.selectedPlanObject !== undefined)
    );
  }

  getCurrentSelectedPlan(): any {
    if (!this.hasSelectedPlan()) {
      return null;
    }

    // Si on a selectedPlanObject, l'utiliser (depuis localStorage ou API)
    if (this.selectedPlanObject) {
      return this.selectedPlanObject;
    }

    // Si on a selectedPlan dans currentApplication, l'utiliser
    if (this.currentApplication?.selectedPlan) {
      return this.currentApplication.selectedPlan;
    }

    // Sinon retourner un objet simple avec l'ID disponible
    return {
      id: this.selectedDefaultPlanId,
      name: 'Plan sélectionné',
      description: 'Chargement des détails...',
      price: 0,
      currency: 'EUR',
      billingCycle: 'monthly',
    };
  }

  getPlanId(plan: any): string {
    return plan?.id || plan?._id || '';
  }

  getPlanCycleLabel(cycle: string): string {
    const labels: { [key: string]: string } = {
      monthly: 'mois',
      yearly: 'an',
      daily: 'jour',
      weekly: 'semaine',
    };
    return labels[cycle] || cycle;
  }

  startChangingPlan(): void {
    this.isChangingPlan = true;
    this.tempSelectedPlanId = null;
  }

  navigateToPlanSelection(): void {
    // Naviguer vers la page de sélection de plan pour modifier le plan existant
    if (this.applicationId) {
      this.router.navigate(['/subscriptions/plans'], {
        queryParams: {
          returnTo: 'configure-application',
          applicationId: this.applicationId,
        },
      });
    }
  }

  cancelPlanChange(): void {
    this.isChangingPlan = false;
    this.tempSelectedPlanId = null;
  }

  confirmPlanChange(): void {
    if (this.tempSelectedPlanId) {
      this.selectedDefaultPlanId = this.tempSelectedPlanId;
      this.isChangingPlan = false;
      this.tempSelectedPlanId = null;
      // Optionnel: sauvegarder automatiquement
      // Persist the selected default plan to the backend for authoritative stats
      const planForPersist = this.plans.find(
        (p) => this.getPlanId(p) === this.selectedDefaultPlanId,
      );
      try {
        this.persistSelectedPlanToServer(planForPersist).catch((err) => {
          console.warn('Failed to persist plan on confirm:', err);
        });
      } catch (e) {
        console.warn('persistSelectedPlanToServer threw synchronously:', e);
      }
      this.onSubmit();
    }
  }

  selectPlan(plan: any): void {
    const planId = this.getPlanId(plan);
    if (this.isChangingPlan) {
      this.tempSelectedPlanId = planId;
    } else {
      this.selectedDefaultPlanId = planId;
      // Persist immediately when user selects a plan outside of 'change' flow
      try {
        this.persistSelectedPlanToServer(plan).catch((err) => {
          console.warn('Failed to persist plan on select:', err);
        });
      } catch (e) {
        console.warn('persistSelectedPlanToServer threw synchronously:', e);
      }
    }
  }

  clearStoredPlans(): void {
    // Vider les plans stockés localement si nécessaire
    this.plans = [];
    this.selectedDefaultPlanId = null;
    // Vous pouvez ajouter ici la logique pour nettoyer localStorage si nécessaire
  }

  autoSelectFirstPlan(): void {
    if (this.plans && this.plans.length > 0) {
      const firstPlan = this.plans[0];
      this.selectedDefaultPlanId = this.getPlanId(firstPlan);
      // Sauvegarder automatiquement
      this.onSubmit();
    }
  }

  checkForSelectedPlanFromStorage(): void {
    try {
      // D'abord chercher avec la clé globale
      let storedPlan = localStorage.getItem('selectedPlan');
      let storedAppId = localStorage.getItem('selectedApplicationId');

      // Si trouvé et correspond à cette application
      if (storedPlan && storedAppId === this.applicationId) {
        const planData = JSON.parse(storedPlan);
        this.selectedPlanObject = planData;

        if (planData.id || planData._id) {
          this.selectedDefaultPlanId = planData.id || planData._id;

          // IMPORTANT: Sauvegarder le plan dans la clé spécifique à l'application pour persistance
          localStorage.setItem(`appDefaultPlan:${this.applicationId}`, JSON.stringify(planData));
          console.log(
            `💾 Plan sauvegardé pour persistance avec la clé appDefaultPlan:${this.applicationId}`,
          );

          // Persist to backend so server can compute authoritative revenue
          try {
            this.persistSelectedPlanToServer(planData).catch((err) => {
              console.warn('Unable to persist selected plan to server:', err);
            });
          } catch (e) {
            console.warn('Persist call failed synchronously:', e);
          }

          // Nettoyer le localStorage après utilisation SEULEMENT pour la clé globale
          localStorage.removeItem('selectedPlan');
          localStorage.removeItem('selectedApplicationId');
        }
        return; // Plan trouvé, pas besoin de chercher ailleurs
      }

      // Sinon, chercher avec la clé spécifique à l'application (ne pas nettoyer pour permettre la persistance)
      const appSpecificPlan = localStorage.getItem(`appDefaultPlan:${this.applicationId}`);
      if (appSpecificPlan) {
        const planData = JSON.parse(appSpecificPlan);
        this.selectedPlanObject = planData;

        if (planData.id || planData._id) {
          this.selectedDefaultPlanId = planData.id || planData._id;
          console.log(`✅ Plan récupéré depuis la clé spécifique à l'application:`, planData);
          // NE PAS nettoyer la clé spécifique à l'application pour persistance
          // localStorage.removeItem(`appDefaultPlan:${this.applicationId}`);
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération du plan depuis localStorage:', error);
    } finally {
      // Marquer la vérification comme terminée dans tous les cas seulement si on ne charge pas depuis l'API
      if (!this.selectedDefaultPlanId || this.selectedPlanObject) {
        this.planCheckCompleted = true;
      }
    }
  }

  /**
   * Persist the selected/default plan for this application to the backend so
   * the server can compute authoritative monthly revenue.
   * Accepts either a full plan object or will read current component state.
   */
  async persistSelectedPlanToServer(planObj?: any): Promise<void> {
    if (!this.applicationId) return;

    const payload: any = {};

    // If a full plan object is provided, use its id as defaultPlanId and also send lightweight selectedPlan
    const plan = planObj || this.selectedPlanObject;
    if (plan) {
      const id = plan.id || plan._id || this.selectedDefaultPlanId;
      if (id) payload.defaultPlanId = id;

      // include a minimal selectedPlan object to help the backend if needed
      payload.selectedPlan = {
        id: plan.id || plan._id || null,
        name: plan.name || plan.title || null,
        price: plan.price || 0,
        currency: plan.currency || 'EUR',
        billingCycle: plan.billingCycle || 'monthly',
      };
    } else if (this.selectedDefaultPlanId) {
      payload.defaultPlanId = this.selectedDefaultPlanId;
    }

    // If nothing to persist, skip
    if (Object.keys(payload).length === 0) return;

    return new Promise((resolve, reject) => {
      // Use ApplicationService which targets the `dashboard-applications` controller
      this.applicationService.updateApplication(this.applicationId!, payload).subscribe({
        next: () => {
          console.debug('Persisted selected plan to server for app', this.applicationId, payload);
          resolve();
        },
        error: (err) => {
          console.warn('Error persisting selected plan to server via ApplicationService:', err);
          reject(err);
        },
      });
    });
  }
}
