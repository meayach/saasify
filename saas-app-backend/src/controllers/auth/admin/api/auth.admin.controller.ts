import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthCustomerService } from '@Services/security/auth/customer/auth-customer.service';
import { AUTH_ADMIN_API_PATHS } from '../api-paths/auth-admin-api-paths';
import { CustomerControllerMapper } from '@Controllers/mappers/user/customer/customer.mapper';
import { CustomerSignUpWO } from '@Controllers/wo/customer-signup.wo';

@Controller(AUTH_ADMIN_API_PATHS.ROOT_PATH)
export class AuthAdminController {
  constructor(
    private readonly authCustomerService: AuthCustomerService,
    private readonly customerControllerMapper: CustomerControllerMapper,
  ) {}

  @Post(AUTH_ADMIN_API_PATHS.SIGNUP_PATH)
  async signupAdmin(@Body() customerSignUpWO: CustomerSignUpWO) {
    const adminData = { ...customerSignUpWO, role: 'admin' };
    await this.authCustomerService.signup(
      this.customerControllerMapper.mapFromCustomerSignUpWOTOCustomerSignUpDTO(adminData),
    );
    throw new HttpException('Admin created successfully', HttpStatus.OK);
  }
}
