import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// NgRx
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Keycloak
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

// Local modules
import { CoreModule } from './@core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupModule } from './@shared/signup/signup.module';
import { LoginModule } from './@shared/login/login.module';
import { DashboardModule } from './@shared/dashboard/dashboard.module';
import { TestNotificationComponent } from './test-notification.component';
import { TestApiComponent } from './test-api.component';
import { SharedModule } from './@shared/shared.module';

// Store
import { appReducers } from './@store/app.reducer';
import { AppEffects } from './@store/app.effects';

// Environment
import { environment } from '../environments/environment';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'saas-platform',
        clientId: 'saas-frontend',
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
      },
    });
}

@NgModule({
  declarations: [AppComponent, TestNotificationComponent, TestApiComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,

    // NgRx
    StoreModule.forRoot(appReducers),
    EffectsModule.forRoot([AppEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),

    // PrimeNG
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MenubarModule,
    CardModule,
    TableModule,
    DialogModule,
    DropdownModule,
    ToastModule,

    // Keycloak
    KeycloakAngularModule,

    // Custom modules
    SharedModule,
    SignupModule,
    LoginModule,
    DashboardModule,
  ],
  providers: [
    MessageService,
    {
      provide: 'APP_INIT',
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
