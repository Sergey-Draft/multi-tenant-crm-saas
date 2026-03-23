import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Имя пользователя', example: 'Иван Петров', minLength: 2 })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ description: 'Email', example: 'ivan@example.com', format: 'email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Пароль', example: 'secret123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ description: 'Роль пользователя', enum: UserRole, enumName: 'UserRole', default: UserRole.EMPLOYEE })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
