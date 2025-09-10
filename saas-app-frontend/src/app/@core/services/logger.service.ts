import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly isDebugMode =
    !environment.production && (environment as any).enableDebugLogs !== false;

  constructor() {
    if (this.isDebugMode) {
      console.log('🔧 LoggerService initialized - Debug mode enabled');
    }
  }

  log(...args: any[]): void {
    if (this.isDebugMode) {
      console.log(...args);
    }
  }

  warn(...args: any[]): void {
    if (this.isDebugMode) {
      console.warn(...args);
    }
  }

  error(...args: any[]): void {
    // Les erreurs sont toujours loggées, même en production
    console.error(...args);
  }

  info(...args: any[]): void {
    if (this.isDebugMode) {
      console.info(...args);
    }
  }

  debug(...args: any[]): void {
    if (this.isDebugMode) {
      console.debug(...args);
    }
  }

  // Méthode pour activer/désactiver le debug manuellement (utile pour le développement)
  setDebugMode(enabled: boolean): void {
    (this as any).isDebugMode = enabled;
    console.log(`🔧 Debug mode ${enabled ? 'enabled' : 'disabled'} manually`);
  }

  // Méthode pour vérifier l'état du debug
  isDebugEnabled(): boolean {
    return this.isDebugMode;
  }
}
