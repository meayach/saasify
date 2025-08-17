import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasCustomerAdmin,
  SaasCustomerAdminDocument,
} from '@Data/models/saasCustomerAdmin/saas-customer-admin.model';

@Injectable()
export class SaasCustomerAdminRepository {
  constructor(
    @InjectModel(SaasCustomerAdmin.name)
    private saasCustomerAdminmodel: Model<SaasCustomerAdminDocument>,
  ) {}

  async createCustomerAdmin(saasCustomerAdminData: any) {
    try {
      const result = await this.saasCustomerAdminmodel.create(saasCustomerAdminData);
      console.log('User created successfully:', result);
      return result;
    } catch (e) {
      console.error('Error creating user:', e);
      throw new HttpException('Creating user failed: ' + e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findByEmail(email: string): Promise<SaasCustomerAdminDocument | null> {
    try {
      return await this.saasCustomerAdminmodel.findOne({ email });
    } catch (e) {
      console.error('Error finding user by email:', e);
      return null;
    }
  }

  async findAll(): Promise<SaasCustomerAdminDocument[]> {
    try {
      return await this.saasCustomerAdminmodel.find().exec();
    } catch (e) {
      console.error('Error finding all users:', e);
      return [];
    }
  }

  async findById(id: string): Promise<SaasCustomerAdminDocument | null> {
    try {
      return await this.saasCustomerAdminmodel.findById(id).exec();
    } catch (e) {
      console.error('Error finding user by ID:', e);
      return null;
    }
  }

  async updateById(id: string, updateData: any): Promise<SaasCustomerAdminDocument | null> {
    try {
      return await this.saasCustomerAdminmodel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();
    } catch (e) {
      console.error('Error updating user:', e);
      return null;
    }
  }
}
