import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(private router: Router) {}

  navigateBasedOnRole(role: string): void {
    switch (role) {
      case 'CUSTOMER_ADMIN':
        this.router.navigate(['/customer-admin']);
        break;
      case 'CUSTOMER_MANAGER':
        this.router.navigate(['/customer-manager']);
        break;
      case 'CUSTOMER_DEVELOPER':
        this.router.navigate(['/customer-developer']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  getCurrentUserRole(): string {
    // For demo purposes, return a default role
    // In real app, this would come from authentication service
    return localStorage.getItem('userRole') || 'CUSTOMER_ADMIN';
  }

  setUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }
}
