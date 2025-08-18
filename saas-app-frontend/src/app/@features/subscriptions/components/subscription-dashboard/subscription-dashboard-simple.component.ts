import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Mock data for testing
    this.subscriptions = [];
    this.availablePlans = [];
  }

  onSelectPlan(planId: string): void {
    console.log('Selected plan:', planId);
  }

  onUpgradePlan(): void {
    this.router.navigate(['/subscriptions/plans']);
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
}
