import {
  Controller, Get, Patch, Param, Body, UseGuards, Post,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Создать пользователя в компании' })
  @ApiResponse({ status: 201, description: 'Пользователь создан' })
  @ApiResponse({ status: 409, description: 'Email уже занят' })
  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() user) {
    return this.usersService.create(dto, user);
  }

  @ApiOperation({ summary: 'Список пользователей компании' })
  @ApiResponse({ status: 200, description: 'Массив пользователей' })
  @Get()
  findAll(@CurrentUser() user) {
    return this.usersService.findAll(user);
  }

  @ApiOperation({ summary: 'Пользователь по ID' })
  @ApiParam({ name: 'id', description: 'UUID пользователя', type: String })
  @ApiResponse({ status: 200, description: 'Данные пользователя' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.usersService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Обновить данные пользователя (name, email, isActive)' })
  @ApiParam({ name: 'id', description: 'UUID пользователя', type: String })
  @ApiResponse({ status: 200, description: 'Пользователь обновлён' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user) {
    return this.usersService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Сменить роль пользователя' })
  @ApiParam({ name: 'id', description: 'UUID пользователя', type: String })
  @ApiResponse({ status: 200, description: 'Роль изменена' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @Patch(':id/role')
  changeRole(@Param('id') id: string, @Body() dto: ChangeRoleDto, @CurrentUser() user) {
    return this.usersService.changeRole(id, dto, user);
  }
}
