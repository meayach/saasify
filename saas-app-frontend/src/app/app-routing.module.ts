import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './@shared/signup/components/signup.component';
import { LoginComponent } from './@shared/login/components/login.component';
import { DashboardComponent } from './@shared/dashboard/components/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'customer/dashboard', component: DashboardComponent },
  { path: 'admin/dashboard', component: DashboardComponent },
  { path: 'manager/dashboard', component: DashboardComponent },
  { path: 'customer-admin', component: DashboardComponent },
  { path: 'customer-manager', component: DashboardComponent },
  { path: 'customer-developer', component: DashboardComponent },
  // Nouvelles routes pour les fonctionnalités
  {
    path: 'applications',
    loadChildren: () =>
      import('./@features/applications/applications.module').then((m) => m.ApplicationsModule),
  },
  { path: 'subscriptions', component: DashboardComponent },
  { path: 'analytics', component: DashboardComponent },
  { path: 'settings', component: DashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
