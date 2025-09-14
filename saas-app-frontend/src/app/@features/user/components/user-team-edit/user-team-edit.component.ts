import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  joinedDate: Date;
}

interface Role {
  value: string;
  label: string;
}

@Component({
  selector: 'app-user-team-edit',
  templateUrl: './user-team-edit.component.html',
  styleUrls: ['./user-team-edit.component.css'],
})
export class UserTeamEditComponent implements OnInit {
  memberForm: FormGroup;
  loading = false;
  memberData: TeamMember | null = null;

  roles: Role[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'developer', label: 'Développeur' },
    { value: 'analyst', label: 'Analyste' },
    { value: 'viewer', label: 'Observateur' },
  ];

  constructor(private fb: FormBuilder, public router: Router) {
    this.memberForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['developer', Validators.required],
      status: ['active', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadMemberData();
  }

  loadMemberData(): void {
    // Simuler le chargement des données du membre à modifier
    // Dans une vraie application, récupérer l'ID depuis la route et charger depuis l'API
    this.memberData = {
      id: 'member-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      role: 'developer',
      status: 'active',
      joinedDate: new Date('2023-01-15'),
    };

    // Remplir le formulaire avec les données existantes
    if (this.memberData) {
      this.memberForm.patchValue({
        firstName: this.memberData.firstName,
        lastName: this.memberData.lastName,
        email: this.memberData.email,
        role: this.memberData.role,
        status: this.memberData.status,
      });
    }
  }

  onSubmit(): void {
    if (this.memberForm.valid) {
      this.loading = true;

      const formData = this.memberForm.value;

      console.log('Données de modification du membre:', {
        id: this.memberData?.id,
        ...formData,
      });

      // Simuler l'appel API
      setTimeout(() => {
        console.log('Membre modifié avec succès');
        this.loading = false;
        this.router.navigate(['/user']);
      }, 2000);
    }
  }

  onCancel(): void {
    this.router.navigate(['/user']);
  }

  getRoleLabel(roleValue: string): string {
    const role = this.roles.find((r) => r.value === roleValue);
    return role ? role.label : roleValue;
  }
}
