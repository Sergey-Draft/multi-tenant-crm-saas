import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type AuditEntityType = 'Lead' | 'Client' | 'Task';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLogParams {
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  userId?: string;
  companyId: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(params: AuditLogParams): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        userId: params.userId ?? null,
        companyId: params.companyId,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findAll(
    companyId: string,
    options?: {
      page?: number;
      limit?: number;
      entityType?: AuditEntityType;
      action?: AuditAction;
    },
  ) {
    const page = options?.page ?? 1;
    const limit = Math.min(options?.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (options?.entityType) where.entityType = options.entityType;
    if (options?.action) where.action = options.action;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
