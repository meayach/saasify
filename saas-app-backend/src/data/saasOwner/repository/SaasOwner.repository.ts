import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SaasOwnerDocument, SaasOwnerPOJO } from '@Data/models/saasOwner/saasOwner.pojo.model';

@Injectable()
export class SaasOwnerRepository {
  constructor(
    @InjectModel(SaasOwnerPOJO.name)
    private saasOwnerModel: Model<SaasOwnerDocument>,
  ) {}
}
