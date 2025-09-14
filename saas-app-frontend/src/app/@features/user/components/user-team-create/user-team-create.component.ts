import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-team-create',
  templateUrl: './user-team-create.component.html',
  styleUrls: ['./user-team-create.component.css'],
})
export class UserTeamCreateComponent implements OnInit {
  memberForm: FormGroup;
  loading = false;

  roles = [
    { value: 'manager', label: 'Manager' },
    { value: 'developer', label: 'Développeur' },
    { value: 'admin', label: 'Admin' },
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.memberForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['developer', Validators.required],
      status: ['active', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.memberForm.valid) {
      this.loading = true;
      // TODO: Appeler le service pour créer le membre
      console.log('Création du membre:', this.memberForm.value);

      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/user']);
      }, 1000);
    }
  }

  onCancel(): void {
    this.router.navigate(['/user']);
  }
}
