import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateLeadNoteDto } from './dto/create-lead-note.dto';

const NOTE_MODERATOR_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.OWNER,
  UserRole.ADMIN,
];

const NOTE_SELECT = {
  id: true,
  text: true,
  createdAt: true,
  author: { select: { id: true, name: true, email: true } },
} as const;

@Injectable()
export class LeadNotesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAll(leadId: string, companyId: string) {
    await this.ensureLead(leadId, companyId);

    return this.prisma.leadNote.findMany({
      where: { leadId, companyId },
      orderBy: { createdAt: 'desc' },
      select: NOTE_SELECT,
    });
  }

  async create(
    leadId: string,
    companyId: string,
    dto: CreateLeadNoteDto,
    userId?: string,
  ) {
    await this.ensureLead(leadId, companyId);

    const note = await this.prisma.leadNote.create({
      data: {
        leadId,
        companyId,
        authorId: userId ?? null,
        text: dto.text,
      },
      select: NOTE_SELECT,
    });
    await this.auditLog.log({
      entityType: 'LeadNote',
      entityId: note.id,
      action: 'CREATE',
      userId,
      companyId,
      metadata: { leadId },
    });
    return note;
  }

  async remove(
    leadId: string,
    noteId: string,
    companyId: string,
    user: { userId?: string; role?: UserRole },
  ) {
    const note = await this.prisma.leadNote.findFirst({
      where: { id: noteId, leadId, companyId },
      select: { id: true, authorId: true },
    });
    if (!note) throw new NotFoundException('Note not found');

    const isAuthor = !!user.userId && note.authorId === user.userId;
    const isModerator = !!user.role && NOTE_MODERATOR_ROLES.includes(user.role);
    if (!isAuthor && !isModerator) {
      throw new ForbiddenException('Only the author or an admin can delete this note');
    }

    await this.prisma.leadNote.delete({ where: { id: noteId } });
    await this.auditLog.log({
      entityType: 'LeadNote',
      entityId: noteId,
      action: 'DELETE',
      userId: user.userId,
      companyId,
      metadata: { leadId },
    });

    return { status: 'ok', id: noteId };
  }

  private async ensureLead(leadId: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
      select: { id: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');
  }
}
