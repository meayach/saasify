export enum ApplicationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEVELOPMENT = 'DEVELOPMENT',
  PRODUCTION = 'PRODUCTION',
  MAINTENANCE = 'MAINTENANCE',
}

export enum ApplicationType {
  WEB_APP = 'WEB_APP',
  MOBILE_APP = 'MOBILE_APP',
  API_SERVICE = 'API_SERVICE',
  DESKTOP_APP = 'DESKTOP_APP',
}

export interface SaasApplication {
  id: string;
  name: string;
  description: string;
  status: ApplicationStatus;
  type: ApplicationType;
  ownerId: string;
  slug: string;
  logoUrl?: string;
  websiteUrl?: string;
  apiUrl?: string;
  tags: string[];
  launchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApplicationRequest {
  name: string;
  description: string;
  type: ApplicationType;
  slug: string;
  logoUrl?: string;
  websiteUrl?: string;
  apiUrl?: string;
  tags?: string[];
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateApplicationRequest {
  name?: string;
  description?: string;
  status?: ApplicationStatus;
  logoUrl?: string;
  websiteUrl?: string;
  apiUrl?: string;
  tags?: string[];
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}
