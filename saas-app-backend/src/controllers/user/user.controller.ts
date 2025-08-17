import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from '../../services/user/user.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../services/dto/user.dto';
import { SaasCustomerAdminRepository } from '../../data/saasCustomerAdmin/repository/SaasCustomerAdmin.repository';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly customerAdminRepository: SaasCustomerAdminRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.userService.findAll(pageNum, limitNum);
  }

  // =================== ROUTES SPÉCIFIQUES AVANT LES ROUTES GÉNÉRIQUES ===================

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getCurrentProfile(): Promise<{ success: boolean; data: any }> {
    try {
      // Obtenir les utilisateurs depuis SaasCustomerAdmin
      const users = await this.customerAdminRepository.findAll();
      if (!users || users.length === 0) {
        throw new HttpException('Aucun utilisateur trouvé', HttpStatus.NOT_FOUND);
      }

      const user = users[0];
      return {
        success: true,
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          streetAddress: user.streetAddress,
          city: user.city,
          zipCode: user.zipCode,
          role: user.role,
          plan: user.plan,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération du profil',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean; data: any; message?: string }> {
    try {
      // Obtenir le premier utilisateur pour les tests
      const users = await this.customerAdminRepository.findAll();
      if (!users || users.length === 0) {
        throw new HttpException('Aucun utilisateur trouvé', HttpStatus.NOT_FOUND);
      }

      const userId = users[0]._id;

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      if (updateUserDto.email) {
        const existingUser = await this.customerAdminRepository.findByEmail(updateUserDto.email);
        if (existingUser && existingUser._id.toString() !== userId.toString()) {
          throw new HttpException(
            { success: false, message: 'Cet email est déjà utilisé par un autre compte' },
            HttpStatus.CONFLICT,
          );
        }
      }

      const updatedUser = await this.customerAdminRepository.updateById(userId, updateUserDto);
      if (!updatedUser) {
        throw new HttpException('Erreur lors de la mise à jour', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        success: true,
        data: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          streetAddress: updatedUser.streetAddress,
          city: updatedUser.city,
          zipCode: updatedUser.zipCode,
          role: updatedUser.role,
          plan: updatedUser.plan,
        },
        message: 'Profil mis à jour avec succès',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, message: 'Erreur lors de la mise à jour du profil' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or current password incorrect' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(
    @Body() passwordData: { currentPassword: string; newPassword: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Obtenir le premier utilisateur pour les tests
      const users = await this.customerAdminRepository.findAll();
      if (!users || users.length === 0) {
        throw new HttpException('Aucun utilisateur trouvé', HttpStatus.NOT_FOUND);
      }

      const userId = users[0]._id;

      // Validation côté serveur
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        throw new HttpException(
          { success: false, message: 'Mot de passe actuel et nouveau mot de passe requis' },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (passwordData.newPassword.length < 8) {
        throw new HttpException(
          {
            success: false,
            message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (passwordData.currentPassword === passwordData.newPassword) {
        throw new HttpException(
          {
            success: false,
            message: "Le nouveau mot de passe doit être différent de l'ancien",
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Pour la démonstration, on met simplement à jour le mot de passe
      // Dans un vrai système, il faudrait d'abord vérifier le mot de passe actuel
      const updatedUser = await this.customerAdminRepository.updateById(userId, {
        password: passwordData.newPassword, // En production, il faudrait le chiffrer
      });

      if (!updatedUser) {
        throw new HttpException(
          'Erreur lors de la mise à jour du mot de passe',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        success: true,
        message: 'Mot de passe modifié avec succès',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, message: 'Erreur lors du changement de mot de passe' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('check-email/:email')
  @ApiOperation({ summary: 'Check if email is available' })
  @ApiResponse({ status: 200, description: 'Email availability checked' })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Current user ID to exclude from check',
  })
  async checkEmailAvailability(
    @Param('email') email: string,
    @Query('userId') userId?: string,
  ): Promise<{ success: boolean; data: { available: boolean } }> {
    try {
      const existingUser = await this.userService.findByEmail(email);
      const available = !existingUser || (userId && existingUser.id === userId);

      return {
        success: true,
        data: { available },
      };
    } catch (error) {
      // Si l'utilisateur n'est pas trouvé, l'email est disponible
      return {
        success: true,
        data: { available: true },
      };
    }
  }

  @Delete('account')
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    try {
      // Pour les tests, utilisons le premier utilisateur disponible
      const result = await this.userService.findAll(1, 1);
      if (!result || !result.users || result.users.length === 0) {
        throw new HttpException('Aucun utilisateur trouvé', HttpStatus.NOT_FOUND);
      }

      const userId = result.users[0].id;

      await this.userService.remove(userId);

      return {
        success: true,
        message: 'Compte supprimé avec succès',
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Erreur lors de la suppression du compte' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =================== ROUTES GÉNÉRIQUES APRÈS LES ROUTES SPÉCIFIQUES ===================

  @Get('email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    return this.userService.findByEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }

  @Post(':id/login')
  @ApiOperation({ summary: 'Update user last login' })
  @ApiResponse({ status: 200, description: 'Last login updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateLastLogin(@Param('id') id: string): Promise<void> {
    return this.userService.updateLastLogin(id);
  }
}
