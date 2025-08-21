import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService } from '../../services/plan.service';
import { SubscriptionService } from '../../services/subscription.service';
import { UserService, UserProfile } from '../../../../@shared/services/user.service';
import { NotificationService } from '../../../../@shared/services/notification.service';
import { BillingService, Plan } from '../../../../@shared/services/billing.service';

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
  selectedBillingCycle = 'month';
  billingCycles = [
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' },
  ];
  // Header user dropdown properties
  userName = 'Utilisateur';
  userEmail = '';
  userRole = '';
  isDropdownOpen = false;
  activeProfileSection = '';

  constructor(
    private planService: PlanService,
    private billingService: BillingService,
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

    // Utiliser la même logique que dans dashboard.component.ts pour charger les plans
    console.log('Chargement des plans avec BillingService...');
    this.loadPlans();
  }

  // Même méthode que dans dashboard.component.ts pour charger les plans
  loadPlans(): void {
    this.loadingPlans = true;
    this.billingService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.loadingPlans = false;
        console.log('✅ Plans chargés:', plans.length, 'plans trouvés');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des plans:', error);
        this.loadingPlans = false;
        // Créer des plans par défaut si aucun n'existe (même logique que dashboard.component.ts)
        this.plans = [
          {
            name: 'Plan Starter',
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
        console.log('📝 Plans par défaut créés');
      },
    });
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

  // Méthodes pour le filtrage et affichage des plans
  getFilteredPlans(): Plan[] {
    return this.plans.filter((plan) => plan.interval === this.selectedBillingCycle);
  }

  getPlanFeatures(plan: Plan): string[] {
    return plan.features || [];
  }

  formatPrice(plan: Plan): string {
    return `€${plan.price.toFixed(2)}`;
  }

  selectPlan(plan: Plan): void {
    console.log('Plan sélectionné:', plan);
    this.notificationService.success(`Plan ${plan.name} sélectionné !`);
    // Ici vous pouvez ajouter la logique pour souscrire au plan
  }

  // Méthodes utilitaires
  changeBillingCycle(cycle: string): void {
    this.selectedBillingCycle = cycle;
  }

  onBillingCycleChange(): void {
    // Actualiser la vue lorsque le cycle de facturation change
    console.log('Cycle de facturation changé vers:', this.selectedBillingCycle);
  }
}
