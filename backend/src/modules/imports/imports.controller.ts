import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ImportsService } from './imports.service';
import { CreateImportDto } from './dto/create-import.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('imports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('jobs')
  async createJob(@Body() body: CreateImportDto, @CurrentUser() user) {
    const job = await this.importsService.createJob(body, user.companyId, user.userId);
    return { message: 'Job created', job };
  }

  @Get('jobs/:id')
  async getJob(@Param('id') id: string, @CurrentUser() user) {
    const job = await this.importsService.getJob(id, user.companyId);
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
  async getRecentJobs(@CurrentUser() user) {
    const jobs = await this.importsService.getRecentJobs(user.companyId);
    return { jobs };
  }
}
