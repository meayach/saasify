import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../@shared/shared.module';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { PlanCreateComponent } from './components/plan-create/plan-create.component';
import { PlanEditComponent } from './components/plan-edit/plan-edit.component';

@NgModule({
  declarations: [PlanListComponent, PlanCreateComponent, PlanEditComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: PlanListComponent },
      { path: 'create', component: PlanCreateComponent },
      { path: 'edit/:id', component: PlanEditComponent },
    ]),
  ],
})
export class PlansModule {}
