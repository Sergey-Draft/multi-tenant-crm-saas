import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      clientsTotal,
      leadsInProgress,
      leadsClosedThisMonth,
      tasksTodo,
      countNew,
      countInProgress,
      countDone,
      countRejected,
      recentLeads,
    ] = await this.prisma.$transaction([

      this.prisma.client.count({ where: { companyId } }),

      this.prisma.lead.count({ where: { companyId, status: 'IN_PROGRESS' } }),

      this.prisma.lead.count({
        where: { companyId, status: 'DONE', updatedAt: { gte: startOfMonth } },
      }),

      this.prisma.task.count({ where: { companyId, status: 'TODO' } }),

      // Отдельный count на каждый статус — для графика
      this.prisma.lead.count({ where: { companyId, status: 'NEW' } }),
      this.prisma.lead.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.lead.count({ where: { companyId, status: 'DONE' } }),
      this.prisma.lead.count({ where: { companyId, status: 'REJECTED' } }),

      this.prisma.lead.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { client: { select: { name: true } } },
      }),
    ]);

    const leadsByStatus = [
      { status: 'NEW',         label: 'Новый',     count: countNew },
      { status: 'IN_PROGRESS', label: 'В работе',  count: countInProgress },
      { status: 'DONE',        label: 'Готово',    count: countDone },
      { status: 'REJECTED',    label: 'Отклонён',  count: countRejected },
    ];

    return {
      clientsTotal,
      leadsInProgress,
      leadsClosedThisMonth,
      tasksTodo,
      leadsByStatus,
      recentLeads,
    };
  }
}
