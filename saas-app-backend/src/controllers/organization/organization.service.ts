import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization, OrganizationDocument } from './schemas/organization.schema';
import * as path from 'path';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
  ) {}

  async getSettings(): Promise<Organization> {
    let settings = await this.organizationModel.findOne().exec();

    // Si aucun paramètre n'existe, créer des paramètres par défaut
    if (!settings) {
      const defaultSettings = {
        companyName: 'Mon Entreprise SaaS',
        email: 'contact@monentreprise.com',
        phone: '+33 1 23 45 67 89',
        description: "Plateforme SaaS innovante pour la gestion d'entreprise",
        website: 'https://monentreprise.com',
        industry: 'Technologie',
        timezone: 'Europe/Paris',
        language: 'Français',
        logoUrl: '',
      };

      settings = await this.organizationModel.create(defaultSettings);
    }

    return settings;
  }

  async createSettings(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    // Vérifier s'il existe déjà des paramètres
    const existingSettings = await this.organizationModel.findOne().exec();
    if (existingSettings) {
      // Si des paramètres existent, les mettre à jour au lieu de créer
      return this.updateSettings(createOrganizationDto);
    }

    const createdSettings = new this.organizationModel(createOrganizationDto);
    return createdSettings.save();
  }

  async updateSettings(updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    const existingSettings = await this.organizationModel.findOne().exec();

    if (!existingSettings) {
      // If no settings exist, create new ones with the update data
      const createDto: CreateOrganizationDto = {
        companyName: updateOrganizationDto.companyName || 'Default Company',
        email: updateOrganizationDto.email || 'contact@example.com',
        phone: updateOrganizationDto.phone || '',
        description: updateOrganizationDto.description || '',
        website: updateOrganizationDto.website || '',
        industry: updateOrganizationDto.industry || '',
        timezone: updateOrganizationDto.timezone || '',
        language: updateOrganizationDto.language || '',
        logoUrl: updateOrganizationDto.logoUrl || '',
      };
      return this.createSettings(createDto);
    }

    // Update existing settings
    Object.assign(existingSettings, updateOrganizationDto);
    return existingSettings.save();
  }

  async uploadLogo(file: any): Promise<string> {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    // Valider le type de fichier
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.');
    }

    // Valider la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('La taille du fichier ne doit pas dépasser 5MB');
    }

    // Le fichier est déjà sauvé par multer diskStorage
    // Récupérer le nom du fichier depuis le chemin complet
    const fileName = path.basename(file.filename);

    // Retourner l'URL relative
    const logoUrl = `/uploads/logos/${fileName}`;

    // Mettre à jour l'URL du logo dans les paramètres de l'organisation
    await this.organizationModel.updateOne({}, { logoUrl }, { upsert: true });

    return logoUrl;
  }
}
