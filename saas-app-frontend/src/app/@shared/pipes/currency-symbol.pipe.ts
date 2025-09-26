import { Pipe, PipeTransform } from '@angular/core';

export const currencyToSymbol: Record<string, string> = {
  EUR: '€',
  EURs: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  CHF: 'CHF',
  CAD: '$',
  AUD: '$',
};

@Pipe({
  name: 'currencySymbol',
  pure: false,
})
export class CurrencySymbolPipe implements PipeTransform {
  transform(code: string | undefined | null): string {
    if (!code) return '';
    let normalized = (code || '').toString().toUpperCase().trim();
    // Accept common variants and normalize to standard ISO codes
    if (normalized === 'GB' || normalized === 'GBR') normalized = 'GBP';
    if (normalized === 'US' || normalized === 'USA') normalized = 'USD';
    if (normalized === 'EU' || normalized === 'EURs') normalized = 'EUR';
    return currencyToSymbol[normalized] || normalized;
  }
}
