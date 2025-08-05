import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmationModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalService {
  private confirmationSubject = new Subject<{ confirmed: boolean; data?: any }>();
  private showModalSubject = new Subject<ConfirmationModalData>();

  showModal$ = this.showModalSubject.asObservable();
  confirmation$ = this.confirmationSubject.asObservable();

  confirm(data: ConfirmationModalData): Observable<boolean> {
    this.showModalSubject.next(data);

    return new Observable<boolean>((observer) => {
      const subscription = this.confirmation$.subscribe((result) => {
        observer.next(result.confirmed);
        observer.complete();
        subscription.unsubscribe();
      });
    });
  }

  confirmAction(confirmed: boolean, data?: any): void {
    this.confirmationSubject.next({ confirmed, data });
  }
}
