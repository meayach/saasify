import { Controller, Get, Post, Put, Delete, Patch, Body, Param } from '@nestjs/common';
import { ApplicationService } from './application.service';

export interface Application {
  _id?: string;
  name: string;
  status: 'active' | 'maintenance' | 'inactive';
  deployedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApplicationStats {
  totalApplications: number;
  activeApplications: number;
  deploymentsToday: number;
  maintenanceApplications: number;
}

@Controller('dashboard-applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get('stats')
  async getStats(): Promise<ApplicationStats> {
    return this.applicationService.getStats();
  }

  @Get()
  async findAll(): Promise<Application[]> {
    return this.applicationService.findAll();
  }

  @Post()
  async create(@Body() application: Partial<Application>): Promise<Application> {
    return this.applicationService.create(application);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() application: Partial<Application>,
  ): Promise<Application> {
    return this.applicationService.update(id, application);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() statusData: { isActive: boolean },
  ): Promise<Application> {
    const status = statusData.isActive ? 'active' : 'inactive';
    return this.applicationService.update(id, { status });
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.applicationService.delete(id);
  }
}
