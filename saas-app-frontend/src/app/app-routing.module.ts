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
  {
    path: 'subscriptions',
    loadChildren: () => import('./@features/subscriptions').then((m) => m.SubscriptionsModule),
  },
  // Mount Plans module under /subscriptions/plans
  {
    path: 'subscriptions/plans',
    loadChildren: () => import('./@features/plans/plans.module').then((m) => m.PlansModule),
  },
  {
    path: 'user-management',
    loadChildren: () =>
      import('./@features/user-management/user-management.module').then(
        (m) => m.UserManagementModule,
      ),
  },
  { path: 'settings', component: DashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
