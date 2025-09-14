import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedMode = localStorage.getItem('dashboardDarkMode');
    if (savedMode) {
      const isDark = JSON.parse(savedMode);
      this.isDarkModeSubject.next(isDark);
      this.applyTheme(isDark);
    }
  }

  toggleDarkMode(): void {
    const currentMode = this.isDarkModeSubject.value;
    const newMode = !currentMode;
    this.isDarkModeSubject.next(newMode);
    localStorage.setItem('dashboardDarkMode', JSON.stringify(newMode));
    this.applyTheme(newMode);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  get isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }
}
