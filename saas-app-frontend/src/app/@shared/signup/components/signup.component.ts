import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignupService } from 'src/app/@api/services/signup/signup.service';
import { UserSignUPDTO } from '../dto/user-signup.dto';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  myForm!: FormGroup;
  invalidFields: { [key: string]: boolean } = {};
  loading = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  errorMessage = '';

  constructor(
    private signupService: SignupService,
    private el: ElementRef,
    private router: Router,
  ) {}

  ngOnInit() {
    this.myForm = new FormGroup({
      role: new FormControl(null, [Validators.required]),
      firstname: new FormControl(null, [
        Validators.required,
        // alphabets regex
        Validators.pattern("^[a-zA-Zs'-]+$"),
      ]),
      lastname: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      phone: new FormControl(null, [
        Validators.required,
        // phone regex
        Validators.pattern('^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$'),
      ]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      streetAddr: new FormControl(null, [Validators.required]),
      city: new FormControl(null, [
        Validators.required,
        // alphabets regex
        Validators.pattern("^[a-zA-Zs'-]+$"),
      ]),
      zipCode: new FormControl(null, [
        Validators.required,
        // zip code regex
        Validators.pattern('[0-9]{5}'),
      ]),
    });
  }

  onFormSubmit(form: FormGroup) {
    this.invalidFields = {};

    // transform the form to WO
    const userSignUPDTO: UserSignUPDTO = {
      firstName: form.value.firstname,
      lastName: form.value.lastname,
      email: form.value.email,
      phoneNumber: form.value.phone,
      streetAddress: form.value.streetAddr,
      city: form.value.city,
      zipCode: Number(form.value.zipCode),
      password: form.value.password,
      plan: 'YZ-PLAN-1',
      role: form.value.role,
    };
    //
    if (form.valid) {
      this.loading = true;
      this.signupService.Signup(userSignUPDTO).subscribe({
        next: (data: any) => {
          this.loading = false;
          this.showSuccessMessage = true;
          console.log('Inscription réussie!', data);

          // Afficher message de succès pendant 3 secondes
          setTimeout(() => {
            this.autoLogin(userSignUPDTO);
          }, 3000);
        },
        error: (error: any) => {
          this.loading = false;
          console.error("Erreur lors de l'inscription:", error);

          // Afficher notification d'erreur créative
          let errorMessage = "Une erreur inattendue s'est produite. Veuillez réessayer.";

          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 409) {
            errorMessage = 'Cet email est déjà utilisé. Veuillez en choisir un autre.';
          } else if (error.status === 400) {
            errorMessage = 'Veuillez vérifier que tous les champs sont correctement remplis.';
          } else if (error.status === 0) {
            errorMessage =
              'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
          }

          this.errorMessage = errorMessage;
          this.showErrorMessage = true;

          // Auto-hide error after 7 seconds
          setTimeout(() => {
            this.showErrorMessage = false;
          }, 7000);
        },
      });
    } else {
      this.showValidationPopups();
    }
  }

  goToLogin() {
    // Navigation vers la page de login
    this.router.navigate(['/login']);
  }

  // Méthode pour connecter automatiquement l'utilisateur après inscription
  autoLogin(userSignUPDTO: UserSignUPDTO) {
    // Stocker les informations utilisateur temporairement
    const userInfo = {
      email: userSignUPDTO.email,
      firstName: userSignUPDTO.firstName,
      lastName: userSignUPDTO.lastName,
      role: userSignUPDTO.role,
    };

    // Sauvegarder dans localStorage pour simulation de connexion
    localStorage.setItem('user', JSON.stringify(userInfo));
    localStorage.setItem('isLoggedIn', 'true');

    // Rediriger vers le dashboard selon le rôle après un court délai
    setTimeout(() => {
      this.redirectBasedOnRole(userSignUPDTO.role);
    }, 1000);
  }

  // Redirection basée sur le rôle
  redirectBasedOnRole(role: string) {
    let route = '';

    switch (role) {
      case 'admin':
        route = '/admin/dashboard';
        break;
      case 'manager':
        route = '/manager/dashboard';
        break;
      case 'customer':
      default:
        route = '/customer/dashboard';
        break;
    }

    this.router.navigate([route]);
  }

  showValidationPopups() {
    Object.keys(this.myForm.controls).forEach((controlName) => {
      const control = this.myForm.get(controlName);

      if (control && control.invalid) {
        this.invalidFields[controlName] = true;
      }
      setTimeout(() => {
        this.invalidFields[controlName] = false;
      }, 4000);
    });
  }
}
