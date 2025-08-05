import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  template: `
    <div class="notification-container">
      <div
        *ngFor="let notification of notifications"
        class="notification"
        [ngClass]="'notification-' + notification.type"
        [@slideIn]>
        <div class="notification-content">
          <div class="notification-header" *ngIf="notification.title">
            <span class="notification-title">{{ notification.title }}</span>
            <button class="notification-close" (click)="removeNotification(notification.id)">
              ×
            </button>
          </div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>

        <div class="notification-progress" [ngClass]="'progress-' + notification.type"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .notification {
        min-width: 320px;
        max-width: 400px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        position: relative;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .notification-success {
        background: linear-gradient(135deg, #4caf50, #45a049);
        color: white;
      }

      .notification-error {
        background: linear-gradient(135deg, #f44336, #d32f2f);
        color: white;
      }

      .notification-warning {
        background: linear-gradient(135deg, #ff9800, #f57c00);
        color: white;
      }

      .notification-info {
        background: linear-gradient(135deg, #2196f3, #1976d2);
        color: white;
      }

      .notification-content {
        padding: 16px;
      }

      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .notification-title {
        font-weight: 600;
        font-size: 16px;
      }

      .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
      }

      .notification-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }

      .notification-message {
        font-size: 14px;
        line-height: 1.4;
      }

      .notification-progress {
        height: 4px;
        animation: progress 5s linear forwards;
      }

      .progress-success {
        background: linear-gradient(90deg, #66bb6a, #4caf50);
      }

      .progress-error {
        background: linear-gradient(90deg, #ef5350, #f44336);
      }

      .progress-warning {
        background: linear-gradient(90deg, #ffa726, #ff9800);
      }

      .progress-info {
        background: linear-gradient(90deg, #42a5f5, #2196f3);
      }

      @keyframes progress {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .notification {
        animation: slideIn 0.3s ease-out;
      }
    `,
  ],
  animations: [],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      (notifications: Notification[]) => (this.notifications = notifications),
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }
}
