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
}
