import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ChangeLeadStatusDto } from './dto/change-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @ApiOperation({ summary: 'Создать лид' })
  @ApiResponse({ status: 201, description: 'Лид создан' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  @Post()
  create(@Body() dto: CreateLeadDto, @CurrentUser() user) {
    return this.leadsService.create(dto, user.companyId, user.userId);
  }

  @ApiOperation({ summary: 'Список лидов компании' })
  @ApiResponse({ status: 200, description: 'Массив лидов' })
  @Get()
  findAll(@CurrentUser() user) {
    return this.leadsService.findAll(user.companyId);
  }

  @ApiOperation({ summary: 'Лид по ID' })
  @ApiParam({ name: 'id', description: 'UUID лида', type: String })
  @ApiResponse({ status: 200, description: 'Данные лида' })
  @ApiResponse({ status: 404, description: 'Лид не найден' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.leadsService.findOne(id, user.companyId);
  }

  @ApiOperation({ summary: 'Обновить лид' })
  @ApiParam({ name: 'id', description: 'UUID лида', type: String })
  @ApiResponse({ status: 200, description: 'Лид обновлён' })
  @ApiResponse({ status: 404, description: 'Лид не найден' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto, @CurrentUser() user) {
    return this.leadsService.update(id, user.companyId, dto, user.userId);
  }

  @ApiOperation({ summary: 'Удалить лид' })
  @ApiParam({ name: 'id', description: 'UUID лида', type: String })
  @ApiResponse({ status: 200, description: 'Лид удалён' })
  @ApiResponse({ status: 404, description: 'Лид не найден' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.leadsService.remove(id, user.companyId, user.userId);
  }

  @ApiOperation({ summary: 'Сменить статус лида' })
  @ApiParam({ name: 'id', description: 'UUID лида', type: String })
  @ApiResponse({ status: 200, description: 'Статус обновлён' })
  @ApiResponse({ status: 404, description: 'Лид не найден' })
  @Patch('status/:id')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeLeadStatusDto, @CurrentUser() user) {
    return this.leadsService.changeStatus(id, user.companyId, dto);
  }
}
