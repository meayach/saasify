import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  show(notification: Omit<Notification, 'id'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      duration: notification.duration || 5000,
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    // Auto-remove notification after duration
    setTimeout(() => {
      this.remove(newNotification.id);
    }, newNotification.duration);
  }

  success(message: string, title: string = 'Succès'): void {
    this.show({
      type: 'success',
      message,
      title,
    });
  }

  error(message: string, title: string = '❌ Erreur'): void {
    this.show({
      type: 'error',
      message,
      title,
      duration: 7000,
    });
  }

  warning(message: string, title: string = 'Attention'): void {
    this.show({
      type: 'warning',
      message,
      title,
    });
  }

  info(message: string, title: string = 'Information'): void {
    this.show({
      type: 'info',
      message,
      title,
    });
  }

  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(
      currentNotifications.filter((notification) => notification.id !== id),
    );
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }
}
