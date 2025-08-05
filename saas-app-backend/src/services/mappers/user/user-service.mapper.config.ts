import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, createMap, forMember, mapFrom } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { UserDTO } from '@Services/dto/user/user.dto';
import { UserPOJO } from '@Data/models/user/user.pojo.model';
import { CustomerSignUpDTO } from '@Services/dto/user/customer.dto';

@Injectable()
export class UserServiceMapperConfig extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        UserPOJO,
        UserDTO,
        forMember(
          (destination) => destination.saasWorkspace.realmId,
          mapFrom((source) => source.workspace.realmId),
        ),
      );
      createMap(mapper, CustomerSignUpDTO, UserPOJO);
    };
  }
}
