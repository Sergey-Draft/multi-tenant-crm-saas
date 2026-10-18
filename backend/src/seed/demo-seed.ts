import 'dotenv/config';
import { createHash, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  LeadStatus,
  Prisma,
  PrismaClient,
  TaskStatus,
  UserRole,
} from '@prisma/client';
import {
  DEMO_INDUSTRIES,
  DemoIndustry,
  GENERIC_NOTES,
  Rand,
  RoleKey,
} from './demo-data';

const DEMO_DOMAIN = 'demo.crm';
const DAY = 24 * 60 * 60 * 1000;

const ROLE_BY_KEY: Record<RoleKey, UserRole> = {
  owner: UserRole.OWNER,
  admin: UserRole.ADMIN,
  manager: UserRole.MANAGER,
  employee: UserRole.EMPLOYEE,
};

function stableUuid(key: string): string {
  const h = createHash('sha1').update(key).digest('hex');
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    '5' + h.slice(13, 16),
    ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16) + h.slice(17, 20),
    h.slice(20, 32),
  ].join('-');
}

class SeededRand implements Rand {
  private state: number;

  constructor(seed: string) {
    this.state = parseInt(createHash('sha1').update(seed).digest('hex').slice(0, 8), 16);
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  shuffle<T>(items: T[]): T[] {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

function demoEmail(role: RoleKey, slug: string) {
  return `${role}_${slug}@${DEMO_DOMAIN}`;
}

function phone(r: SeededRand) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `+375 (${r.pick([29, 33, 44, 25])}) ${r.int(200, 999)}-${pad(r.int(0, 99))}-${pad(r.int(0, 99))}`;
}

function pickStatus(r: SeededRand): LeadStatus {
  const x = r.next();
  if (x < 0.3) return LeadStatus.NEW;
  if (x < 0.55) return LeadStatus.IN_PROGRESS;
  if (x < 0.85) return LeadStatus.DONE;
  return LeadStatus.REJECTED;
}

async function seedIndustry(
  prisma: PrismaClient,
  ind: DemoIndustry,
  passwordHash: string,
  now: number,
) {
  const r = new SeededRand(`demo:${ind.slug}`);
  const companyId = stableUuid(`demo-company:${ind.slug}`);

  const at = (daysAgo: number, hour = r.int(9, 18)) => {
    const d = new Date(now - daysAgo * DAY);
    if (daysAgo >= 1) d.setHours(hour, r.int(0, 59), 0, 0);
    return d;
  };
  const inDays = (days: number) => new Date(now + days * DAY);
  const between = (from: Date, to: Date) =>
    new Date(from.getTime() + r.next() * (to.getTime() - from.getTime()));

  const roleKeys = Object.keys(ind.users) as RoleKey[];
  const emails = roleKeys.map((k) => demoEmail(k, ind.slug));

  const clients: Prisma.ClientCreateManyInput[] = [];
  const leads: Prisma.LeadCreateManyInput[] = [];
  const tasks: Prisma.TaskCreateManyInput[] = [];
  const notes: Prisma.LeadNoteCreateManyInput[] = [];
  const audit: Prisma.AuditLogCreateManyInput[] = [];

  return prisma.$transaction(
    async (tx) => {
      await tx.company.upsert({
        where: { id: companyId },
        create: { id: companyId, name: ind.companyName, plan: 'FREE', createdAt: at(150) },
        update: { name: ind.companyName },
      });

      await tx.leadNote.deleteMany({ where: { companyId } });
      await tx.leadAiAnalysis.deleteMany({ where: { companyId } });
      await tx.task.deleteMany({ where: { companyId } });
      await tx.lead.deleteMany({ where: { companyId } });
      await tx.client.deleteMany({ where: { companyId } });
      await tx.auditLog.deleteMany({ where: { companyId } });
      await tx.user.deleteMany({ where: { companyId, email: { notIn: emails } } });

      const userId = {} as Record<RoleKey, string>;
      for (const key of roleKeys) {
        const email = demoEmail(key, ind.slug);
        const data = {
          password: passwordHash,
          name: ind.users[key],
          role: ROLE_BY_KEY[key],
          companyId,
        };
        const user = await tx.user.upsert({
          where: { email },
          create: { id: stableUuid(`demo-user:${email}`), email, createdAt: at(140), ...data },
          update: data,
        });
        userId[key] = user.id;
      }

      const clientIds = ind.clients.map((c) => {
        const id = randomUUID();
        const createdAt = at(r.int(95, 135));
        clients.push({
          id,
          name: c.name,
          email: c.email ?? null,
          phone: phone(r),
          companyId,
          createdAt,
          updatedAt: createdAt,
        });
        audit.push({
          entityType: 'Client',
          entityId: id,
          action: 'CREATE',
          userId: userId.manager,
          companyId,
          createdAt,
        });
        return id;
      });

      const addLeadAudit = (id: string, status: LeadStatus, createdAt: Date, updatedAt: Date) => {
        audit.push({ entityType: 'Lead', entityId: id, action: 'CREATE', userId: userId.manager, companyId, createdAt });
        if (status === LeadStatus.DONE || status === LeadStatus.REJECTED) {
          audit.push({
            entityType: 'Lead',
            entityId: id,
            action: 'UPDATE',
            userId: userId.manager,
            companyId,
            metadata: { status },
            createdAt: updatedAt,
          });
        }
      };

      for (const story of ind.stories) {
        const id = randomUUID();
        const createdAt = at(story.createdDaysAgo);
        const updatedAt = at(Math.min(...story.notes.map((n) => n.daysAgo)));
        leads.push({
          id,
          title: story.title,
          description: story.description,
          status: LeadStatus.IN_PROGRESS,
          dateDue: inDays(story.dueInDays),
          clientId: clientIds[story.client],
          companyId,
          assignedToId: userId[story.assignee],
          createdAt,
          updatedAt,
        });
        addLeadAudit(id, LeadStatus.IN_PROGRESS, createdAt, updatedAt);
        for (const n of story.notes) {
          notes.push({ leadId: id, companyId, authorId: userId[n.by], text: n.text, createdAt: at(n.daysAgo) });
        }
        for (const t of story.tasks) {
          tasks.push({
            title: t.title,
            status: t.status,
            deadline: t.dueInDays === null ? null : inDays(t.dueInDays),
            companyId,
            leadId: id,
            assignedToId: userId[t.to],
            createdById: userId.manager,
            createdAt,
            updatedAt,
          });
        }
      }

      const usedTitles = new Set(ind.stories.map((s) => s.title));
      const leadCount = r.int(30, 40) - ind.stories.length;
      const assignees: RoleKey[] = ['manager', 'manager', 'manager', 'employee', 'admin'];

      for (let i = 0; i < leadCount; i++) {
        let clientIdx = 0;
        let service = ind.services[0];
        let title = '';
        do {
          clientIdx = r.int(0, ind.clients.length - 1);
          service = r.pick(ind.services);
          title = service.title(ind.clients[clientIdx].about);
        } while (usedTitles.has(title));
        usedTitles.add(title);

        const status = pickStatus(r);
        let createdAt: Date;
        let updatedAt: Date;
        let dateDue: Date;
        switch (status) {
          case LeadStatus.NEW:
            createdAt = at(r.int(0, 10));
            updatedAt = createdAt;
            dateDue = inDays(r.int(5, 30));
            break;
          case LeadStatus.IN_PROGRESS:
            createdAt = at(r.int(10, 45));
            updatedAt = between(createdAt, new Date(now));
            dateDue = inDays(r.int(-4, 25));
            break;
          case LeadStatus.DONE:
            createdAt = at(r.int(15, 90));
            updatedAt = new Date(Math.min(createdAt.getTime() + r.int(3, 20) * DAY, now));
            dateDue = new Date(updatedAt.getTime() + r.int(0, 5) * DAY);
            break;
          default:
            createdAt = at(r.int(8, 80));
            updatedAt = new Date(Math.min(createdAt.getTime() + r.int(2, 10) * DAY, now));
            dateDue = new Date(createdAt.getTime() + r.int(7, 21) * DAY);
        }

        const id = randomUUID();
        const assignee = r.pick(assignees);
        leads.push({
          id,
          title,
          description: service.description(ind.clients[clientIdx].about, r),
          status,
          dateDue,
          clientId: clientIds[clientIdx],
          companyId,
          assignedToId: assignee === 'admin' && r.chance(0.5) ? null : userId[assignee],
          createdAt,
          updatedAt,
        });
        addLeadAudit(id, status, createdAt, updatedAt);

        const taskCount =
          status === LeadStatus.IN_PROGRESS
            ? r.int(1, 3)
            : status === LeadStatus.NEW
              ? r.int(0, 1)
              : status === LeadStatus.DONE
                ? r.int(1, 2)
                : r.int(0, 1);
        const taskTitles = r.shuffle(ind.leadTasks).slice(0, taskCount);
        for (const taskTitle of taskTitles) {
          let taskStatus: TaskStatus = TaskStatus.DONE;
          let deadline = between(createdAt, updatedAt);
          if (status === LeadStatus.NEW) {
            taskStatus = TaskStatus.TODO;
            deadline = inDays(r.int(1, 7));
          } else if (status === LeadStatus.IN_PROGRESS) {
            taskStatus = r.pick([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]);
            deadline = taskStatus === TaskStatus.DONE ? between(createdAt, new Date(now)) : inDays(r.int(-3, 10));
          }
          tasks.push({
            title: taskTitle,
            status: taskStatus,
            deadline,
            companyId,
            leadId: id,
            assignedToId: userId[r.pick<RoleKey>(['manager', 'employee'])],
            createdById: userId[r.pick<RoleKey>(['manager', 'admin'])],
            createdAt,
            updatedAt: taskStatus === TaskStatus.DONE ? deadline : createdAt,
          });
        }

        const noteChance = status === LeadStatus.REJECTED ? 0.9 : status === LeadStatus.IN_PROGRESS ? 0.5 : 0.3;
        if (r.chance(noteChance)) {
          const pool = GENERIC_NOTES[status];
          const count = status === LeadStatus.IN_PROGRESS ? r.int(1, 2) : 1;
          const texts = r.shuffle([...pool]).slice(0, count);
          texts.forEach((text, idx) => {
            const noteAt =
              status === LeadStatus.REJECTED || status === LeadStatus.DONE
                ? updatedAt
                : between(createdAt, new Date(now - (count - idx) * 3600 * 1000));
            notes.push({ leadId: id, companyId, authorId: userId[assignee], text, createdAt: noteAt });
          });
        }
      }

      ind.standaloneTasks.forEach((title, i) => {
        const createdAt = at(r.int(2, 20));
        const status = i === ind.standaloneTasks.length - 1 ? TaskStatus.DONE : r.pick([TaskStatus.TODO, TaskStatus.IN_PROGRESS]);
        tasks.push({
          title,
          status,
          deadline: status === TaskStatus.DONE ? at(r.int(0, 1)) : inDays(r.int(-2, 14)),
          companyId,
          assignedToId: userId[r.pick<RoleKey>(['admin', 'employee', 'manager'])],
          createdById: userId.owner,
          createdAt,
          updatedAt: createdAt,
        });
      });

      await tx.client.createMany({ data: clients });
      await tx.lead.createMany({ data: leads });
      await tx.task.createMany({ data: tasks });
      await tx.leadNote.createMany({ data: notes });
      await tx.auditLog.createMany({ data: audit });

      return {
        company: ind.companyName,
        clients: clients.length,
        leads: leads.length,
        tasks: tasks.length,
        notes: notes.length,
      };
    },
    { timeout: 120_000, maxWait: 20_000 },
  );
}

async function seedSuperAdmin(prisma: PrismaClient, now: number) {
  const email = process.env.SEED_SUPERADMIN_EMAIL?.trim();
  const password = process.env.SEED_SUPERADMIN_PASSWORD;
  if (!email || !password) return null;

  const companyId = stableUuid('demo-company:platform');
  await prisma.company.upsert({
    where: { id: companyId },
    create: { id: companyId, name: 'Draft CRM', plan: 'FREE', createdAt: new Date(now - 150 * DAY) },
    update: {},
  });
  const data = {
    password: await bcrypt.hash(password, 10),
    name: 'Super Admin',
    role: UserRole.SUPER_ADMIN,
  };
  await prisma.user.upsert({
    where: { email },
    create: { email, companyId, ...data },
    update: data,
  });
  return email;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const password = process.env.SEED_DEMO_PASSWORD || 'demo1234';
  const passwordHash = await bcrypt.hash(password, 10);
  const now = Date.now();

  try {
    for (const ind of DEMO_INDUSTRIES) {
      const res = await seedIndustry(prisma, ind, passwordHash, now);
      console.log(
        `${res.company}: ${res.clients} clients, ${res.leads} leads, ${res.tasks} tasks, ${res.notes} notes`,
      );
    }
    const superAdmin = await seedSuperAdmin(prisma, now);

    console.log(`\nDemo logins (password: ${password}):`);
    for (const ind of DEMO_INDUSTRIES) {
      const list = (Object.keys(ind.users) as RoleKey[]).map((k) => demoEmail(k, ind.slug));
      console.log(`  ${ind.companyName}: ${list.join(', ')}`);
    }
    if (superAdmin) console.log(`  Super admin: ${superAdmin}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
