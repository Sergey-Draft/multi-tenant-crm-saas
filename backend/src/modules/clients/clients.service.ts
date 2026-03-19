import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateClientDto, companyId: string) {
    return this.prisma.client.create({
      data: {
        companyId,
        name:  dto.name,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
      },
    });
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

  async update(id: string, companyId: string, dto: UpdateClientDto) {
    const client = await this.prisma.client.findFirst({
      where: { id, companyId },
    });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.client.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string, companyId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, companyId },
    });

    if (!client) throw new NotFoundException('Client not found');

    await this.prisma.client.delete({
      where: { id },
    });

    return {
      status: 'ok',
      message: 'Client deleted successfully',
      id: id,
    };
  }
}
