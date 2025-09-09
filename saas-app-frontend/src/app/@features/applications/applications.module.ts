import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ApplicationCreateComponent } from './components/application-create/application-create.component';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { ApplicationEditComponent } from './components/application-edit/application-edit.component';
import { ApplicationConfigureComponent } from './components/application-configure/application-configure.component';
import { ApplicationNewComponent } from './components/application-new/application-new.component';
import { FeatureValuesConfigComponent } from './components/feature-values-config/feature-values-config.component';
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
    path: 'create-new',
    component: ApplicationNewComponent,
  },
  {
    path: 'edit/:id',
    component: ApplicationEditComponent,
  },
  {
    path: 'configure/:id',
    component: ApplicationConfigureComponent,
  },
];

@NgModule({
  declarations: [
    ApplicationCreateComponent,
    ApplicationListComponent,
    ApplicationEditComponent,
    ApplicationConfigureComponent,
    ApplicationNewComponent,
    FeatureValuesConfigComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes), SharedModule],
  exports: [
    ApplicationCreateComponent,
    ApplicationListComponent,
    ApplicationEditComponent,
    ApplicationConfigureComponent,
    ApplicationNewComponent,
    FeatureValuesConfigComponent,
  ],
})
export class ApplicationsModule {}
