import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ChangeTaskStatusDto } from './dto/change-status.dto';
import { UserRole, TaskStatus, Prisma, $Enums } from '@prisma/client';

interface AssignedUser {
  id: string;
  createdAt: Date;
  companyId: string;
  email: string;
  password: string;
  role: $Enums.UserRole;
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto, user: any) {
 
    let assignedUser: AssignedUser | null;

    if (dto.assignedToId) {
      assignedUser = await this.prisma.user.findFirst({
        where: {
          id: dto.assignedToId,
          companyId: user.companyId,
        },
      });

      if (!assignedUser) {
        throw new BadRequestException('Invalid assigned user');
      }

      // EMPLOYEE может назначать только себе
      if (user.role === UserRole.EMPLOYEE && dto.assignedToId !== user.userId) {
        throw new ForbiddenException(
          'Employees can assign tasks only to themselves',
        );
      }

      // Нельзя назначать OWNER
      if (assignedUser.role === UserRole.OWNER) {
        throw new ForbiddenException('Cannot assign task to OWNER');
      }

      // MANAGER не может назначать ADMIN
      if (
        user.role === UserRole.MANAGER &&
        assignedUser.role === UserRole.ADMIN
      ) {
        throw new ForbiddenException('Manager cannot assign task to ADMIN');
      }
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        leadId: dto.leadId,
        assignedToId: dto.assignedToId,
        createdById: user.userId,
        companyId: user.companyId,
      },
    });
  }

  async findAll(user: any) {
    if (user.role === UserRole.EMPLOYEE) {
      // сотрудник видит только свои
      return this.prisma.task.findMany({
        where: {
          companyId: user.companyId,
          assignedToId: user.userId,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // остальные видят всё
    return this.prisma.task.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
    });
  }


  async findOne(id: string, user: any) {
    const task = await this.prisma.task.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!task) throw new NotFoundException('Task not found');

    if (user.role === UserRole.EMPLOYEE && task.assignedToId !== user.userId) {
      throw new ForbiddenException();
    }

    return task;
  }


  async update(id: string, dto: UpdateTaskDto, user: any) {
    const task = await this.findOne(id, user);

    // EMPLOYEE может редактировать только свои
    if (user.role === UserRole.EMPLOYEE && task.assignedToId !== user.userId) {
      throw new ForbiddenException();
    }

    const data: Prisma.TaskUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.deadline !== undefined) data.deadline = new Date(dto.deadline);
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async changeStatus(id: string, dto: ChangeTaskStatusDto, user: any) {
    const task = await this.findOne(id, user);

    console.log('task', task)

    // EMPLOYEE меняет только свои
    if (user.role === UserRole.EMPLOYEE && task.assignedToId !== user.userId) {
      throw new ForbiddenException();
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: dto.status as TaskStatus,
      },
    });
  }

  async remove(id: string, user: any) {
    const task = await this.findOne(id, user);

    if (user.role === UserRole.EMPLOYEE) {
      throw new ForbiddenException('Employees cannot delete tasks');
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return {
      status: 'ok',
      message: 'Task deleted successfully',
      id: id,
    };

  }
}
