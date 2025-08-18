import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionDashboardComponent } from './components/subscription-dashboard/subscription-dashboard.component';
import { PlanSelectionComponent } from './components/plan-selection/plan-selection.component';
import { SubscriptionDetailsComponent } from './components/subscription-details/subscription-details.component';
import { PaymentMethodComponent } from './components/payment-method/payment-method.component';
import { BillingHistoryComponent } from './components/billing-history/billing-history.component';

const routes: Routes = [
  { path: '', component: SubscriptionDashboardComponent },
  { path: 'plans', component: PlanSelectionComponent },
  { path: 'details/:id', component: SubscriptionDetailsComponent },
  { path: 'payment-methods', component: PaymentMethodComponent },
  { path: 'billing-history', component: BillingHistoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubscriptionsRoutingModule {}
