import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BillingService, BillingSettings } from './billing.service';

@Injectable({
  providedIn: 'root',
})
export class BillingStateService {
  private settingsSubject = new BehaviorSubject<BillingSettings | null>(null);
  public settings$ = this.settingsSubject.asObservable();

  constructor(private billingService: BillingService) {}

  // Load settings from API and emit
  load(): Observable<BillingSettings> {
    const obs = this.billingService.getBillingSettings();
    obs.subscribe({
      next: (s) => {
        // normalize currency codes
        if (s && s.defaultCurrency) {
          const c = (s.defaultCurrency || '').toString().toUpperCase().trim();
          if (c === 'GB' || c === 'GBR') s.defaultCurrency = 'GBP';
          if (c === 'US' || c === 'USA') s.defaultCurrency = 'USD';
          if (c === 'EU' || c === 'EURS') s.defaultCurrency = 'EUR';
        }
        this.settingsSubject.next(s);
      },
      error: () => {
        // keep current value if load fails
      },
    });
    return obs;
  }

  // Manually set settings (useful after update)
  set(settings: BillingSettings): void {
    if (settings && settings.defaultCurrency) {
      const c = (settings.defaultCurrency || '').toString().toUpperCase().trim();
      if (c === 'GB' || c === 'GBR') settings.defaultCurrency = 'GBP';
      if (c === 'US' || c === 'USA') settings.defaultCurrency = 'USD';
      if (c === 'EU' || c === 'EURS') settings.defaultCurrency = 'EUR';
    }
    this.settingsSubject.next(settings);
  }

  get current(): BillingSettings | null {
    return this.settingsSubject.getValue();
  }
}
