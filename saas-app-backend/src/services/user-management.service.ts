import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../data/models/user/user.model';
import { CreateUserDto, UpdateUserDto } from '../dto/user-management.dto';

@Injectable()
export class UserManagementService {
  constructor(@InjectModel(User.name) private userModel: Model<User & Document>) {}

  async getAllUsers(): Promise<User[]> {
    console.log('🔍 Recherche des utilisateurs dans la collection saasCustomerAdmins...');
    const users = await this.userModel.find().select('-password').sort({ createdAt: -1 }).exec();
    console.log("📊 Nombre d'utilisateurs trouvés:", users.length);
    return users;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await user.save();

    // Retourner l'utilisateur sans le mot de passe
    return this.userModel.findById(savedUser._id).select('-password').exec();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...updateUserDto,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .select('-password')
      .exec();

    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<User | null> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          isActive,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .select('-password')
      .exec();

    return updatedUser;
  }

  async resetUserPassword(id: string): Promise<{ temporaryPassword: string } | null> {
    // Générer un mot de passe temporaire
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          password: hashedPassword,
          updatedAt: new Date(),
          // Vous pouvez ajouter un flag pour forcer le changement de mot de passe au prochain login
          mustChangePassword: true,
        },
        { new: true },
      )
      .exec();

    if (!updatedUser) {
      return null;
    }

    return { temporaryPassword };
  }

  private generateTemporaryPassword(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
  }
}
