import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthCustomerService } from '@Services/security/auth/customer/auth-customer.service';
import { AUTH_MANAGER_API_PATHS } from '../api-paths/auth-manager-api-paths';
import { CustomerControllerMapper } from '@Controllers/mappers/user/customer/customer.mapper';
import { CustomerSignUpWO } from '@Controllers/wo/customer-signup.wo';

@Controller(AUTH_MANAGER_API_PATHS.ROOT_PATH)
export class AuthManagerController {
  constructor(
    private readonly authCustomerService: AuthCustomerService,
    private readonly customerControllerMapper: CustomerControllerMapper,
  ) {}

  @Post(AUTH_MANAGER_API_PATHS.SIGNUP_PATH)
  async signupManager(@Body() customerSignUpWO: CustomerSignUpWO) {
    const managerData = { ...customerSignUpWO, role: 'manager' };
    await this.authCustomerService.signup(
      this.customerControllerMapper.mapFromCustomerSignUpWOTOCustomerSignUpDTO(managerData),
    );
    throw new HttpException('Manager created successfully', HttpStatus.OK);
  }
}
