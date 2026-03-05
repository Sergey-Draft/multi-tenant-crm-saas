import { IsEnum } from 'class-validator';
import { LeadStatus } from './create-lead.dto';

export class ChangeLeadStatusDto {
  @IsEnum(LeadStatus)
  status!: LeadStatus;
}