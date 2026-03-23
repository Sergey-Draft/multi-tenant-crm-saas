import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async create(dto: CreateClientDto, companyId: string, userId?: string) {
    const client = await this.prisma.client.create({
      data: {
        companyId,
        name: dto.name,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
      },
    });
    await this.auditLog.log({
      entityType: 'Client',
      entityId: client.id,
      action: 'CREATE',
      userId,
      companyId,
    });
    return client;
  }

  findAll(companyId: string) {
    return this.prisma.client.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, companyId },
      include: {
        leads: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    return client;
  }

  async update(id: string, companyId: string, dto: UpdateClientDto, userId?: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, companyId },
    });
    if (!client) throw new NotFoundException('Client not found');

    const updated = await this.prisma.client.update({
      where: { id },
      data: { ...dto },
    });
    await this.auditLog.log({
      entityType: 'Client',
      entityId: id,
      action: 'UPDATE',
      userId,
      companyId,
      metadata: dto as Record<string, unknown>,
    });
    return updated;
  }

  async remove(id: string, companyId: string, userId?: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, companyId },
    });

    if (!client) throw new NotFoundException('Client not found');

    await this.prisma.client.delete({
      where: { id },
    });
    await this.auditLog.log({
      entityType: 'Client',
      entityId: id,
      action: 'DELETE',
      userId,
      companyId,
    });

    return {
      status: 'ok',
      message: 'Client deleted successfully',
      id: id,
    };
  }
}
