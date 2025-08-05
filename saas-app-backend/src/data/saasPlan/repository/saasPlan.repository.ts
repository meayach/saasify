import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SaasPlanDocument, SaasPlanPOJO } from '@Data/models/saasPlan/saasPlan.pojo.model';

@Injectable()
export class SaasPlanRepository {
  constructor(
    @InjectModel(SaasPlanPOJO.name)
    private saasPlanModel: Model<SaasPlanDocument>,
  ) {}
}
