import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { UserTeamListComponent } from './components/user-team-list/user-team-list.component';
import { UserTeamCreateComponent } from './components/user-team-create/user-team-create.component';
import { UserTeamEditComponent } from './components/user-team-edit/user-team-edit.component';
import { SharedModule } from '../../@shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: UserTeamListComponent,
  },
  {
    path: 'new',
    component: UserTeamCreateComponent,
  },
  {
    path: 'edit/:id',
    component: UserTeamEditComponent,
  },
];

@NgModule({
  declarations: [UserTeamListComponent, UserTeamCreateComponent, UserTeamEditComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  exports: [UserTeamListComponent, UserTeamCreateComponent, UserTeamEditComponent],
})
export class UserModule {}
