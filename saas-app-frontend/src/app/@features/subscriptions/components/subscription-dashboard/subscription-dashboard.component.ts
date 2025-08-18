import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, UserProfile } from '../../../../@shared/services/user.service';
import { NotificationService } from '../../../../@shared/services/notification.service';

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

  constructor(
    public router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    // Mock data for testing - Simulation d'abonnements
    this.createMockSubscriptions();
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
              ? 'Customer Admin'
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
  }

  // Créer des abonnements de test
  createMockSubscriptions(): void {
    // Simulation d'offres disponibles
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
    console.log('Cancel subscription:', subscriptionId);
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
  loadSubscriptions(): void {
    this.loading = true;
    this.error = null;
    // Simulation du chargement des abonnements
    setTimeout(() => {
      this.loading = false;
      // Les données sont déjà créées dans createMockSubscriptions()
      console.log('Abonnements chargés:', this.subscriptions);
    }, 1000);
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
}
