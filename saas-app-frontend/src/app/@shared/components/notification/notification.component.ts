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
        [ngClass]="'notification-' + notification.type">
        <div class="notification-content">
          <div class="notification-header" *ngIf="notification.title">
            <span class="notification-title">{{ notification.title }}</span>
            <button class="notification-close" (click)="removeNotification(notification.id)">
              ×
            </button>
          </div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
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
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        position: relative;
        animation: slideIn 0.3s ease-out;
      }

      .notification-success {
        background: #4caf50;
        color: white;
      }

      .notification-error {
        background: #f44336;
        color: white;
      }

      .notification-warning {
        background: #ff9800;
        color: white;
      }

      .notification-info {
        background: #2196f3;
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
        border-radius: 50%;
      }

      .notification-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }

      .notification-message {
        font-size: 14px;
        line-height: 1.4;
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
    `,
  ],
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
