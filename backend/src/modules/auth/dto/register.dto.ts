import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}
