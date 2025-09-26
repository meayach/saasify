import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from '../../../../@core/services/theme.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { PlanService } from '../../services/plan.service';
import { SubscriptionService } from '../../services/subscription.service';
import { UserService, UserProfile } from '../../../../@shared/services/user.service';
import { NotificationService } from '../../../../@shared/services/notification.service';
import { BillingService, Plan } from '../../../../@shared/services/billing.service';
import { BillingStateService } from '../../../../@shared/services/billing-state.service';
import { LoggerService } from '../../../../@core/services/logger.service';

@Component({
  selector: 'app-plan-selection',
  templateUrl: './plan-selection.component.html',
  styleUrls: ['./plan-selection.component.css'],
})
export class PlanSelectionComponent implements OnInit {
  plans: Plan[] = [];
  loading = false;
  loadingPlans = false;
  error: string | null = null;
  isAdmin = false;
  selectedBillingCycle = 'month';
  billingCycles = [
    { value: 'month', label: 'Mensuel' },
    { value: 'year', label: 'Annuel' },
  ];
  // Header user dropdown properties
  userName = 'Utilisateur';
  userEmail = '';
  userRole = '';
  isDropdownOpen = false;
  activeProfileSection = '';
  returnTo = ''; // Pour savoir d'où vient l'utilisateur
  isDarkMode = false;
  private themeSubscription: Subscription | null = null;
  currentCurrency = 'EUR';
  private billingSubscription: Subscription | null = null;

