import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ApplicationCreateComponent } from './components/application-create/application-create.component';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { ApplicationEditComponent } from './components/application-edit/application-edit.component';
import { SharedModule } from '../../@shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: ApplicationListComponent,
  },
  {
    path: 'new',
    component: ApplicationCreateComponent,
  },
  {
    path: 'edit/:id',
    component: ApplicationEditComponent,
  },
];

@NgModule({
  declarations: [ApplicationCreateComponent, ApplicationListComponent, ApplicationEditComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes), SharedModule],
  exports: [ApplicationCreateComponent, ApplicationListComponent, ApplicationEditComponent],
})
export class ApplicationsModule {}
