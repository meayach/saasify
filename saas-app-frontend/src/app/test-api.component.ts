import { Component } from '@angular/core';
import { ApplicationService } from './@shared/services/application.service';
import { ApplicationConfigurationService } from './@shared/services/application-configuration.service';
import { NotificationService } from './@shared/services/notification.service';

@Component({
  selector: 'app-test-api',
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>🧪 Test API Backend</h2>

      <div style="margin: 20px 0;">
        <button
          (click)="testGetApplications()"
          style="padding: 10px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          📄 Tester GET Applications
        </button>

        <button
          (click)="testCreateApplication()"
          style="padding: 10px; margin: 5px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
          ➕ Tester Création Application
        </button>

        <button
          (click)="testCreateConfiguration()"
          style="padding: 10px; margin: 5px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Tester Création Configuration
        </button>
      </div>

      <div style="margin: 20px 0;" *ngIf="results.length > 0">
        <h3>📊 Résultats:</h3>
        <div
          *ngFor="let result of results"
          [style.color]="result.type === 'success' ? 'green' : 'red'"
          style="margin: 5px 0; padding: 10px; border-left: 4px solid; border-color: currentColor; background: #f8f9fa;">
          <strong>{{ result.timestamp }}:</strong> {{ result.message }}
        </div>
      </div>
    </div>
  `,
})
export class TestApiComponent {
  results: any[] = [];
  lastCreatedAppId: string | null = null;

  constructor(
    private applicationService: ApplicationService,
    private configService: ApplicationConfigurationService,
    private notificationService: NotificationService,
  ) {}

  addResult(message: string, type: 'success' | 'error' = 'success'): void {
    this.results.push({
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  testGetApplications(): void {
    this.addResult('🔄 Test récupération applications...');

    this.applicationService.getApplications().subscribe({
      next: (apps) => {
        this.addResult(`✅ ${apps.length} applications récupérées depuis la base de données`);
        if (apps.length > 0) {
          this.addResult(`📋 Première app: "${apps[0].name}" (ID: ${apps[0]._id})`);
        }
        this.notificationService.success(
          `${apps.length} applications chargées avec succès !`,
          'Base de données connectée',
        );
      },
      error: (error) => {
        this.addResult(`❌ Erreur GET applications: ${error.message}`, 'error');
        this.notificationService.error('Erreur de connexion à la base de données', 'Erreur API');
      },
    });
  }

  testCreateApplication(): void {
    this.addResult('🔄 Test création application...');

    const newApp = {
      name: `Test App ${Date.now()}`,
      description: 'Application créée via test frontend',
      status: 'active' as const,
    };

    this.applicationService.createApplication(newApp).subscribe({
      next: (createdApp) => {
        this.lastCreatedAppId = createdApp._id!;
        this.addResult(`✅ Application créée: "${createdApp.name}" (ID: ${createdApp._id})`);
        this.notificationService.success(
          `Application "${createdApp.name}" créée avec succès !`,
          'Création réussie',
        );
      },
      error: (error) => {
        this.addResult(`❌ Erreur création application: ${error.message}`, 'error');
        this.notificationService.error('Erreur lors de la création', 'Erreur API');
      },
    });
  }

  testCreateConfiguration(): void {
    if (!this.lastCreatedAppId) {
      this.addResult("⚠️ Créez d'abord une application", 'error');
      return;
    }

    this.addResult('🔄 Test création configuration...');

    const config = {
      applicationId: this.lastCreatedAppId,
      applicationName: `Config pour ${this.lastCreatedAppId}`,
      domainName: `app-${Date.now()}.saasify.com`,
      isActive: true,
      paymentMethods: { paypal: true, wize: false, payonner: false },
    };

    this.configService.saveConfiguration(config).subscribe({
      next: (savedConfig) => {
        this.addResult(`✅ Configuration créée: "${savedConfig.applicationName}"`);
        this.addResult(`🌐 Domaine: ${savedConfig.domainName}`);
        this.notificationService.success(
          'Configuration sauvegardée avec succès !',
          'Configuration créée',
        );
      },
      error: (error) => {
        this.addResult(`❌ Erreur création configuration: ${error.message}`, 'error');
        this.notificationService.error('Erreur lors de la configuration', 'Erreur API');
      },
    });
  }
}
