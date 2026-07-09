import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { CreateImportDto } from './dto/create-import.dto';

@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('jobs')
  async createJob(@Body() body: CreateImportDto) {
    const job = await this.importsService.createJob(body);
    return { message: 'Job created', job };
  }

  @Get('jobs/:id')
  async getJob(@Param('id') id: string) {
    const job = await this.importsService.getJob(id);
    return { message: 'Job found', job };
  }

  @Get('system-status')
  async getSystemStatus() {
    const system = await this.importsService.getSystemStatus();
    return { system };
  }

  @Get('queue-metrics')
  async getQueueMetrics() {
    const metrics = await this.importsService.getQueueMetrics();
    return { metrics };
  }

  @Get('jobs')
  async getRecentJobs() {
    const jobs = await this.importsService.getRecentJobs();
    return { jobs };
  }
}
