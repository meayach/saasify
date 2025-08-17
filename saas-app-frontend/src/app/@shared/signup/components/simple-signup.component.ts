import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../@core/services/auth.service';

@Component({
  selector: 'app-simple-signup',
  templateUrl: './simple-signup.component.html',
  styleUrls: ['./simple-signup.component.css'],
})
export class SimpleSignupComponent {
  signupForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.signupForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const userData = {
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        firstName: this.signupForm.value.firstName,
        lastName: this.signupForm.value.lastName,
        role: 'CUSTOMER_ADMIN', // Rôle par défaut
      };

      this.authService.signup(userData).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.success = 'Compte créé avec succès ! Redirection vers la connexion...';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.error = response.message || 'Erreur lors de la création du compte';
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur signup:', error);
          this.error = error.error?.message || 'Erreur lors de la création du compte';
        },
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
