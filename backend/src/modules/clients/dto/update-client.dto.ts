import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateClientDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}