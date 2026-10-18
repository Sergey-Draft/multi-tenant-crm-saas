import { ApiProperty } from '@nestjs/swagger';

export class LeadAiChatResponseDto {
  @ApiProperty({ description: 'Текст ответа ассистента' })
  reply!: string;

  @ApiProperty({
    description:
      'Предложенные действия (create_task, add_note, change_status). Не выполняются, пока пользователь не подтвердит.',
    example: [{ type: 'create_task', title: 'Отправить КП', deadline: '2026-10-20T07:00:00.000Z' }],
  })
  actions!: Record<string, unknown>[];
}