  // Variables de cache pour éviter les appels répétés
  private _cachedFilteredPlans: Plan[] = [];
  private _lastFilterKey: string = '';
  private _lastFilterCheck: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private planService: PlanService,
    private subscriptionService: SubscriptionService,
    private userService: UserService,
    private notificationService: NotificationService,
    private billingService: BillingService,
    private billingState: BillingStateService,
    private logger: LoggerService,
    private themeService: ThemeService,
  ) {}

  // Public helper to navigate to dashboard (used from template)
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  ngOnInit(): void {
    this.logger.log('🚀 PlanSelection - ngOnInit');

    // Récupérer les paramètres de query pour la redirection
    this.route.queryParams.subscribe((params) => {
      this.logger.log('📊 PlanSelection - queryParams:', params);
      this.returnTo = params['returnTo'] || '';
      this.logger.log('🔍 PlanSelection - returnTo:', this.returnTo);

      // Stocker l'applicationId s'il est fourni
      if (params['applicationId']) {
        localStorage.setItem('selectedApplicationId', params['applicationId']);
        this.logger.log('💾 ApplicationId stocké:', params['applicationId']);
      }
    });

    // Charger le profil utilisateur pour le header, puis les plans
    this.userService.getCurrentUserProfile().subscribe({
      next: (profile: UserProfile) => {
        if (profile) {
          this.userName =
            `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || this.userName;
          this.userEmail = profile.email || this.userEmail;
          this.userRole =
            profile.role === 'admin'
              ? 'Admin'
              : profile.role === 'manager'
              ? 'Customer Manager'
              : profile.role || 'Customer User';
          // flag used to display admin-only controls on public pages
          this.isAdmin = profile.role === 'admin';
        }
      },
      error: (err) => {
        // Si erreur 401/403, informer l'utilisateur (token manquant/expiré)
        if (err && (err.status === 401 || err.status === 403)) {
          this.notificationService.warning(
            'Session expirée ou non authentifiée. Certaines informations peuvent ne pas être disponibles.',
          );
        }
        // fallback: tenter de construire le profil depuis localStorage

        try {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (currentUser) {
            const nameCandidates = [
              `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
              currentUser.displayName,
              currentUser.fullName,
              currentUser.username,
              currentUser.name,
            ];
            const foundName = nameCandidates.find((n: any) => !!n);
            if (foundName) {
              this.userName = foundName;
            }
            this.userEmail = currentUser.email || currentUser.username || this.userEmail;
            this.userRole =
              currentUser.role === 'admin'
                ? 'Admin'
                : currentUser.role === 'manager'
                ? 'Customer Manager'
                : currentUser.role || currentUser.userRole || 'Customer User';
            this.isAdmin = currentUser.role === 'admin';
          }
        } catch (e) {
          // ignore
        }
      },
    });

    // Utiliser la même logique que dans dashboard.component.ts pour charger les plans
    this.loadPlans();

    this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });

    // Subscribe to billing settings so currency is reactive
    this.billingSubscription = this.billingState.settings$?.subscribe((s) => {
      if (s && s.defaultCurrency) {
        // Normalize currency code at component level
        const c = (s.defaultCurrency || 'EUR').toString().toUpperCase().trim();
        if (c === 'GB' || c === 'GBR') this.currentCurrency = 'GBP';
        else if (c === 'US' || c === 'USA') this.currentCurrency = 'USD';
        else if (c === 'EU' || c === 'EURS') this.currentCurrency = 'EUR';
        else this.currentCurrency = c;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.billingSubscription) {
      this.billingSubscription.unsubscribe();
    }
  }

  // Même méthode que dans dashboard.component.ts pour charger les plans
  loadPlans(): void {
    // Invalider le cache quand on recharge les plans
    this._lastFilterCheck = 0;
    this._cachedFilteredPlans = [];

    this.loadingPlans = true;
    this.billingService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.loadingPlans = false;
      },
      error: (error) => {
        this.logger.error('Erreur lors du chargement des plans:', error);
        this.loadingPlans = false;
        // Créer des plans par défaut si aucun n'existe (même logique que dashboard.component.ts)
        this.plans = [
          {
            _id: 'plan-starter-monthly-2025',
            name: 'Plan Starter 2025',
            description: 'Parfait pour débuter',
            price: 9.99,
            interval: 'month' as const,
            features: ['1 Application', 'Support email', 'Analytics de base'],
            isActive: true,
            maxUsers: 5,
            maxApplications: 1,
            hasApiAccess: false,
            hasAdvancedAnalytics: false,
            hasPrioritySupport: false,
          },
          {
            _id: 'plan-starter-yearly-2025',
            name: 'Plan Starter',
            description: 'Parfait pour débuter',
            price: 99.99,
            interval: 'year' as const,
            features: ['1 Application', 'Support email', 'Analytics de base'],
            isActive: true,
            maxUsers: 5,
            maxApplications: 1,
            hasApiAccess: false,
            hasAdvancedAnalytics: false,
            hasPrioritySupport: false,
          },
          {
            _id: 'plan-pro-monthly-2025',
            name: 'Plan Pro',
            description: 'Pour les professionnels',
            price: 29.99,
            interval: 'month' as const,
            features: ['5 Applications', 'Support prioritaire', 'Analytics avancées'],
            isActive: true,
            maxUsers: 25,
            maxApplications: 5,
            hasApiAccess: true,
            hasAdvancedAnalytics: true,
            hasPrioritySupport: true,
          },
          {
            _id: 'plan-pro-yearly-2025',
            name: 'Plan Pro',
            description: 'Pour les professionnels',
            price: 299.99,
            interval: 'year' as const,
            features: ['5 Applications', 'Support prioritaire', 'Analytics avancées'],
            isActive: true,
            maxUsers: 25,
            maxApplications: 5,
            hasApiAccess: true,
            hasAdvancedAnalytics: true,
            hasPrioritySupport: true,
          },
        ];
      },
    });
  }

  // Header user dropdown methods
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  setActiveProfileSection(section: string): void {
    this.isDropdownOpen = false;
    this.activeProfileSection = section;

    if (section === 'edit') {
      this.notificationService.success('Redirection vers la modification du profil');
      this.router.navigate(['/dashboard'], { queryParams: { section: 'profile-edit' } });
    } else if (section === 'password') {
      this.notificationService.success('Redirection vers le changement de mot de passe');
      this.router.navigate(['/dashboard'], { queryParams: { section: 'profile-password' } });
    }
  }

  logout(): void {
    this.isDropdownOpen = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    this.notificationService.success('Déconnexion réussie');
    this.router.navigate(['/login']);
  }

  // Méthodes pour le filtrage et affichage des plans
  getFilteredPlans(): Plan[] {
    const now = Date.now();
    const filterKey = `${this.selectedBillingCycle}-${this.plans.length}`;

    // Utiliser le cache si disponible et récent (moins de 1 seconde)
    if (
      this._lastFilterCheck > 0 &&
      now - this._lastFilterCheck < 1000 &&
      this._lastFilterKey === filterKey &&
      this._cachedFilteredPlans.length > 0
    ) {
      return this._cachedFilteredPlans;
    }

    const filtered = this.plans.filter((plan) => plan.interval === this.selectedBillingCycle);

    // Si aucun plan filtré, retourner tous les plans mensuels par défaut
    let result = filtered;
    if (filtered.length === 0 && this.plans.length > 0) {
      const monthlyPlans = this.plans.filter((plan) => plan.interval === 'month');
      result = monthlyPlans.length > 0 ? monthlyPlans : this.plans;
    }

    // Mettre à jour le cache
    this._cachedFilteredPlans = result;
    this._lastFilterKey = filterKey;
    this._lastFilterCheck = now;

    return result;
  }

  getPlanFeatures(plan: Plan): string[] {
    return plan.features || [];
  }

  formatPrice(plan: Plan): string {
    const price = typeof plan.price === 'number' ? plan.price.toFixed(0) : '0';
    // Use currentCurrency but fallback to EUR
    const c = (this.currentCurrency || 'EUR').toString().toUpperCase();
    let normalized = c === 'GB' || c === 'GBR' ? 'GBP' : c;
    if (normalized === 'US' || normalized === 'USA') normalized = 'USD';
    const symbol =
      normalized === 'USD'
        ? '$'
        : normalized === 'GBP'
        ? '£'
        : normalized === 'JPY'
        ? '¥'
        : normalized === 'CHF'
        ? 'CHF'
        : normalized === 'EUR'
        ? '€'
        : normalized;
    return `${symbol}${price}`;
  }

  selectPlan(plan: Plan): void {
    this.logger.log('🎯 selectPlan appelée avec le plan:', plan);
    this.logger.log('🎯 returnTo:', this.returnTo);

    // Stocker TOUTES les données du plan pour la création d'application
    const planAny = plan as any; // Cast pour accéder aux propriétés supplémentaires de l'API
    const planData = {
      id: plan._id,
      _id: plan._id, // Ajouter aussi _id pour compatibilité
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: planAny.currency || 'EUR', // Propriété de l'API
      billingCycle: planAny.billingCycle || plan.interval || 'MONTHLY', // Mapper interval vers billingCycle
      type: planAny.type || 'STANDARD',
      isActive: plan.isActive,
      isPopular: planAny.isPopular || false,
      includedFeatures: planAny.includedFeatures || plan.features || [],
      features: plan.features || planAny.includedFeatures || [], // Compatibilité
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      // Propriétés supplémentaires pour compatibilité
      interval: plan.interval,
      maxUsers: plan.maxUsers,
      maxApplications: plan.maxApplications,
      hasApiAccess: plan.hasApiAccess,
      hasAdvancedAnalytics: plan.hasAdvancedAnalytics,
      hasPrioritySupport: plan.hasPrioritySupport,
    };

    this.logger.log('💾 Données du plan à stocker:', planData);
    localStorage.setItem('selectedPlan', JSON.stringify(planData));
    this.logger.log('✅ Plan stocké dans localStorage');

    // Vérifier immédiatement que c'est bien stocké
    const storedPlan = localStorage.getItem('selectedPlan');
    this.logger.log('🔍 Vérification - Plan stocké:', storedPlan);

    if (this.returnTo === 'create-application') {
      // Vérifier s'il y a un applicationId (pour configuration) ou création nouvelle
      const applicationId = localStorage.getItem('selectedApplicationId');

      if (applicationId) {
        // Rediriger vers la page de configuration de l'application existante
        this.notificationService.success(
          `Plan ${plan.name} sélectionné ! Configuration de votre application en cours...`,
        );
        localStorage.removeItem('selectedApplicationId'); // Nettoyer après utilisation
        this.router.navigate(['/applications/configure', applicationId]);
      } else {
        // Rediriger vers le formulaire de création d'application avec le plan sélectionné
        this.notificationService.success(
          `Plan ${plan.name} sélectionné ! Créez maintenant votre application.`,
        );
        this.router.navigate(['/applications/create-new'], {
          queryParams: { planId: plan._id, planName: plan.name },
        });
      }
    } else if (this.returnTo === 'configure-application') {
      // Cas spécifique pour le changement de plan d'une application existante
      const applicationId = this.route.snapshot.queryParams['applicationId'];

      if (applicationId) {
        // Sauvegarder l'ID de l'application pour la page de configuration
        localStorage.setItem('selectedApplicationId', applicationId);

        // IMPORTANT: Sauvegarder aussi le plan avec la clé spécifique à l'application pour persistance
        localStorage.setItem(`appDefaultPlan:${applicationId}`, JSON.stringify(planData));
        this.logger.log(`💾 Plan sauvegardé pour l'application ${applicationId}:`, planData);

        this.notificationService.success(
          `Plan ${plan.name} sélectionné ! Retour à la configuration...`,
        );
        this.router.navigate(['/applications/configure', applicationId]);
      } else {
        // Fallback si pas d'applicationId
        this.notificationService.warning('Erreur: ID application manquant');
        this.router.navigate(['/applications']);
      }
    } else {
      // Comportement normal pour les abonnements
      this.notificationService.success(`Plan ${plan.name} sélectionné !`);
      // Ici vous pouvez ajouter la logique pour souscrire au plan
    }
  }

  onEditPlan(plan: Plan): void {
    const planId = (plan as any)._id || (plan as any).id || (plan as any).planId;
    if (!planId) {
      this.logger.warn('onEditPlan: plan id missing', plan);
      return;
    }
    this.router.navigate(['/subscriptions', 'plans', 'edit', planId]);
  }

  isRecommended(plan: Plan): boolean {
    const p = plan as any;
    if (p.isRecommended || p.recommended || p.isPopular) return true;
    const name = (p.name || '').toString().toLowerCase();
    const displayName = this.displayPlanName(plan).toString().toLowerCase();

    // Make ChatGPT-like 'Plus' plan show as popular
    if (name.includes('plus') || displayName.includes('plus')) return true;

    // Fallback: originally we highlighted growth plans
    return name.includes('growth');
  }

  displayPlanName(plan: Plan): string {
    const name = ((plan as any).name || '').toString();
    // Remove leading 'Plan ' or 'plan ' if present
    const base = name.replace(/^\s*plan\s+/i, '').trim();
    const lower = base.toLowerCase();
    // Map known English names to French equivalents
    if (lower.startsWith('starter')) return 'Basique';
    if (lower.includes('growth')) return 'Croissance';
    if (lower.includes('enterprise') || lower.includes('entreprise')) return 'Entreprise';
    // Default: capitalize first letter
    return base.charAt(0).toUpperCase() + base.slice(1);
  }

  // Return true for plan names that should be displayed larger (38px)
  isLargeName(plan: Plan): boolean {
    const dn = this.displayPlanName(plan).toString().toLowerCase();
    return (
      dn.includes('essentiel') ||
      dn.includes('plus') ||
      dn.includes('pro') ||
      dn.includes('business')
    );
  }

  isFeatured(plan: Plan): boolean {
    const p = plan as any;
    const nameRaw = (p.name || '').toString();
    const name = nameRaw.toLowerCase();
    const displayName = this.displayPlanName(plan).toString().toLowerCase();
    const interval = (p.interval || '').toString().toLowerCase();

    // Explicit flags from the API take priority
    if (p.featured || p.isFeatured) return true;

    // Center any plan explicitly named or mapped to 'business'
    if (name.includes('business') || displayName.includes('business')) return true;

    // Fallback: make 'growth' annual the featured card (legacy behavior)
    if (
      name.includes('growth') &&
      (interval === 'year' || interval === 'annual' || p.interval === 'year')
    )
      return true;

    return false;
  }

  // Return true for plan names that should use the Business gradient
  isBusinessLike(plan: Plan): boolean {
    const name = ((plan as any).name || '').toString().toLowerCase();
    const display = this.displayPlanName(plan).toString().toLowerCase();
    return (
      name.includes('business') ||
      name.includes('essentiel') ||
      name.includes('pro') ||
      name.includes('plus') ||
      display.includes('business') ||
      display.includes('essentiel') ||
      display.includes('pro') ||
      display.includes('plus')
    );
  }

  debugAlert(message: string): void {
    alert(message);
  }

  // Méthodes utilitaires
  changeBillingCycle(cycle: string): void {
    // Invalider le cache quand le cycle change
    this._lastFilterCheck = 0;
    this._cachedFilteredPlans = [];
    this.selectedBillingCycle = cycle;
  }

  onBillingCycleChange(): void {
    // Invalider le cache quand le cycle change
    this._lastFilterCheck = 0;
    this._cachedFilteredPlans = [];
  }
}
