import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SubscriptionsRoutingModule } from './subscriptions-routing.module';
import { SubscriptionDashboardComponent } from './components/subscription-dashboard/subscription-dashboard.component';
import { PlanSelectionComponent } from './components/plan-selection/plan-selection.component';
import { SubscriptionDetailsComponent } from './components/subscription-details/subscription-details.component';
import { PaymentMethodComponent } from './components/payment-method/payment-method.component';
import { BillingHistoryComponent } from './components/billing-history/billing-history.component';
import { SharedModule } from '../../@shared/shared.module';

@NgModule({
  declarations: [
    SubscriptionDashboardComponent,
    PlanSelectionComponent,
    SubscriptionDetailsComponent,
    PaymentMethodComponent,
    BillingHistoryComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SubscriptionsRoutingModule,
    SharedModule,
  ],
})
export class SubscriptionsModule {}
