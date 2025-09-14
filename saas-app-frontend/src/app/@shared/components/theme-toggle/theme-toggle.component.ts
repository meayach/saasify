import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../@core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <div class="floating-dark-mode-toggle">
      <label class="switch">
        <input type="checkbox" [checked]="isDarkMode" (change)="onToggleTheme()" />
        <span class="slider"></span>
      </label>
    </div>
  `,
  styleUrls: ['./theme-toggle.component.css'],
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  private subscription: Subscription = new Subscription();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
        this.isDarkMode = isDark;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onToggleTheme(): void {
    this.themeService.toggleDarkMode();
  }
}
