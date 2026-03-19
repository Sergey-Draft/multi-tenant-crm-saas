import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Название компании',
    example: 'ООО Рога и Копыта',
    required: true,
  })
  @IsNotEmpty()
  companyName!: string;

  @ApiProperty({
    description: 'Имя пользователяч',
    example: 'Василий Иванов',
    required: true,
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({
    description: 'Email',
    example: 'vasyliy.Ivanov@mail.com',
    required: true,
    format: 'email',
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email!: string;

  @ApiProperty({
    description: 'Пароль',
    example: 'secrePassword123',
    required: true,
    minLength: 6,
  })
  @MinLength(6)
  password!: string;

  @ApiProperty({
    description: 'Роль пользователя',
    example: UserRole.EMPLOYEE,
    required: true,
    enum: UserRole,
    enumName: 'UserRole',
  })
  @IsEnum(UserRole)
  role!: UserRole;
}
