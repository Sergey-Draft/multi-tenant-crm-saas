import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum LeadStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  REJECTED = 'REJECTED',
}

export class CreateLeadDto {
  @IsString()
  title!: string;

  @IsString()
  clientId!: string;

  @IsOptional()
  @IsEnum(LeadStatus)
  status!: LeadStatus;

  @IsString()
  description!: string;

  @IsString()
  dateDue!: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}