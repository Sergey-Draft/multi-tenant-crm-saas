import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { ChangeRoleDto } from './dto/change-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const roleHierarchy = {
  SUPER_ADMIN: 5,
  OWNER: 4,
  ADMIN: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /* =============================
     GET ALL USERS
  ============================== */
  async findAll(currentUser: any) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.user.findMany({
      where: { companyId: currentUser.companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /* =============================
     GET ONE USER
  ============================== */
  async findOne(id: string, currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found');

    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      user.companyId !== currentUser.companyId
    ) {
      throw new ForbiddenException();
    }

    return user;
  }

  /* =============================
     UPDATE USER DATA
  ============================== */
  async update(
    id: string,
    dto: UpdateUserDto,
    currentUser: any,
  ) {
    const target = await this.findOne(id, currentUser);

    // Нельзя редактировать равного или выше
    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      roleHierarchy[currentUser.role] <=
        roleHierarchy[target.role]
    ) {
      throw new ForbiddenException(
        'Cannot modify user with equal or higher role',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  /* =============================
     CHANGE ROLE
  ============================== */
  async changeRole(
    id: string,
    dto: ChangeRoleDto,
    currentUser: any,
  ) {
    const target = await this.findOne(id, currentUser);

    if (currentUser.id === target.id) {
      throw new ForbiddenException(
        'You cannot change your own role',
      );
    }

    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      roleHierarchy[currentUser.role] <=
        roleHierarchy[target.role]
    ) {
      throw new ForbiddenException(
        'Cannot change role of equal or higher user',
      );
    }

    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      roleHierarchy[currentUser.role] <=
        roleHierarchy[dto.role]
    ) {
      throw new ForbiddenException(
        'Cannot promote user to equal or higher role',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
    });
  }

  /* =============================
     DEACTIVATE USER
  ============================== */
  // async deactivate(id: string, currentUser: any) {
  //   const target = await this.findOne(id, currentUser);

  //   if (
  //     currentUser.role !== UserRole.SUPER_ADMIN &&
  //     roleHierarchy[currentUser.role] <=
  //       roleHierarchy[target.role]
  //   ) {
  //     throw new ForbiddenException();
  //   }

  //   return this.prisma.user.update({
  //     where: { id },
  //     data: { isActive: false },
  //   });
  // }
}