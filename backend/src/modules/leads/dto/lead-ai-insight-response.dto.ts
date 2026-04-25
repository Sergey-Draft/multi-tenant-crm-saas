import { ApiProperty } from '@nestjs/swagger';

export class LeadAiInsightResponseDto {
  @ApiProperty({ description: 'Краткий итог по лиду' })
  summary: string;

  @ApiProperty({ description: 'Совет менеджеру: что написать / следующий шаг' })
  nextAction: string;

  @ApiProperty({ description: 'Черновик письма клиенту (без отправки)' })
  email: string;
}
