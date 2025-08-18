import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService } from '../../services/plan.service';
import { SubscriptionService } from '../../services/subscription.service';
import { UserService, UserProfile } from '../../../../@shared/services/user.service';
import { NotificationService } from '../../../../@shared/services/notification.service';

export interface Plan {
  _id: string;
  name: string;
  description: string;
  type: string;
  billingCycle: string;
  price: number;
  currencyId: {
    code: string;
    symbol: string;
  };
  features: Record<string, any>;
  limits: Record<string, number>;
  includedFeatures: string[];
  isPopular: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-plan-selection',
  templateUrl: './plan-selection.component.html',
  styleUrls: ['./plan-selection.component.css'],
})
export class PlanSelectionComponent implements OnInit {
  plans: Plan[] = [];
  loading = false;
  error: string | null = null;
  selectedBillingCycle = 'MONTHLY';
  billingCycles = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'YEARLY', label: 'Yearly' },
  ];
  // Header user dropdown properties
  userName = 'Utilisateur';
  userEmail = '';
  userRole = '';
  isDropdownOpen = false;
  activeProfileSection = '';

  constructor(
    private planService: PlanService,
    private subscriptionService: SubscriptionService,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  // Public helper to navigate to dashboard (used from template)
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  ngOnInit(): void {
    // Charger le profil utilisateur pour le header, puis les plans
    this.userService.getCurrentUserProfile().subscribe({
      next: (profile: UserProfile) => {
        if (profile) {
          this.userName =
            `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || this.userName;
          this.userEmail = profile.email || this.userEmail;
          this.userRole =
            profile.role === 'admin'
              ? 'Customer Admin'
              : profile.role === 'manager'
              ? 'Customer Manager'
              : profile.role || 'Customer User';
        }
      },
      error: () => {
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
                ? 'Customer Admin'
                : currentUser.role === 'manager'
                ? 'Customer Manager'
                : currentUser.role || currentUser.userRole || 'Customer User';
          }
        } catch (e) {
          // ignore
        }
      },
    });

    // Toujours charger les plans depuis la collection "plans" de la base de données
    console.log('DEBUG: Loading plans from database collection "plans"');
    this.loadPlans();
  }

  // Header user dropdown methods
  toggleDropdown(): void {
    console.log('=== toggleDropdown appelée, isDropdownOpen:', this.isDropdownOpen);
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  setActiveProfileSection(section: string): void {
    console.log('=== setActiveProfileSection appelée avec section:', section);
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
    console.log('=== logout appelée');
    this.isDropdownOpen = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    this.notificationService.success('Déconnexion réussie');
    this.router.navigate(['/login']);
  }

  async loadPlans(): Promise<void> {
    try {
      console.log('DEBUG: Calling PlanService.getPlans() to load from database');
      const response: any = await this.planService.getPlans().toPromise();
      console.log('DEBUG: API response:', response);

      // Vérifier différents formats de réponse de l'API
      let plansData = null;
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        plansData = response.data;
      } else if (
        response &&
        response.plans &&
        Array.isArray(response.plans) &&
        response.plans.length > 0
      ) {
        plansData = response.plans;
      } else if (response && Array.isArray(response) && response.length > 0) {
        plansData = response;
      }

      if (plansData) {
        this.plans = plansData;
        console.log('DEBUG: Plans loaded successfully from database:', this.plans);
      } else {
        console.log('DEBUG: No plans found in database, using mock data');
        this.plans = this.getMockPlans();
      }
    } catch (error) {
      console.error('ERROR: Failed to load plans from database, using mock data:', error);
      this.plans = this.getMockPlans();
    } finally {
      this.loading = false;
    }
  }

  private getMockPlans(): any[] {
    return [
      {
        _id: 'plan-1',
        name: 'Starter',
        description: 'Parfait pour débuter avec les fonctionnalités de base',
        price: 9.99,
        type: 'Mensuel',
        billingCycle: 'MONTHLY',
        features: [
          'Accès aux fonctionnalités de base',
          'Support par email',
          '1 GB de stockage',
          "Jusqu'à 1000 utilisateurs",
        ],
        isActive: true,
        isPopular: false,
      },
      {
        _id: 'plan-1-yearly',
        name: 'Starter',
        description: 'Parfait pour débuter avec les fonctionnalités de base',
        price: 99.99,
        type: 'Annuel',
        billingCycle: 'YEARLY',
        features: [
          'Accès aux fonctionnalités de base',
          'Support par email',
          '1 GB de stockage',
          "Jusqu'à 1000 utilisateurs",
        ],
        isActive: true,
        isPopular: false,
      },
      {
        _id: 'plan-2',
        name: 'Professional',
        description: 'Pour les équipes qui ont besoin de fonctionnalités avancées',
        price: 29.99,
        type: 'Mensuel',
        billingCycle: 'MONTHLY',
        features: [
          'Toutes les fonctionnalités Starter',
          'Support prioritaire',
          '10 GB de stockage',
          "Jusqu'à 10 000 utilisateurs",
          'Analytiques avancées',
        ],
        isActive: true,
        isPopular: true,
      },
      {
        _id: 'plan-2-yearly',
        name: 'Professional',
        description: 'Pour les équipes qui ont besoin de fonctionnalités avancées',
        price: 299.99,
        type: 'Annuel',
        billingCycle: 'YEARLY',
        features: [
          'Toutes les fonctionnalités Starter',
          'Support prioritaire',
          '10 GB de stockage',
          "Jusqu'à 10 000 utilisateurs",
          'Analytiques avancées',
        ],
        isActive: true,
        isPopular: true,
      },
      {
        _id: 'plan-3',
        name: 'Enterprise',
        description: 'Solution complète pour les grandes entreprises',
        price: 99.99,
        type: 'Mensuel',
        billingCycle: 'MONTHLY',
        features: [
          'Toutes les fonctionnalités Professional',
          'Support 24/7',
          'Stockage illimité',
          'Utilisateurs illimités',
          'Intégrations personnalisées',
          'Gestionnaire de compte dédié',
        ],
        isActive: true,
        isPopular: false,
      },
      {
        _id: 'plan-3-yearly',
        name: 'Enterprise',
        description: 'Solution complète pour les grandes entreprises',
        price: 999.99,
        type: 'Annuel',
        billingCycle: 'YEARLY',
        features: [
          'Toutes les fonctionnalités Professional',
          'Support 24/7',
          'Stockage illimité',
          'Utilisateurs illimités',
          'Intégrations personnalisées',
          'Gestionnaire de compte dédié',
        ],
        isActive: true,
        isPopular: false,
      },
    ];
  }

  getFilteredPlans(): Plan[] {
    console.log('DEBUG: getFilteredPlans called');
    console.log('DEBUG: selectedBillingCycle:', this.selectedBillingCycle);
    console.log('DEBUG: all plans:', this.plans);

    const filtered = this.plans.filter((plan) => {
      console.log(`DEBUG: Plan ${plan.name} has billingCycle: ${plan.billingCycle}`);
      return plan.billingCycle === this.selectedBillingCycle;
    });
    console.log('DEBUG: filtered plans:', filtered);

    return filtered;
  }

  selectPlan(plan: Plan): void {
    // Navigate to subscription creation with selected plan
    this.router.navigate(['/subscriptions/checkout'], {
      queryParams: {
        planId: plan._id,
        billingCycle: this.selectedBillingCycle,
      },
    });
  }

  getFeaturesList(plan: Plan): string[] {
    if (plan.includedFeatures && plan.includedFeatures.length > 0) {
      return plan.includedFeatures;
    }

    // Fallback to features object
    if (plan.features) {
      return Object.keys(plan.features)
        .map((key) => {
          const value = plan.features[key];
          if (typeof value === 'boolean') {
            return value ? key : '';
          }
          return `${key}: ${value}`;
        })
        .filter((feature) => feature !== '');
    }

    return [];
  }

  getLimitDisplay(plan: Plan, limitKey: string): string {
    if (!plan.limits || !plan.limits[limitKey]) {
      return 'Unlimited';
    }

    const limit = plan.limits[limitKey];
    if (limit === -1 || limit === 0) {
      return 'Unlimited';
    }

    return limit.toString();
  }

  getPriceDisplay(plan: Plan): string {
    const symbol = plan.currencyId?.symbol || '$';
    return `${symbol}${plan.price}`;
  }

  getYearlyDiscount(plan: Plan): number | null {
    if (this.selectedBillingCycle !== 'YEARLY') return null;

    const monthlyPlan = this.plans.find(
      (p) => p.name === plan.name && p.billingCycle === 'MONTHLY',
    );

    if (!monthlyPlan) return null;

    const yearlyTotal = plan.price;
    const monthlyTotal = monthlyPlan.price * 12;
    const savings = monthlyTotal - yearlyTotal;

    return Math.round((savings / monthlyTotal) * 100);
  }

  onBillingCycleChange(): void {
    // Refresh the view when billing cycle changes
  }

  private mapBillingCycle(value: string): string {
    // Map various billing cycle formats to standardized values
    const lowerValue = (value || '').toLowerCase();
    if (
      lowerValue.includes('mensuel') ||
      lowerValue.includes('month') ||
      lowerValue === 'monthly'
    ) {
      return 'MONTHLY';
    }
    if (lowerValue.includes('annuel') || lowerValue.includes('year') || lowerValue === 'yearly') {
      return 'YEARLY';
    }
    // Default to monthly
    return 'MONTHLY';
  }
}
