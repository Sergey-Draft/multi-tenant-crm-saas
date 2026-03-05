import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundError } from 'rxjs';
import { LeadStatus } from '@prisma/client';
import { addWeeks } from 'date-fns';
import { ChangeLeadStatusDto } from './dto/change-status.dto';


// TODO: duplicating leads when data the same

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLeadDto, companyId: string, userId?: string) {
    const client = await this.prisma.client.findFirst({
      where: {
        id: dto.clientId,
        companyId,
      },
    });

    if (!client) throw new NotFoundException('Client not found');


    let assignedToId = userId; 
    // Если в DTO указан assignedToId и он не пустой
    if (dto.assignedToId && dto.assignedToId.trim() !== '') {
      const assignedUser = await this.prisma.user.findFirst({
        where: {
          id: dto.assignedToId,
          companyId, 
        },
      });
      
      if (assignedUser) {
        assignedToId = dto.assignedToId;
      } else {
        // TODO: process this on the frontend
        console.log(`User ${dto.assignedToId} not found, assigning to current user ${userId}`);
        assignedToId = userId;
      }
    }

    const dateDue = dto.dateDue || addWeeks(new Date(), 2);
    return this.prisma.lead.create({
      data: {
        title: dto.title,
        status: dto.status as LeadStatus,
        clientId: dto.clientId,
        description: dto.description,
        dateDue: dateDue,
        companyId,
        assignedToId
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.lead.findMany({
      where: { companyId },
      include: {
        client: true,
        Task: {
          include: {
            assignedTo: {
              select: {
                id: true,
                email: true,
              }
            },
            createdBy: { 
              select: {
                id: true,
                email: true,
              }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: {
        client: true,
        Task: {
          include: {
            assignedTo: {  // Связь из модели Task и User. Подтягивает его данные из таблицы User@@
              select: {
                id: true,
                email: true,
              }
            },
            createdBy: { 
              select: {
                id: true,
                email: true,
              }
            }
          }
        },
      },
    });

    if (!lead) throw new NotFoundException('Lead not found');

    return lead;
  }

  async update(id: string, companyId: string, dto: UpdateLeadDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
    });

    if (!lead) throw new NotFoundException('Lead not found');

    const { clientId, ...rest } = dto;

    const data: any = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.dateDue !== undefined) data.dateDue = new Date(dto.dateDue);
    if (dto.dateDue !== undefined) data.assignedToId = dto.assignedToId;

    if (dto.clientId) {
      data.client = {
        connect: { id: dto.clientId },
      };
    }

    return this.prisma.lead.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
    });

    if (!lead) throw new NotFoundException('Lead not found');

    await this.prisma.lead.delete({
      where: { id },
    });

    return {
      status: 'ok',
      message: 'Lead deleted successfully',
      id: id,
    };
  }

  async changeStatus(id: string, companyId: string, dto: ChangeLeadStatusDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
    });

    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.lead.update({
      where: { id },
      data: { status: dto.status as LeadStatus },
    });
  }
}
