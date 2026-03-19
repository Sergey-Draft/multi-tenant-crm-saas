import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Название компании', example: 'ООО Ромашка' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Тарифный план', example: 'basic' })
  @IsOptional()
  @IsString()
  plan?: string;
}
