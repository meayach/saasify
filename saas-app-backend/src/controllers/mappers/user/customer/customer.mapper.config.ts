import { CustomerSignUpWO } from '@Controllers/wo/customer-signup.wo';
import { CustomerSignUpDTO } from '@Services/dto/user/customer.dto';
import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerControllerMapperConfig extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, CustomerSignUpWO, CustomerSignUpDTO);
    };
  }
}
