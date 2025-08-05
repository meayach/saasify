import { UserDocument, UserPOJO } from '@Data/models/user/user.pojo.model';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SaasWorkspacePOJO } from '@Data/models/saasworkspace/saasWorkspace.pojo.model';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(UserPOJO.name) private userModel: Model<UserDocument>) {}
  // save update delete get
  async saveUser(userPOJO: UserPOJO): Promise<UserPOJO> {
    const newUser = new this.userModel(userPOJO);
    return await newUser.save();
  }

  async getUserByUsername(username: string): Promise<UserPOJO> {
    return await this.userModel
      .findOne({ username: username })
      .populate('workspace', '', SaasWorkspacePOJO.name);
  }

  async getSubscriberByUsername(username: string): Promise<UserPOJO> {
    return await this.userModel
      .findOne({
        username: username,
      })
      .select('subscribers -_id')
      .populate({ path: 'subscriber' });
  }
}
