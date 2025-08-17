import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApplicationConfiguration } from '../../data/models/applicationConfiguration/application-configuration.model';
import {
  CreateApplicationConfigurationDto,
  UpdateApplicationConfigurationDto,
} from '../dto/application-configuration.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class ApplicationConfigurationService {
  private readonly logger = new Logger(ApplicationConfigurationService.name);

  constructor(
    @InjectModel('ApplicationConfiguration')
    private readonly configurationModel: Model<ApplicationConfiguration>,
  ) {}

  async createConfiguration(
    createDto: CreateApplicationConfigurationDto,
    logoFile?: Express.Multer.File,
  ): Promise<ApplicationConfiguration> {
    try {
      let logoPath: string | undefined;

      // Gérer l'upload du logo si fourni
      if (logoFile) {
        logoPath = await this.saveLogoFile(logoFile);
      }

      const configurationData = {
        applicationId: createDto.applicationId,
        applicationName: createDto.applicationName,
        domainName: createDto.domainName,
        isActive: createDto.isActive ?? true,
        logoPath: logoPath,
        paymentMethods: createDto.paymentMethods || {
          paypal: false,
          wize: false,
          payonner: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const configuration = new this.configurationModel(configurationData);
      const savedConfiguration = await configuration.save();

      this.logger.log(
        `Configuration créée avec succès pour l'application: ${createDto.applicationId}`,
      );

      return savedConfiguration;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de la configuration: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getAllConfigurations(): Promise<ApplicationConfiguration[]> {
    try {
      return await this.configurationModel.find().exec();
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des configurations: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getConfigurationByApplicationId(
    applicationId: string,
  ): Promise<ApplicationConfiguration | null> {
    try {
      return await this.configurationModel.findOne({ applicationId }).exec();
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de la configuration pour l'application ${applicationId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateConfiguration(
    id: string,
    updateDto: UpdateApplicationConfigurationDto,
    logoFile?: Express.Multer.File,
  ): Promise<ApplicationConfiguration | null> {
    try {
      const existingConfig = await this.configurationModel.findById(id);
      if (!existingConfig) {
        return null;
      }

      let logoPath = existingConfig.logoPath;

      // Gérer l'upload du nouveau logo si fourni
      if (logoFile) {
        // Supprimer l'ancien logo s'il existe
        if (existingConfig.logoPath) {
          await this.deleteLogoFile(existingConfig.logoPath);
        }
        logoPath = await this.saveLogoFile(logoFile);
      }

      const updateData = {
        ...updateDto,
        logoPath: logoPath,
        updatedAt: new Date(),
      };

      const updatedConfiguration = await this.configurationModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();

      this.logger.log(`Configuration mise à jour avec succès: ${id}`);

      return updatedConfiguration;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de la configuration ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteConfiguration(id: string): Promise<boolean> {
    try {
      const config = await this.configurationModel.findById(id);
      if (!config) {
        return false;
      }

      // Supprimer le logo s'il existe
      if (config.logoPath) {
        await this.deleteLogoFile(config.logoPath);
      }

      await this.configurationModel.findByIdAndDelete(id);

      this.logger.log(`Configuration supprimée avec succès: ${id}`);

      return true;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression de la configuration ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async saveLogoFile(logoFile: Express.Multer.File): Promise<string> {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'app-logos');

      // Créer le dossier s'il n'existe pas
      await fs.mkdir(uploadsDir, { recursive: true });

      const fileExtension = path.extname(logoFile.originalname);
      const fileName = `logo-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      await fs.writeFile(filePath, logoFile.buffer);

      // Retourner le chemin relatif pour stockage en base
      return `uploads/app-logos/${fileName}`;
    } catch (error) {
      this.logger.error(`Erreur lors de la sauvegarde du logo: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async deleteLogoFile(logoPath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), logoPath);
      await fs.unlink(fullPath);
    } catch (error) {
      this.logger.warn(`Impossible de supprimer le fichier logo ${logoPath}: ${error.message}`);
      // Ne pas faire échouer l'opération principale si la suppression du fichier échoue
    }
  }
}
