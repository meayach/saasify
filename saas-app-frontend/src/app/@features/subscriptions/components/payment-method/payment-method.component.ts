import { Component } from '@angular/core';

@Component({
  selector: 'app-payment-method',
  template: `
    <div class="payment-method-container">
      <h2>Payment Methods</h2>
      <p>Payment method management will be implemented here.</p>
    </div>
  `,
  styles: [
    `
      .payment-method-container {
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class PaymentMethodComponent {}
