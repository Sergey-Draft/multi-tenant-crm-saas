import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export enum LeadAiChatMode {
  CHAT = 'CHAT',
  SUMMARY = 'SUMMARY',
  NEXT_ACTION = 'NEXT_ACTION',
  DRAFT_EMAIL = 'DRAFT_EMAIL',
}

export class LeadAiChatMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @ApiProperty({ description: 'Текст сообщения' })
  @IsString()
  @MaxLength(12000)
  content!: string;
}

export class LeadAiChatDto {
  @ApiProperty({ enum: LeadAiChatMode, description: 'Режим ответа ассистента' })
  @IsEnum(LeadAiChatMode)
  mode!: LeadAiChatMode;

  @ApiProperty({ type: [LeadAiChatMessageDto], description: 'История; последнее — от пользователя' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LeadAiChatMessageDto)
  messages!: LeadAiChatMessageDto[];
}
