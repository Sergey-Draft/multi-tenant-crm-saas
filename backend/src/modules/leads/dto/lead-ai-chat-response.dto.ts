import { ApiProperty } from '@nestjs/swagger';

export class LeadAiChatResponseDto {
  @ApiProperty({ description: 'Текст ответа ассистента' })
  reply!: string;
}
