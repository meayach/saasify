import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from '../../../@core/services/theme.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  UserManagementService,
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from '../services/user-management.service';
import { NotificationService } from '../../../@shared/services/notification.service';
import { UserService, UserProfile } from '../../../@shared/services/user.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  isDarkMode = false;
  private themeSubscription: Subscription | null = null;
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  showUserModal = false;
  showDeleteModal = false;
  userToDelete: User | null = null;
  isEditMode = false;
  isLoading = false;
  searchTerm = '';

  // Filtres
  selectedRole = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Dropdown utilisateur
  isDropdownOpen = false;
  userName = 'Utilisateur';
  userEmail = '';
  userRole = '';

  // Form
  userForm: FormGroup;

  roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'customer', label: 'Customer' },
    { value: 'manager', label: 'Manager' },
    { value: 'utilisateur', label: 'Utilisateur' },
  ];

  constructor(
    private userManagementService: UserManagementService,
    public router: Router,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private userService: UserService,
    private themeService: ThemeService,
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['utilisateur', Validators.required],
      phoneNumber: [''],
      streetAddress: [''],
      city: [''],
      zipCode: [''],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadCurrentUserProfile();
    this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  // Charger le profil de l'utilisateur connecté
  loadCurrentUserProfile(): void {
    this.userService.getCurrentUserProfile().subscribe({
      next: (profile: UserProfile) => {
        if (profile) {
          this.userName =
            `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || this.userName;
          this.userEmail = profile.email || this.userEmail;
          // Map role like in dashboard component
          this.userRole =
            profile.role === 'admin'
              ? 'Admin'
              : profile.role === 'customer'
              ? 'Client'
              : profile.role === 'manager'
              ? 'Manager'
              : profile.role === 'utilisateur'
              ? 'Utilisateur'
              : profile.role || this.userRole;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil utilisateur:', error);
        // Fallback to localStorage if UserService fails
        this.userName = localStorage.getItem('userName') || 'Utilisateur';
        this.userEmail = localStorage.getItem('userEmail') || '';
        this.userRole = localStorage.getItem('userRole') || '';
      },
    });
  }

  // Navigation
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  setActiveProfileSection(section: string): void {
    this.router.navigate(['/settings'], { queryParams: { section } });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // Gestion des utilisateurs
  loadUsers(): void {
    this.isLoading = true;
    this.userManagementService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
        console.log('✅ Utilisateurs chargés avec succès:', users.length);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        this.notificationService.error(
          'Erreur lors du chargement des utilisateurs. Veuillez réessayer.',
          'Erreur de chargement',
        );
        this.isLoading = false;
      },
    });
  }

  // Filtrage des utilisateurs
  applyFilters(): void {
    let filtered = this.users;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.phoneNumber && user.phoneNumber.toLowerCase().includes(term)),
      );
    }

    if (this.selectedRole) {
      filtered = filtered.filter((user) => user.role === this.selectedRole);
    }

    this.filteredUsers = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  getPaginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onRoleFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  // Actions CRUD
  openCreateUserModal(): void {
    this.isEditMode = false;
    this.selectedUser = null;
    this.userForm.reset();
    this.userForm.patchValue({ role: 'utilisateur' });
    this.showUserModal = true;
  }

  openEditUserModal(user: User): void {
    this.isEditMode = true;
    this.selectedUser = user;

    // Retirer le champ password en mode édition
    this.userForm.removeControl('password');

    this.userForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber || '',
      streetAddress: user.streetAddress || '',
      city: user.city || '',
      zipCode: user.zipCode || '',
    });
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
    this.isEditMode = false;

    // Remettre le champ password pour le mode création
    if (!this.userForm.get('password')) {
      this.userForm.addControl(
        'password',
        this.fb.control('', [Validators.required, Validators.minLength(6)]),
      );
    }
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.notificationService.warning(
        'Veuillez remplir tous les champs requis correctement.',
        'Formulaire invalide',
      );
      return;
    }

    const formData = this.userForm.value;

    if (this.isEditMode && this.selectedUser) {
      // Mode édition
      const updateData: UpdateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        streetAddress: formData.streetAddress,
        city: formData.city,
        zipCode: formData.zipCode,
      };

      this.userManagementService.updateUser(this.selectedUser._id!, updateData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeUserModal();
          this.notificationService.success(
            `L'utilisateur ${formData.firstName} ${formData.lastName} a été mis à jour avec succès.`,
            'Utilisateur modifié',
          );
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.notificationService.error(
            "Erreur lors de la mise à jour de l'utilisateur. Veuillez réessayer.",
            'Erreur de mise à jour',
          );
        },
      });
    } else {
      // Mode création
      const createData: CreateUserRequest = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        streetAddress: formData.streetAddress,
        city: formData.city,
        zipCode: formData.zipCode,
        plan: 'free', // Plan par défaut
      };

      this.userManagementService.createUser(createData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeUserModal();
          this.notificationService.success(
            `L'utilisateur ${formData.firstName} ${formData.lastName} a été créé avec succès.`,
            'Utilisateur créé',
          );
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          let errorMessage = "Erreur lors de la création de l'utilisateur.";

          if (error.status === 409) {
            errorMessage = 'Un utilisateur avec cette adresse email existe déjà.';
          } else if (error.status === 400) {
            errorMessage = 'Données invalides. Veuillez vérifier les informations saisies.';
          }

          this.notificationService.error(errorMessage, 'Erreur de création');
        },
      });
    }
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (this.userToDelete && this.userToDelete._id) {
      this.userManagementService.deleteUser(this.userToDelete._id).subscribe({
        next: () => {
          this.loadUsers();
          this.closeDeleteModal();
          this.notificationService.success(
            `L'utilisateur ${this.userToDelete!.firstName} ${
              this.userToDelete!.lastName
            } a été supprimé avec succès.`,
            'Utilisateur supprimé',
          );
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.notificationService.error(
            "Erreur lors de la suppression de l'utilisateur. Veuillez réessayer.",
            'Erreur de suppression',
          );
        },
      });
    }
  }

  toggleUserStatus(user: User): void {
    if (user._id) {
      const isActive = user.status === 'ACTIVE';
      const newStatus = !isActive;

      this.userManagementService.toggleUserStatus(user._id, newStatus).subscribe({
        next: () => {
          this.loadUsers();
          const statusText = newStatus ? 'activé' : 'désactivé';
          this.notificationService.success(
            `L'utilisateur ${user.firstName} ${user.lastName} a été ${statusText} avec succès.`,
            'Statut modifié',
          );
        },
        error: (error) => {
          console.error('Erreur lors de la modification du statut:', error);
          this.notificationService.error(
            'Erreur lors de la modification du statut. Veuillez réessayer.',
            'Erreur de modification',
          );
        },
      });
    }
  }

  resetPassword(user: User): void {
    if (user._id) {
      this.userManagementService.resetUserPassword(user._id).subscribe({
        next: (response) => {
          this.notificationService.success(
            `Nouveau mot de passe temporaire généré pour ${user.firstName} ${user.lastName}: ${response.temporaryPassword}`,
            'Mot de passe réinitialisé',
          );
        },
        error: (error) => {
          console.error('Erreur lors de la réinitialisation du mot de passe:', error);
          this.notificationService.error(
            'Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.',
            'Erreur de réinitialisation',
          );
        },
      });
    }
  }

  // Utilitaires
  getRoleLabel(role: string): string {
    const roleObj = this.roles.find((r) => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  getUserInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Jamais';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }
}
