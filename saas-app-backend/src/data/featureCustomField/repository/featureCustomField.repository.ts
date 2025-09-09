import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FeatureCustomFieldPOJO,
  FeatureCustomFieldDocument,
  FieldDataType,
  FieldUnit,
} from '../../models/featureCustomField/featureCustomField.pojo.model';

@Injectable()
export class FeatureCustomFieldRepository {
  constructor(
    @InjectModel(FeatureCustomFieldPOJO.name)
    private readonly featureCustomFieldModel: Model<FeatureCustomFieldDocument>,
  ) {}

  async create(fieldData: Partial<FeatureCustomFieldPOJO>): Promise<FeatureCustomFieldPOJO> {
    const field = new this.featureCustomFieldModel(fieldData);
    return field.save();
  }

  async findById(id: string | Types.ObjectId): Promise<FeatureCustomFieldPOJO | null> {
    return this.featureCustomFieldModel.findById(id).exec();
  }

  async findByFeature(featureId: string | Types.ObjectId): Promise<FeatureCustomFieldPOJO[]> {
    return this.featureCustomFieldModel
      .find({ featureId, isActive: true })
      .sort({ sortOrder: 1, fieldName: 1 })
      .exec();
  }

  async findByFeatureAndName(
    featureId: string | Types.ObjectId,
    fieldName: string,
  ): Promise<FeatureCustomFieldPOJO | null> {
    return this.featureCustomFieldModel.findOne({ featureId, fieldName, isActive: true }).exec();
  }

  async findByDataType(
    dataType: FieldDataType,
    featureId?: string | Types.ObjectId,
  ): Promise<FeatureCustomFieldPOJO[]> {
    const query: any = { dataType, isActive: true };
    if (featureId) {
      query.featureId = featureId;
    }

    return this.featureCustomFieldModel.find(query).sort({ sortOrder: 1, fieldName: 1 }).exec();
  }

  async findByUnit(
    unit: FieldUnit,
    featureId?: string | Types.ObjectId,
  ): Promise<FeatureCustomFieldPOJO[]> {
    const query: any = { unit, isActive: true };
    if (featureId) {
      query.featureId = featureId;
    }

    return this.featureCustomFieldModel.find(query).sort({ sortOrder: 1, fieldName: 1 }).exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateData: Partial<FeatureCustomFieldPOJO>,
  ): Promise<FeatureCustomFieldPOJO | null> {
    return this.featureCustomFieldModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.featureCustomFieldModel
      .findByIdAndUpdate(id, { isActive: false })
      .exec();
    return !!result;
  }

  async hardDelete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.featureCustomFieldModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findAll(
    filters: {
      isActive?: boolean;
      featureId?: string | Types.ObjectId;
      dataType?: FieldDataType;
      unit?: FieldUnit;
    } = {},
  ): Promise<FeatureCustomFieldPOJO[]> {
    const query: any = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.featureId) {
      query.featureId = filters.featureId;
    }

    if (filters.dataType) {
      query.dataType = filters.dataType;
    }

    if (filters.unit) {
      query.unit = filters.unit;
    }

    return this.featureCustomFieldModel.find(query).sort({ sortOrder: 1, fieldName: 1 }).exec();
  }

  async updateSortOrder(
    featureId: string | Types.ObjectId,
    sortUpdates: Array<{ id: string; sortOrder: number }>,
  ): Promise<boolean> {
    const bulkOps = sortUpdates.map((update) => ({
      updateOne: {
        filter: { _id: update.id, featureId },
        update: { $set: { sortOrder: update.sortOrder } },
      },
    }));

    const result = await this.featureCustomFieldModel.bulkWrite(bulkOps);
    return result.modifiedCount === sortUpdates.length;
  }
}
