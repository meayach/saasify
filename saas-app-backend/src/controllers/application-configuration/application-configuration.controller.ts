import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationConfigurationService } from '../../services/application-configuration/application-configuration.service';
import {
  CreateApplicationConfigurationDto,
  UpdateApplicationConfigurationDto,
} from '../../services/dto/application-configuration.dto';

@Controller('api/v1/application-configuration')
export class ApplicationConfigurationController {
  constructor(private readonly configurationService: ApplicationConfigurationService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async createConfiguration(
    @Body() createDto: CreateApplicationConfigurationDto,
    @UploadedFile() logoFile?: Express.Multer.File,
  ) {
    try {
      // Parser les paymentMethods si c'est une chaîne JSON
      if (typeof createDto.paymentMethods === 'string') {
        createDto.paymentMethods = JSON.parse(createDto.paymentMethods);
      }

      // Parser isActive si c'est une chaîne
      if (typeof createDto.isActive === 'string') {
        createDto.isActive = createDto.isActive === 'true';
      }

      const configuration = await this.configurationService.createConfiguration(
        createDto,
        logoFile,
      );
      return configuration;
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la création de la configuration: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async getAllConfigurations() {
    try {
      return await this.configurationService.getAllConfigurations();
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération des configurations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':applicationId')
  async getConfigurationByApplicationId(@Param('applicationId') applicationId: string) {
    try {
      const configuration = await this.configurationService.getConfigurationByApplicationId(
        applicationId,
      );
      if (!configuration) {
        throw new HttpException('Configuration non trouvée', HttpStatus.NOT_FOUND);
      }
      return configuration;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Erreur lors de la récupération de la configuration: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('logo'))
  async updateConfiguration(
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationConfigurationDto,
    @UploadedFile() logoFile?: Express.Multer.File,
  ) {
    try {
      // Parser les paymentMethods si c'est une chaîne JSON
      if (typeof updateDto.paymentMethods === 'string') {
        updateDto.paymentMethods = JSON.parse(updateDto.paymentMethods);
      }

      // Parser isActive si c'est une chaîne
      if (typeof updateDto.isActive === 'string') {
        updateDto.isActive = updateDto.isActive === 'true';
      }

      const configuration = await this.configurationService.updateConfiguration(
        id,
        updateDto,
        logoFile,
      );
      if (!configuration) {
        throw new HttpException('Configuration non trouvée', HttpStatus.NOT_FOUND);
      }
      return configuration;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Erreur lors de la mise à jour de la configuration: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async deleteConfiguration(@Param('id') id: string) {
    try {
      const result = await this.configurationService.deleteConfiguration(id);
      if (!result) {
        throw new HttpException('Configuration non trouvée', HttpStatus.NOT_FOUND);
      }
      return { message: 'Configuration supprimée avec succès' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Erreur lors de la suppression de la configuration: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
