import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../@core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          if (response.success && response.user) {
            // Stocker les informations utilisateur dans le localStorage
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('isLoggedIn', 'true');

            // Redirection automatique vers le dashboard
            console.log('Connexion réussie, redirection vers le dashboard...');
            this.router.navigate(['/dashboard']).then(() => {
              console.log('Redirection vers le dashboard terminée');
            });
          } else {
            this.error = 'Échec de la connexion';
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Email ou mot de passe incorrect';
          this.loading = false;
        },
      });
    }
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
