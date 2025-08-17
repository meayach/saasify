import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PaymentMethodListComponent } from './components/payment-method-list/payment-method-list.component';
import { PaymentMethodCreateComponent } from './components/payment-method-create/payment-method-create.component';
import { PaymentMethodEditComponent } from './components/payment-method-edit/payment-method-edit.component';

@NgModule({
  declarations: [
    PaymentMethodListComponent,
    PaymentMethodCreateComponent,
    PaymentMethodEditComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: PaymentMethodListComponent },
      { path: 'create', component: PaymentMethodCreateComponent },
      { path: 'edit/:id', component: PaymentMethodEditComponent },
    ]),
  ],
})
export class PaymentModule {}
