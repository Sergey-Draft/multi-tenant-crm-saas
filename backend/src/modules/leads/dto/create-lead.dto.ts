import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum LeadStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  REJECTED = 'REJECTED',
}

export class CreateLeadDto {
  @ApiProperty({ description: 'Заголовок лида', example: 'Заявка с сайта' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'UUID клиента', example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  @IsString()
  clientId!: string;

  @ApiProperty({ description: 'Описание', example: 'Клиент хочет купить товар X' })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Срок исполнения (ISO 8601)', example: '2025-12-31T23:59:59.000Z' })
  @IsString()
  dateDue!: string;

  @ApiPropertyOptional({
    description: 'Статус лида',
    enum: LeadStatus,
    enumName: 'LeadStatus',
    default: LeadStatus.NEW,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'UUID ответственного пользователя', format: 'uuid' })
  @IsOptional()
  @IsString()
  assignedToId?: string;
}
