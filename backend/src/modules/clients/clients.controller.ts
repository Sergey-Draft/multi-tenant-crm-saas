import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Создать клиента' })
  @ApiResponse({ status: 201, description: 'Клиент создан' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  @Post()
  create(@Body() dto: CreateClientDto, @CurrentUser() user) {
    return this.clientsService.create(dto, user.companyId);
  }

  @ApiOperation({ summary: 'Список клиентов компании' })
  @ApiResponse({ status: 200, description: 'Массив клиентов' })
  @Get()
  findAll(@CurrentUser() user) {
    return this.clientsService.findAll(user.companyId);
  }

  @ApiOperation({ summary: 'Клиент по ID' })
  @ApiParam({ name: 'id', description: 'UUID клиента', type: String })
  @ApiResponse({ status: 200, description: 'Данные клиента с лидами' })
  @ApiResponse({ status: 404, description: 'Клиент не найден' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.clientsService.findOne(id, user.companyId);
  }

  @ApiOperation({ summary: 'Обновить клиента' })
  @ApiParam({ name: 'id', description: 'UUID клиента', type: String })
  @ApiResponse({ status: 200, description: 'Клиент обновлён' })
  @ApiResponse({ status: 404, description: 'Клиент не найден' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto, @CurrentUser() user) {
    return this.clientsService.update(id, user.companyId, dto);
  }

  @ApiOperation({ summary: 'Удалить клиента' })
  @ApiParam({ name: 'id', description: 'UUID клиента', type: String })
  @ApiResponse({ status: 200, description: 'Клиент удалён' })
  @ApiResponse({ status: 404, description: 'Клиент не найден' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.clientsService.remove(id, user.companyId);
  }
}
