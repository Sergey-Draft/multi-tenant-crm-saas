import {
  Controller, Post, Get, Patch, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ChangeTaskStatusDto } from './dto/change-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @ApiOperation({ summary: 'Создать задачу' })
  @ApiResponse({ status: 201, description: 'Задача создана' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() user) {
    return this.tasksService.create(dto, user);
  }

  @ApiOperation({ summary: 'Список задач компании' })
  @ApiResponse({ status: 200, description: 'Массив задач' })
  @Get()
  findAll(@CurrentUser() user) {
    return this.tasksService.findAll(user);
  }

  @ApiOperation({ summary: 'Задача по ID' })
  @ApiParam({ name: 'id', description: 'UUID задачи', type: String })
  @ApiResponse({ status: 200, description: 'Данные задачи' })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.tasksService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Обновить задачу' })
  @ApiParam({ name: 'id', description: 'UUID задачи', type: String })
  @ApiResponse({ status: 200, description: 'Задача обновлена' })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user) {
    return this.tasksService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Сменить статус задачи' })
  @ApiParam({ name: 'id', description: 'UUID задачи', type: String })
  @ApiResponse({ status: 200, description: 'Статус обновлён' })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  @Patch('status/:id')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeTaskStatusDto, @CurrentUser() user) {
    return this.tasksService.changeStatus(id, dto, user);
  }

  @ApiOperation({ summary: 'Удалить задачу' })
  @ApiParam({ name: 'id', description: 'UUID задачи', type: String })
  @ApiResponse({ status: 200, description: 'Задача удалена' })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.tasksService.remove(id, user);
  }
}
