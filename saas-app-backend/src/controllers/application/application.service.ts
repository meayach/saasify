import { Injectable } from '@nestjs/common';
import { SaasApplicationRepository } from '@Data/saasApplication/repository/saasApplication.repository';
import { SaasApplicationPOJO } from '@Data/models/saasApplication/saasApplication.pojo.model';
import mongoose from 'mongoose';

export interface Application {
  _id?: string;
  name: string;
  status: 'active' | 'maintenance' | 'inactive';
  deployedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApplicationStats {
  totalApplications: number;
  activeApplications: number;
  deploymentsToday: number;
  maintenanceApplications: number;
}

@Injectable()
export class ApplicationService {
  constructor(private readonly saasApplicationRepository: SaasApplicationRepository) {}

  private convertToApplication(saasApp: SaasApplicationPOJO): Application {
    return {
      _id: saasApp._id?.toString(),
      name: saasApp.applicationName || '',
      status: (saasApp.status as 'active' | 'maintenance' | 'inactive') || 'active',
      deployedAt: new Date(),
      createdAt: saasApp.createdAt || new Date(),
      updatedAt: saasApp.updatedAt || new Date(),
    };
  }

  async getStats(): Promise<ApplicationStats> {
    console.log('🔍 Calcul des statistiques depuis MongoDB...');
    const saasApplications = await this.saasApplicationRepository.getAllSaasApplications();
    const applications = saasApplications.map((app) => this.convertToApplication(app));
    const today = new Date().toDateString();

    console.log('📊 Applications trouvées:', applications.length);

    return {
      totalApplications: applications.length,
      activeApplications: applications.filter((app) => app.status === 'active').length,
      deploymentsToday: applications.filter(
        (app) => app.deployedAt && app.deployedAt.toDateString() === today,
      ).length,
      maintenanceApplications: applications.filter((app) => app.status === 'maintenance').length,
    };
  }

  async findAll(): Promise<Application[]> {
    console.log('🔍 Récupération des applications depuis MongoDB...');
    const saasApplications = await this.saasApplicationRepository.getAllSaasApplications();
    const applications = saasApplications.map((app) => this.convertToApplication(app));
    console.log('📊 Applications récupérées:', applications.length);
    return applications;
  }

  async create(applicationData: Partial<Application>): Promise<Application> {
    console.log("🆕 Création d'une nouvelle application:", applicationData);

    const saasApplicationPOJO: SaasApplicationPOJO = {
      _id: new mongoose.Types.ObjectId(),
      realmClientId: `client_${Date.now()}`,
      realmClientSecret: `secret_${Date.now()}`,
      saasClientSecret: `saas_secret_${Date.now()}`,
      applicationName: applicationData.name || '',
      status: applicationData.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('💾 Sauvegarde en MongoDB...');
    const savedApplication = await this.saasApplicationRepository.createSaasApplication(
      saasApplicationPOJO,
    );

    console.log('✅ Application sauvegardée avec ID:', savedApplication._id);
    return this.convertToApplication(savedApplication);
  }

  async update(id: string, applicationData: Partial<Application>): Promise<Application> {
    console.log("✏️ Mise à jour de l'application ID:", id, 'avec les données:', applicationData);

    const updateData: Partial<SaasApplicationPOJO> = {
      updatedAt: new Date(),
    };

    // Ajouter seulement les champs fournis
    if (applicationData.name !== undefined) {
      updateData.applicationName = applicationData.name;
    }

    if (applicationData.status !== undefined) {
      updateData.status = applicationData.status;
    }

    console.log('📝 Données de mise à jour:', updateData);

    const updatedApp = await this.saasApplicationRepository.updateSaasApplication(id, updateData);
    if (!updatedApp) {
      throw new Error('Application not found');
    }

    console.log('✅ Application mise à jour avec succès');
    return this.convertToApplication(updatedApp);
  }

  async delete(id: string): Promise<void> {
    console.log("🗑️ Suppression de l'application ID:", id);

    const deleted = await this.saasApplicationRepository.deleteSaasApplication(id);
    if (!deleted) {
      throw new Error('Application not found');
    }

    console.log('✅ Application supprimée avec succès');
  }
}
