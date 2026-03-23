import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'Заголовок задачи', example: 'Позвонить клиенту' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'UUID ответственного пользователя', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Статус задачи', enum: TaskStatus, enumName: 'TaskStatus' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ description: 'Дедлайн (ISO 8601)', example: '2025-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
