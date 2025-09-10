import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UserManagementService } from '../services/user-management.service';
import { CreateUserDto, UpdateUserDto, ToggleUserStatusDto } from '../dto/user-management.dto';

@Controller('user-management')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  async getAllUsers(@Res() res: Response) {
    try {
      const users = await this.userManagementService.getAllUsers();
      return res.status(HttpStatus.OK).json(users);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Erreur lors de la récupération des utilisateurs',
      });
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.userManagementService.getUserById(id);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          error: 'Utilisateur non trouvé',
        });
      }
      return res.status(HttpStatus.OK).json(user);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Erreur lors de la récupération de l'utilisateur",
      });
    }
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const user = await this.userManagementService.createUser(createUserDto);
      return res.status(HttpStatus.CREATED).json(user);
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      if (error.message.includes('E11000')) {
        return res.status(HttpStatus.CONFLICT).json({
          error: 'Un utilisateur avec cet email existe déjà',
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Erreur lors de la création de l'utilisateur",
      });
    }
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.userManagementService.updateUser(id, updateUserDto);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          error: 'Utilisateur non trouvé',
        });
      }
      return res.status(HttpStatus.OK).json(user);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Erreur lors de la mise à jour de l'utilisateur",
      });
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.userManagementService.deleteUser(id);
      if (!result) {
        return res.status(HttpStatus.NOT_FOUND).json({
          error: 'Utilisateur non trouvé',
        });
      }
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Erreur lors de la suppression de l'utilisateur",
      });
    }
  }

  @Patch(':id/status')
  async toggleUserStatus(
    @Param('id') id: string,
    @Body() toggleStatusDto: ToggleUserStatusDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.userManagementService.toggleUserStatus(id, toggleStatusDto.isActive);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          error: 'Utilisateur non trouvé',
        });
      }
      return res.status(HttpStatus.OK).json(user);
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Erreur lors de la modification du statut',
      });
    }
  }

  @Post(':id/reset-password')
  async resetUserPassword(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.userManagementService.resetUserPassword(id);
      if (!result) {
        return res.status(HttpStatus.NOT_FOUND).json({
          error: 'Utilisateur non trouvé',
        });
      }
      return res.status(HttpStatus.OK).json({
        temporaryPassword: result.temporaryPassword,
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Erreur lors de la réinitialisation du mot de passe',
      });
    }
  }
}
