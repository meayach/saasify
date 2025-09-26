import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from '../../../../@core/services/theme.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UserService, UserProfile } from '../../../../@shared/services/user.service';
import { BillingStateService } from '../../../../@shared/services/billing-state.service';
import { NotificationService } from '../../../../@shared/services/notification.service';
import { SubscriptionService } from '../../services/subscription.service';
import { PlanService } from '../../services/plan.service';

@Component({
  selector: 'app-subscription-dashboard',
  templateUrl: './subscription-dashboard.component.html',
  styleUrls: ['./subscription-dashboard.component.css'],
})
export class SubscriptionDashboardComponent implements OnInit {
  subscriptions: any[] = [];
  availablePlans: any[] = [];
  currentSubscription: any = null;
  loading = false;
  error: string | null = null;

  // Header user dropdown properties (will be loaded from UserService)
  userName = 'Utilisateur';
  userEmail = '';
  userRole = '';
  isDropdownOpen = false;
  activeProfileSection = ''; // 'edit' | 'password'
  isDarkMode = false;
  private themeSubscription: Subscription | null = null;
  currentCurrency = 'EUR';
  private billingSubscription: Subscription | null = null;

  constructor(
    public router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
    private subscriptionService: SubscriptionService,
    private planService: PlanService,
    private datePipe: DatePipe,
    private billingState: BillingStateService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.loadAvailablePlans();
    this.loadSubscriptions();

    // Load current user profile for header
    this.userService.getCurrentUserProfile().subscribe({
      next: (profile: UserProfile) => {
        if (profile) {
          this.userName =
            `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || this.userName;
          this.userEmail = profile.email || this.userEmail;
          // Map role like in dashboard component
          this.userRole =
            profile.role === 'admin'
              ? 'Admin'
              : profile.role === 'manager'
              ? 'Customer Manager'
              : profile.role || 'Customer User';
        }
      },
      error: () => {
        // fallback: try to read from localStorage if available
        try {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          console.log('DEBUG currentUser from localStorage:', currentUser);
          if (currentUser) {
            // Support multiple possible shapes for stored user
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
            // Map role like in dashboard component
            this.userRole =
              currentUser.role === 'admin'
                ? 'Admin'
                : currentUser.role === 'manager'
                ? 'Customer Manager'
                : currentUser.role || currentUser.userRole || 'Customer User';
          }
        } catch (e) {
          // ignore
        }
      },
    });

    this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });

    // Subscribe to billing settings for currency
    this.billingSubscription = this.billingState.settings$.subscribe((s) => {
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

  // Créer des abonnements de test
  createMockSubscriptions(): void {
    // Ensure we have mock plans
    if (this.availablePlans.length === 0) {
      this.createMockPlans();
    }

    // Simulation d'un abonnement actif
    this.currentSubscription = {
      _id: 'sub-123',
      planId: this.availablePlans[1], // Professional plan
      status: 'ACTIVE',
      price: 29.99,
      billingCycle: 'monthly',
      startDate: new Date('2024-01-15'),
      nextBillingDate: new Date('2025-09-15'),
      trialEndDate: null,
    };

    // Simulation d'un historique d'abonnements
    this.subscriptions = [
      this.currentSubscription,
      {
        _id: 'sub-122',
        planId: this.availablePlans[0], // Starter plan
        status: 'CANCELLED',
        price: 9.99,
        billingCycle: 'monthly',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-12-31'),
      },
    ];
  }

  onSelectPlan(planId: string): void {
    console.log('Selected plan:', planId);
  }

  onUpgradePlan(): void {
    console.log('DEBUG: onUpgradePlan, availablePlans:', this.availablePlans);
    // Passer les plans disponibles au module de sélection via l'état de navigation
    this.router.navigate(['/subscriptions/plans'], { state: { plans: this.availablePlans } });
  }

  onCancelSubscription(subscriptionId: string): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) {
      this.subscriptionService.cancelSubscription(subscriptionId).subscribe({
        next: (response) => {
          this.notificationService.success('Abonnement annulé avec succès');
          this.loadSubscriptions(); // Reload data
        },
        error: (error) => {
          console.error("Erreur lors de l'annulation:", error);
          this.notificationService.error("Erreur lors de l'annulation de l'abonnement");
        },
      });
    }
  }

  onCreateSubscription(planId: string, billingCycle: string = 'monthly'): void {
    const dto = {
      planId,
      billingCycle,
    };

    this.subscriptionService.createSubscription(dto).subscribe({
      next: (response) => {
        this.notificationService.success('Abonnement créé avec succès');
        this.loadSubscriptions(); // Reload data
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        this.notificationService.error("Erreur lors de la création de l'abonnement");
      },
    });
  }

  onViewDetails(subscriptionId: string): void {
    this.router.navigate(['/subscriptions/details', subscriptionId]);
  }

  onManagePaymentMethods(): void {
    this.router.navigate(['/subscriptions/payment-methods']);
  }

  onViewBillingHistory(): void {
    this.router.navigate(['/subscriptions/billing-history']);
  }

  // Methods used in template
  loadAvailablePlans(): void {
    this.planService.getPlans().subscribe({
      next: (response) => {
        this.availablePlans = response.data || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des plans:', error);
        this.createMockPlans(); // Fallback to mock data
      },
    });
  }

  loadSubscriptions(): void {
    this.loading = true;
    this.error = null;

    this.subscriptionService.getMySubscriptions().subscribe({
      next: (response) => {
        this.loading = false;
        this.subscriptions = response.data || [];
        this.currentSubscription = this.subscriptions.find(
          (sub) => sub.status === 'ACTIVE' || sub.status === 'TRIAL',
        );
        console.log('Abonnements chargés:', this.subscriptions);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors du chargement des abonnements:', error);

        if (error.status === 0) {
          this.error =
            'Impossible de se connecter au serveur. Vérifiez votre connexion ou contactez le support.';
        } else if (error.status === 401) {
          this.error = 'Session expirée. Veuillez vous reconnecter.';
        } else {
          this.error = 'Impossible de charger vos abonnements. Réessayez plus tard.';
        }

        // Fallback to mock data for development
        this.createMockSubscriptions();
      },
    });
  }

  createMockPlans(): void {
    this.availablePlans = [
      {
        _id: 'plan-1',
        name: 'Starter',
        description: 'Parfait pour débuter avec les fonctionnalités de base',
        price: 9.99,
        type: 'Mensuel',
        features: ['5 projets', 'Support email', '1 GB stockage'],
      },
      {
        _id: 'plan-2',
        name: 'Professional',
        description: 'Pour les équipes qui ont besoin de fonctionnalités avancées',
        price: 29.99,
        type: 'Mensuel',
        features: ['50 projets', 'Support prioritaire', '10 GB stockage', 'Analytics'],
      },
      {
        _id: 'plan-3',
        name: 'Enterprise',
        description: 'Solution complète pour les grandes entreprises',
        price: 99.99,
        type: 'Mensuel',
        features: ['Projets illimités', 'Support 24/7', '100 GB stockage', 'API avancée'],
      },
    ];
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'status-active';
      case 'INACTIVE':
        return 'status-inactive';
      case 'EXPIRED':
        return 'status-expired';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'TRIAL':
        return 'status-trial';
      default:
        return 'status-unknown';
    }
  }

  formatStatus(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'Actif';
      case 'INACTIVE':
        return 'Inactif';
      case 'EXPIRED':
        return 'Expiré';
      case 'CANCELLED':
        return 'Annulé';
      case 'TRIAL':
        return "Période d'essai";
      default:
        return 'Inconnu';
    }
  }

  isTrialExpiringSoon(subscription: any): boolean {
    if (!subscription || subscription.status !== 'TRIAL' || !subscription.trialEndDate) {
      return false;
    }
    const trialEnd = new Date(subscription.trialEndDate);
    const now = new Date();
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 7 && daysRemaining > 0;
  }

  navigateToPlans(): void {
    console.log('=== navigateToPlans appelée');
    console.log('DEBUG: availablePlans to pass:', this.availablePlans);
    // Passer les plans disponibles au module de sélection pour affichage immédiat
    this.router.navigate(['/subscriptions/plans'], { state: { plans: this.availablePlans } });
  }

  getDaysUntilBilling(subscription: any): number {
    if (!subscription?.nextBillingDate) {
      return 0;
    }
    const billingDate = new Date(subscription.nextBillingDate);
    const now = new Date();
    return Math.ceil((billingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  navigateToDetails(subscriptionId: string): void {
    console.log('=== navigateToDetails appelée avec subscriptionId:', subscriptionId);
    this.router.navigate(['/subscriptions/details', subscriptionId]);
  }

  cancelSubscription(subscription: any): void {
    if (confirm('Voulez-vous vraiment annuler cet abonnement ?')) {
      console.log("Annulation de l'abonnement :", subscription);
      // TODO: Implémenter la logique d'annulation réelle
    }
  }

  navigateToPaymentMethods(): void {
    console.log('=== navigateToPaymentMethods appelée');
    this.router.navigate(['/subscriptions/payment-methods']);
  }

  navigateToBillingHistory(): void {
    console.log('=== navigateToBillingHistory appelée');
    this.router.navigate(['/subscriptions/billing-history']);
  }

  // Créer un nouvel abonnement (simulation)
  createSubscription(planId: string): void {
    console.log('=== createSubscription appelée avec planId:', planId);
    const selectedPlan = this.availablePlans.find((plan) => plan._id === planId);
    if (!selectedPlan) {
      console.error('Plan non trouvé:', planId);
      return;
    }

    if (this.currentSubscription && this.currentSubscription.status === 'ACTIVE') {
      if (confirm('Vous avez déjà un abonnement actif. Voulez-vous le remplacer ?')) {
        // Annuler l'abonnement actuel
        this.currentSubscription.status = 'CANCELLED';
        this.currentSubscription.endDate = new Date();
      } else {
        return;
      }
    }

    // Créer le nouvel abonnement
    const newSubscription = {
      _id: 'sub-' + Date.now(),
      planId: selectedPlan,
      status: 'ACTIVE',
      price: selectedPlan.price,
      billingCycle: 'monthly',
      startDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
      trialEndDate: null,
    };

    this.currentSubscription = newSubscription;

    // Ajouter à l'historique
    this.subscriptions.unshift(newSubscription);

    console.log('Nouvel abonnement créé:', newSubscription);
    alert(`Abonnement ${selectedPlan.name} créé avec succès !`);
  }

  // Méthode pour faciliter la création d'abonnement depuis les cartes d'actions
  subscribeToStarter(): void {
    this.createSubscription('plan-1');
  }

  subscribeToProfessional(): void {
    this.createSubscription('plan-2');
  }

  subscribeToEnterprise(): void {
    this.createSubscription('plan-3');
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

    // Redirection immédiate selon la section
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

    // Nettoyage et redirection immédiate
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');

    this.notificationService.success('Déconnexion réussie');
    this.router.navigate(['/login']);
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'short') || '';
  }
}
