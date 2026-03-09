import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { ChangeRoleDto } from './dto/change-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

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


  async create(dto: CreateUserDto, currentUser: any) {

    // Только ADMIN / OWNER / SUPER_ADMIN
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.OWNER &&
      currentUser.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You cannot create users');
    }
  
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
  
    if (existing) {
      throw new ConflictException('User already exists');
    }
  
    const hash = await bcrypt.hash(dto.password, 10);
  
    const role = dto.role ?? UserRole.EMPLOYEE;
  
    // ADMIN не может создавать OWNER
    if (
      currentUser.role === UserRole.ADMIN &&
      role === UserRole.OWNER
    ) {
      throw new ForbiddenException('Admin cannot create OWNER');
    }
  
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        role,
        companyId: currentUser.companyId,
      },
    });
  
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }


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