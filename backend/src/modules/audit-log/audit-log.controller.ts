import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditLogService, AuditEntityType, AuditAction } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('audit-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @ApiOperation({ summary: 'Список логов аудита с пагинацией и фильтрами' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Страница (по умолчанию 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Записей на странице (по умолчанию 20, макс 100)' })
  @ApiQuery({ name: 'entityType', required: false, enum: ['Lead', 'Client', 'Task'] })
  @ApiQuery({ name: 'action', required: false, enum: ['CREATE', 'UPDATE', 'DELETE'] })
  @ApiResponse({ status: 200, description: 'Список логов' })
  @Get()
  findAll(
    @CurrentUser() user: { companyId: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entityType') entityType?: AuditEntityType,
    @Query('action') action?: AuditAction,
  ) {
    return this.auditLogService.findAll(user.companyId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      entityType,
      action,
    });
  }
}
