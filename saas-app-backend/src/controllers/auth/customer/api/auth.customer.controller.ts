import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthCustomerService } from '@Services/security/auth/customer/auth-customer.service';
import { AUTH_CUSTOMER_API_PATHS } from '../api-paths/auth-customer-api-paths';
import { CustomerControllerMapper } from '@Controllers/mappers/user/customer/customer.mapper';
import { CustomerSignUpWO } from '@Controllers/wo/customer-signup.wo';

@Controller(AUTH_CUSTOMER_API_PATHS.ROOT_PATH)
export class AuthCustomerController {
  constructor(
    private readonly authCustomerService: AuthCustomerService,
    private readonly customerControllerMapper: CustomerControllerMapper,
  ) {}

  @Post(AUTH_CUSTOMER_API_PATHS.SIGNUP_PATH)
  async signupCustomer(@Body() customerSignUpWO: CustomerSignUpWO) {
    await this.authCustomerService.signup(
      this.customerControllerMapper.mapFromCustomerSignUpWOTOCustomerSignUpDTO(customerSignUpWO),
    );
    throw new HttpException('success', HttpStatus.OK);
  }
}
