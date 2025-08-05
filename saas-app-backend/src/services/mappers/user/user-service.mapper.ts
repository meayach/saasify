import { Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { UserPOJO } from '@Data/models/user/user.pojo.model';
import { UserDTO } from '@Services/dto/user/user.dto';

@Injectable()
export class UserServiceMapper {
  constructor(@InjectMapper() private readonly classMapper: Mapper) {}

  mapUserPOJOToUserDTO(userPOJO: UserPOJO): any {
    // return this.classMapper.map(userPOJO, UserPOJO, UserDTO);
  }
}
