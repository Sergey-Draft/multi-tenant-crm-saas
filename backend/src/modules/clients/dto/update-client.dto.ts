import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateClientDto {
  @ApiPropertyOptional({ description: 'Имя клиента', example: 'Иван Петров' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Email клиента', example: 'ivan@example.com', format: 'email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Телефон клиента', example: '+7 999 000 00 00' })
  @IsOptional()
  @IsString()
  phone?: string;
}
