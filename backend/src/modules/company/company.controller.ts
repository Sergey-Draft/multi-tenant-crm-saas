import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompanyController {
  constructor(private service: CompanyService) {}

  @ApiOperation({ summary: 'Создать компанию' })
  @ApiResponse({ status: 201, description: 'Компания создана' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Список всех компаний' })
  @ApiResponse({ status: 200, description: 'Массив компаний' })
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Компания по ID' })
  @ApiParam({ name: 'id', description: 'UUID компании', type: String })
  @ApiResponse({ status: 200, description: 'Данные компании' })
  @ApiResponse({ status: 404, description: 'Компания не найдена' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
