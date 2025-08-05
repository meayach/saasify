import { UserRepository } from '@Data/user/repository/user.repository';
import { Injectable } from '@nestjs/common';
import { UserDTO } from '@Services/dto/user/user.dto';
import { UserServiceMapper } from '@Services/mappers/user/user-service.mapper';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository, private userMapper: UserServiceMapper) {}

  async getUserByUsername(username: string): Promise<UserDTO> {
    return this.userMapper.mapUserPOJOToUserDTO(
      await this.userRepository.getUserByUsername(username),
    );
  }
}
