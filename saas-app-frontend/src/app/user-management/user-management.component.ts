import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  UserManagementService,
  User,
  CreateUserDto,
  UpdateUserDto,
} from './user-management.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  error = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Filtres
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';

  // Modals
  showUserModal = false;
  showDeleteModal = false;
  showPasswordModal = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  currentUser: User | null = null;

  // Formulaires
  userForm: FormGroup;
  temporaryPassword = '';

  // Options pour les selects
  roles = [
    { value: 'customer', label: 'Client' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
  ];

  statuses = [
    { value: 'PENDING', label: 'En attente' },
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'SUSPENDED', label: 'Suspendu' },
  ];

  constructor(
    private userService: UserManagementService,
    private formBuilder: FormBuilder,
    public router: Router,
  ) {
    this.userForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      streetAddress: ['', [Validators.required]],
      city: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      plan: ['YZ-PLAN-1', [Validators.required]],
      role: ['customer', [Validators.required]],
      password: ['', [Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    console.log('🔄 Chargement des utilisateurs...');

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('✅ Utilisateurs chargés avec succès:', users);
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        this.error = 'Erreur lors du chargement des utilisateurs: ' + error.message;
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Filtre par terme de recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.phoneNumber.includes(term),
      );
    }

    // Filtre par rôle
    if (this.selectedRole) {
      filtered = filtered.filter((user) => user.role === this.selectedRole);
    }

    // Filtre par statut
    if (this.selectedStatus) {
      filtered = filtered.filter((user) => user.status === this.selectedStatus);
    }

    this.filteredUsers = filtered;
    this.calculatePagination();
  }

  calculatePagination(): void {
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

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  // Gestion des modals
  openUserModal(mode: 'add' | 'edit' | 'view', user?: User): void {
    this.modalMode = mode;
    this.currentUser = user || null;
    this.showUserModal = true;

    if (mode === 'add') {
      this.userForm.reset();
      this.userForm.patchValue({
        plan: 'YZ-PLAN-1',
        role: 'customer',
      });
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    } else if (mode === 'edit' && user) {
      this.userForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        streetAddress: user.streetAddress,
        city: user.city,
        zipCode: user.zipCode,
        plan: user.plan,
        role: user.role,
      });
      this.userForm.get('password')?.clearValidators();
    }

    this.userForm.get('password')?.updateValueAndValidity();
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.currentUser = null;
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.valid) {
      this.loading = true;
      const formData = this.userForm.value;

      if (this.modalMode === 'add') {
        const createData: CreateUserDto = formData;
        this.userService.createUser(createData).subscribe({
          next: () => {
            this.loadUsers();
            this.closeUserModal();
            this.loading = false;
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
          },
        });
      } else if (this.modalMode === 'edit' && this.currentUser) {
        const updateData: UpdateUserDto = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }

        this.userService.updateUser(this.currentUser._id, updateData).subscribe({
          next: () => {
            this.loadUsers();
            this.closeUserModal();
            this.loading = false;
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
          },
        });
      }
    }
  }

  // Suppression d'utilisateur
  openDeleteModal(user: User): void {
    this.currentUser = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.currentUser = null;
  }

  confirmDelete(): void {
    if (this.currentUser) {
      this.loading = true;
      this.userService.deleteUser(this.currentUser._id).subscribe({
        next: () => {
          this.loadUsers();
          this.closeDeleteModal();
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        },
      });
    }
  }

  // Changement de statut
  changeUserStatus(user: User, newStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED'): void {
    this.loading = true;
    this.userService.updateUserStatus(user._id, newStatus).subscribe({
      next: () => {
        this.loadUsers();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      },
    });
  }

  // Réinitialisation du mot de passe
  resetPassword(user: User): void {
    this.currentUser = user;
    this.loading = true;
    this.userService.resetUserPassword(user._id).subscribe({
      next: (response) => {
        this.temporaryPassword = response.temporaryPassword;
        this.showPasswordModal = true;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      },
    });
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.temporaryPassword = '';
    this.currentUser = null;
  }

  // Utilitaires
  getStatusLabel(status: string): string {
    const statusObj = this.statuses.find((s) => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getRoleLabel(role: string): string {
    const roleObj = this.roles.find((r) => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'badge-success';
      case 'PENDING':
        return 'badge-warning';
      case 'SUSPENDED':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  // Navigation pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
