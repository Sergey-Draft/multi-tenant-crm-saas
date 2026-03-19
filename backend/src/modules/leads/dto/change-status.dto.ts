import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { LeadStatus } from './create-lead.dto';

export class ChangeLeadStatusDto {
  @ApiProperty({
    description: 'Новый статус лида',
    enum: LeadStatus,
    enumName: 'LeadStatus',
    example: LeadStatus.IN_PROGRESS,
  })
  @IsEnum(LeadStatus)
  status!: LeadStatus;
}
