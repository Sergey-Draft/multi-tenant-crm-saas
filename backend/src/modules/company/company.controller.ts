import {
  Body, Controller, Get, NotFoundException, Param, Post, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompanyController {
  constructor(private service: CompanyService) {}

  @ApiOperation({ summary: 'Создать компанию (только SUPER_ADMIN)' })
  @ApiResponse({ status: 201, description: 'Компания создана' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Список всех компаний (только SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Массив компаний' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Компания по ID (своя; SUPER_ADMIN — любая)' })
  @ApiParam({ name: 'id', description: 'UUID компании', type: String })
  @ApiResponse({ status: 200, description: 'Данные компании' })
  @ApiResponse({ status: 404, description: 'Компания не найдена' })
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user) {
    if (user.role !== UserRole.SUPER_ADMIN && id !== user.companyId) {
      throw new NotFoundException('Company not found');
    }

    const company = await this.service.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }
}
