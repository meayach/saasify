import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Controller('api/organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('settings')
  async getSettings() {
    try {
      const settings = await this.organizationService.getSettings();
      return {
        success: true,
        data: settings,
        message: 'Paramètres récupérés avec succès',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Erreur lors de la récupération des paramètres',
      };
    }
  }

  @Post('settings')
  async createSettings(@Body() createOrganizationDto: CreateOrganizationDto) {
    try {
      const settings = await this.organizationService.createSettings(createOrganizationDto);
      return {
        success: true,
        data: settings,
        message: 'Paramètres créés avec succès',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Erreur lors de la création des paramètres',
      };
    }
  }

  @Put('settings')
  async updateSettings(@Body() updateOrganizationDto: UpdateOrganizationDto) {
    try {
      const settings = await this.organizationService.updateSettings(updateOrganizationDto);
      return {
        success: true,
        data: settings,
        message: 'Paramètres mis à jour avec succès',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Erreur lors de la mise à jour des paramètres',
      };
    }
  }

  @Post('upload-logo')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Seuls les fichiers image sont autorisés!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('Aucun fichier uploadé');
      }

      const logoUrl = await this.organizationService.uploadLogo(file);

      return {
        success: true,
        data: { logoUrl },
        message: 'Logo uploadé avec succès',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || "Erreur lors de l'upload du logo",
      };
    }
  }
}
