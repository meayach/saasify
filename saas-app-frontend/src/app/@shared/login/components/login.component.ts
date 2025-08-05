import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      // Simuler la connexion - à remplacer par l'authentification réelle
      const email = this.loginForm.value.email;

      // Redirection basée sur l'email pour la démo
      if (email.includes('admin')) {
        this.router.navigate(['/customer-admin']);
      } else if (email.includes('manager')) {
        this.router.navigate(['/customer-manager']);
      } else if (email.includes('dev')) {
        this.router.navigate(['/customer-developer']);
      } else {
        // Redirection par défaut vers admin
        this.router.navigate(['/customer-admin']);
      }

      this.loading = false;
    }
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
