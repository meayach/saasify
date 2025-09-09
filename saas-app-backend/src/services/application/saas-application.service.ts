import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaasApplication } from '../../data/models/saasApplication/saas-application.model';
import {
  CreateSaasApplicationDto,
  UpdateSaasApplicationDto,
  SaasApplicationResponseDto,
} from '../dto/saas-application.dto';

@Injectable()
export class SaasApplicationService {
  constructor(
    @InjectModel(SaasApplication.name) private applicationModel: Model<SaasApplication>,
  ) {}

  async create(
    ownerId: string,
    createApplicationDto: CreateSaasApplicationDto,
  ): Promise<SaasApplicationResponseDto> {
    // Check if application with slug already exists
    const existingApp = await this.applicationModel.findOne({ slug: createApplicationDto.slug });
    if (existingApp) {
      throw new ConflictException('Application with this slug already exists');
    }

    const createdApplication = new this.applicationModel({
      ...createApplicationDto,
      ownerId,
      defaultPlan: (createApplicationDto as any).defaultPlanId
        ? (createApplicationDto as any).defaultPlanId
        : undefined,
    });

    const savedApplication = await createdApplication.save();
    return this.mapToResponseDto(savedApplication);
  }

  async findAll(
    ownerId?: string,
    page = 1,
    limit = 10,
  ): Promise<{
    applications: SaasApplicationResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const filter = ownerId ? { ownerId } : {};

    const [applications, total] = await Promise.all([
      this.applicationModel.find(filter).skip(skip).limit(limit).exec(),
      this.applicationModel.countDocuments(filter).exec(),
    ]);

    return {
      applications: applications.map((app) => this.mapToResponseDto(app)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<SaasApplicationResponseDto> {
    const application = await this.applicationModel.findById(id).exec();
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return this.mapToResponseDto(application);
  }

  async findBySlug(slug: string): Promise<SaasApplicationResponseDto> {
    const application = await this.applicationModel.findOne({ slug }).exec();
    if (!application) {
      throw new NotFoundException(`Application with slug ${slug} not found`);
    }
    return this.mapToResponseDto(application);
  }

  async findByOwner(ownerId: string): Promise<SaasApplicationResponseDto[]> {
    const applications = await this.applicationModel.find({ ownerId }).exec();
    return applications.map((app) => this.mapToResponseDto(app));
  }

  async update(
    id: string,
    updateApplicationDto: UpdateSaasApplicationDto,
  ): Promise<SaasApplicationResponseDto> {
    const updatedApplication = await this.applicationModel
      .findByIdAndUpdate(id, updateApplicationDto, { new: true })
      .exec();

    if (!updatedApplication) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return this.mapToResponseDto(updatedApplication);
  }

  async remove(id: string): Promise<void> {
    const result = await this.applicationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
  }

  async launch(id: string): Promise<SaasApplicationResponseDto> {
    const application = await this.applicationModel
      .findByIdAndUpdate(
        id,
        {
          status: 'PRODUCTION',
          launchedAt: new Date(),
          deployedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return this.mapToResponseDto(application);
  }

  private mapToResponseDto(application: any): SaasApplicationResponseDto {
    return {
      id: application._id.toString(),
      name: application.name,
      description: application.description,
      status: application.status,
      type: application.type,
      ownerId: application.ownerId.toString(),
      slug: application.slug,
      logoUrl: application.logoUrl,
      websiteUrl: application.websiteUrl,
      apiUrl: application.apiUrl,
      defaultPlanId: application.defaultPlan ? application.defaultPlan.toString() : undefined,
      tags: application.tags,
      launchedAt: application.launchedAt,
      deployedAt: application.deployedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}
