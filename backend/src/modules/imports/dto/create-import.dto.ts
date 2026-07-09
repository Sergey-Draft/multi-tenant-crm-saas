import { IsArray, IsString } from 'class-validator';

export class CreateImportDto {
  @IsString()
  name: string;

  @IsArray()
  leadIds: number[];
}
