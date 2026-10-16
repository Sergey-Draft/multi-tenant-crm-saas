import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLeadNoteDto {
  @ApiProperty({
    description: 'Текст заметки (итоги звонка, договорённости)',
    example: 'Созвонились, клиент ждёт КП до пятницы',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text!: string;
}
