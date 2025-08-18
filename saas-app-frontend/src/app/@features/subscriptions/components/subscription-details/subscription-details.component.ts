import { Component } from '@angular/core';

@Component({
  selector: 'app-subscription-details',
  template: `
    <div class="subscription-details-container">
      <h2>Subscription Details</h2>
      <p>Detailed subscription information will be displayed here.</p>
    </div>
  `,
  styles: [
    `
      .subscription-details-container {
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class SubscriptionDetailsComponent {}
