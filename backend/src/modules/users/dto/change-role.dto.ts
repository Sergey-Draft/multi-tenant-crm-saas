import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeRoleDto {
  @ApiProperty({
    description: 'Новая роль пользователя',
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.MANAGER,
  })
  @IsEnum(UserRole)
  role!: UserRole;
}
