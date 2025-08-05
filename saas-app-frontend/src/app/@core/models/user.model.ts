export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CUSTOMER_ADMIN = 'CUSTOMER_ADMIN',
  CUSTOMER_MANAGER = 'CUSTOMER_MANAGER',
  CUSTOMER_DEVELOPER = 'CUSTOMER_DEVELOPER',
  END_USER = 'END_USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  token: string;
  refreshToken?: string;
  permissions?: string[];
}
