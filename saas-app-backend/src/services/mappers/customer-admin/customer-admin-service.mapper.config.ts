import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, createMap, forMember, mapFrom } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { SaasCustomerAdminPOJO } from '@Data/models/saasCustomerAdmin/saasCustomerAdmin.pojo.model';
import { CustomerSignUpDTO } from '@Services/dto/user/customer.dto';
import { UserPOJO } from '@Data/models/user/user.pojo.model';

@Injectable()
export class CustomerAdminServiceMapperConfig extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, CustomerSignUpDTO, UserPOJO);
      createMap(mapper, CustomerSignUpDTO, SaasCustomerAdminPOJO);
    };
  }
}
