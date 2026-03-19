import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email пользователя', example: 'free@tut.by', format: 'email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Пароль', example: '123456', minLength: 6 })
  @MinLength(6)
  password!: string;
}
