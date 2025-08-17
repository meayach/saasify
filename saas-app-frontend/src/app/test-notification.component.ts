import { Component, OnInit } from '@angular/core';
import { NotificationService } from './@shared/services/notification.service';

@Component({
  selector: 'app-test-notification',
  template: `
    <div class="test-container">
      <h1>🔔 Test Notification SAASIFY</h1>
      <p>Version simplifiée garantie fonctionnelle</p>

      <div class="buttons">
        <button class="btn btn-success" (click)="testSuccess()">✅ Test Succès</button>
        <button class="btn btn-error" (click)="testError()">❌ Test Erreur</button>
        <button class="btn btn-warning" (click)="testWarning()">⚠️ Test Attention</button>
        <button class="btn btn-info" (click)="testInfo()">ℹ️ Test Info</button>
      </div>

      <div class="form-section">
        <h2>Test Configuration</h2>
        <form (ngSubmit)="saveConfiguration()">
          <input
            type="text"
            [(ngModel)]="appName"
            placeholder="Nom de l'application"
            class="form-input" />
          <button type="submit" class="btn btn-primary">💾 Sauvegarder Configuration</button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .test-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      h1 {
        color: #1f2937;
        text-align: center;
        margin-bottom: 0.5rem;
      }

      p {
        color: #6b7280;
        text-align: center;
        margin-bottom: 2rem;
      }

      .buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .btn {
        padding: 1rem;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      }

      .btn:hover {
        transform: translateY(-2px);
      }

      .btn-success {
        background: #4caf50;
        color: white;
      }

      .btn-error {
        background: #f44336;
        color: white;
      }

      .btn-warning {
        background: #ff9800;
        color: white;
      }

      .btn-info {
        background: #2196f3;
        color: white;
      }

      .btn-primary {
        background: #3b82f6;
        color: white;
        width: 100%;
        margin-top: 1rem;
      }

      .form-section {
        background: #f9fafb;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-top: 2rem;
      }

      .form-section h2 {
        margin-bottom: 1rem;
        color: #1f2937;
      }

      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.5rem;
        font-size: 1rem;
      }

      .form-input:focus {
        outline: none;
        border-color: #3b82f6;
      }
    `,
  ],
})
export class TestNotificationComponent implements OnInit {
  appName: string = 'Mon Application Test';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Notification de bienvenue
    setTimeout(() => {
      this.notificationService.info(
        'Page de test chargée. Testez les notifications ci-dessous.',
        '👋 Bienvenue',
      );
    }, 500);
  }

  testSuccess(): void {
    this.notificationService.success('Configuration sauvegardée avec succès !', '✅ Succès');
  }

  testError(): void {
    this.notificationService.error('Une erreur est survenue lors de la sauvegarde.', '❌ Erreur');
  }

  testWarning(): void {
    this.notificationService.warning('Attention : certains champs sont manquants.', '⚠️ Attention');
  }

  testInfo(): void {
    this.notificationService.info(
      'Information : vos modifications seront sauvegardées.',
      'ℹ️ Information',
    );
  }

  saveConfiguration(): void {
    if (!this.appName.trim()) {
      this.testWarning();
      return;
    }

    // Simulation de sauvegarde
    this.notificationService.info('Sauvegarde en cours...', '⏳ Chargement');

    setTimeout(() => {
      this.notificationService.success(
        `Configuration de "${this.appName}" sauvegardée avec succès !`,
        '🎉 Configuration sauvegardée',
      );
    }, 2000);
  }
}
