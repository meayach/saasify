import { Component } from '@angular/core';

@Component({
  selector: 'app-billing-history',
  template: `
    <div class="billing-history-container">
      <h2>Billing History</h2>
      <p>Billing history and invoices will be displayed here.</p>
    </div>
  `,
  styles: [
    `
      .billing-history-container {
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class BillingHistoryComponent {}
