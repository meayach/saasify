import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './components/notification/notification.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { NotificationService } from './services/notification.service';
import { ConfirmationModalService } from './services/confirmation-modal.service';

@NgModule({
  declarations: [NotificationComponent, ConfirmationModalComponent],
  imports: [CommonModule],
  providers: [NotificationService, ConfirmationModalService],
  exports: [NotificationComponent, ConfirmationModalComponent],
})
export class SharedModule {}
