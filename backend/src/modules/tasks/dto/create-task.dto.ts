import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsUUID()
  @IsOptional()
  leadId?: string; // Привязка к Лиду, если есть

  @IsUUID()
  @IsOptional()
  assignedToId?: string; // Назначаемый сотрудник

  @IsDateString()
  @IsOptional()
  deadline?: string; // Дедлайн
}
