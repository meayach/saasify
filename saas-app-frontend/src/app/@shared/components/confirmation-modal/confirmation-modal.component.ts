import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ConfirmationModalService,
  ConfirmationModalData,
} from '../../services/confirmation-modal.service';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css'],
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  isVisible = false;
  modalData: ConfirmationModalData = {
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    type: 'danger',
  };

  private subscription: Subscription = new Subscription();

  constructor(private confirmationModalService: ConfirmationModalService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.confirmationModalService.showModal$.subscribe((data) => {
        this.modalData = {
          ...this.modalData,
          ...data,
        };
        this.isVisible = true;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onConfirm(): void {
    this.isVisible = false;
    this.confirmationModalService.confirmAction(true);
  }

  onCancel(): void {
    this.isVisible = false;
    this.confirmationModalService.confirmAction(false);
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
