import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Plan {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  maxUsers: number;
  maxApps: number;
  status: 'active' | 'inactive';
  isPopular: boolean;
  createdDate: Date;
}

@Component({
  selector: 'app-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.css'],
})
export class PlanListComponent implements OnInit {
  plans: Plan[] = [];
  loading = false;
  // billingCycle controls pricing display and annual styling. Keep default as monthly so monthly cards stay white.
  billingCycle: 'monthly' | 'yearly' = 'monthly';

  // Statistiques
  stats = {
    totalPlans: 0,
    activePlans: 0,
    subscriptions: 0,
    revenue: 0,
  };

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;

    // Simuler le chargement des données
    setTimeout(() => {
      this.plans = [
        {
          id: 'plan-1',
          name: 'Gratuit',
          description: 'Parfait pour commencer et tester notre plateforme',
          price: 0,
          currency: 'EUR',
          features: [
            '1 application SaaS',
            '100 utilisateurs max',
            'Support par email',
            'Tableau de bord basique',
          ],
          maxUsers: 100,
          maxApps: 1,
          status: 'active',
          isPopular: false,
          createdDate: new Date('2023-01-01'),
        },
        {
          id: 'plan-2',
          name: 'Pro',
          description: 'Idéal pour les entreprises en croissance',
          price: 29.99,
          currency: 'EUR',
          features: [
            '5 applications SaaS',
            '1000 utilisateurs max',
            'Support prioritaire',
            'Analyses avancées',
            'API complète',
            'Intégrations tierces',
          ],
          maxUsers: 1000,
          maxApps: 5,
          status: 'active',
          isPopular: true,
          createdDate: new Date('2023-01-01'),
        },
        {
          id: 'plan-3',
          name: 'Enterprise',
          description: 'Solution complète pour les grandes entreprises',
          price: 99.99,
          currency: 'EUR',
          features: [
            'Applications illimitées',
            'Utilisateurs illimités',
            'Support 24/7',
            'Déploiement sur site',
            'SLA garanti',
            'Manager dédié',
          ],
          maxUsers: -1, // Illimité
          maxApps: -1, // Illimité
          status: 'active',
          isPopular: false,
          createdDate: new Date('2023-01-01'),
        },
      ];

      this.updateStats();
      this.loading = false;
    }, 1000);
  }

  updateStats(): void {
    this.stats.totalPlans = this.plans.length;
    this.stats.activePlans = this.plans.filter((p) => p.status === 'active').length;
    this.stats.subscriptions = 245; // Données simulées
    this.stats.revenue = 12450; // Données simulées
  }

  onCreatePlan(): void {
    this.router.navigate(['/subscriptions', 'plans', 'create']);
  }

  onEditPlan(plan: Plan): void {
    // some plans come from API with `_id` while others use `id` (mock data).
    const planId = (plan as any)._id || plan.id;
    this.router.navigate(['/subscriptions', 'plans', 'edit', planId]);
  }

  onToggleStatus(plan: Plan): void {
    plan.status = plan.status === 'active' ? 'inactive' : 'active';
    console.log(`Plan ${plan.name} ${plan.status === 'active' ? 'activé' : 'désactivé'}`);
    this.updateStats();
  }

  onDeletePlan(plan: Plan): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le plan "${plan.name}" ?`)) {
      this.plans = this.plans.filter((p) => p.id !== plan.id);
      this.updateStats();
      console.log('Plan supprimé:', plan.name);
    }
  }

  onViewSubscriptions(plan: Plan): void {
    console.log('Voir les abonnements pour:', plan.name);
    // Naviguer vers la liste des abonnements pour ce plan
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getPriceDisplay(plan: Plan): string {
    if (plan.price === 0) {
      return 'Gratuit';
    }
    return `${plan.price}€/mois`;
  }

  getMaxUsersDisplay(maxUsers: number): string {
    return maxUsers === -1 ? 'Illimité' : maxUsers.toString();
  }

  getMaxAppsDisplay(maxApps: number): string {
    return maxApps === -1 ? 'Illimité' : maxApps.toString();
  }

  // Return true for plans that should use the Business visual style
  isBusinessLike(plan: Plan): boolean {
    if (!plan || !plan.name) {
      return false;
    }
    const name = plan.name.toLowerCase();
    return ['business', 'essentiel', 'pro', 'plus'].includes(name);
  }
}
