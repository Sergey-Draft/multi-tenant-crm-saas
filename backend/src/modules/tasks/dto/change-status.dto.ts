import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeTaskStatusDto {
  @ApiProperty({
    description: 'Новый статус задачи',
    enum: TaskStatus,
    enumName: 'TaskStatus',
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}
