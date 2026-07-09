import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, LeadStatus, TaskStatus } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const COMPANY_ID = 'a9fc3836-3bd2-4517-b184-8b8d4f5fdfe0';

const clientsData = [
  { name: 'ООО «ТехноСтарт»', email: 'info@technostart.ru', phone: '+7 (495) 123-45-67' },
  { name: 'ИП Смирнов А.В.', email: 'smirnov@mail.ru', phone: '+7 (903) 555-12-34' },
  { name: 'АО «МегаТрейд»', email: 'sales@megatrade.com', phone: '+7 (812) 987-65-43' },
  { name: 'ЗАО «СтройПроект»', email: 'office@stroyproekt.ru', phone: '+7 (495) 777-88-99' },
  { name: 'ООО «ФинСервис»', email: 'hello@finservice.io', phone: '+7 (926) 111-22-33' },
  { name: 'ИП Козлова М.И.', email: 'kozlova@gmail.com', phone: '+7 (916) 444-55-66' },
  { name: 'ООО «ЛогистикПлюс»', email: 'contact@logplus.ru', phone: '+7 (343) 222-33-44' },
  { name: 'ПАО «ЭнергоХолдинг»', email: 'pr@energoholding.ru', phone: '+7 (495) 999-00-11' },
];

const leadsData: {
  title: string;
  description: string;
  status: LeadStatus;
  daysOffset: number;
  clientIndex: number;
}[] = [
  {
    title: 'Внедрение CRM для отдела продаж',
    description: 'Клиент хочет автоматизировать воронку продаж и интегрировать телефонию. Бюджет ~500 тыс. руб.',
    status: 'NEW',
    daysOffset: 14,
    clientIndex: 0,
  },
  {
    title: 'Доработка мобильного приложения',
    description: 'Нужен push-уведомления и офлайн-режим для каталога товаров. Срок — 2 месяца.',
    status: 'IN_PROGRESS',
    daysOffset: 21,
    clientIndex: 1,
  },
  {
    title: 'Аудит IT-инфраструктуры',
    description: 'Провести аудит серверов, сети и политик безопасности. Отчёт + рекомендации.',
    status: 'IN_PROGRESS',
    daysOffset: 7,
    clientIndex: 2,
  },
  {
    title: 'Разработка корпоративного портала',
    description: 'Внутренний портал с новостями, заявками в IT и базой знаний на 200+ сотрудников.',
    status: 'NEW',
    daysOffset: 30,
    clientIndex: 3,
  },
  {
    title: 'Интеграция с 1С:Бухгалтерия',
    description: 'Двусторонний обмен заказами и остатками между CRM и 1С. Есть ТЗ от клиента.',
    status: 'DONE',
    daysOffset: -3,
    clientIndex: 4,
  },
  {
    title: 'Настройка email-рассылок',
    description: 'Сегментация базы, шаблоны писем, A/B-тесты. Платформа — Unisender.',
    status: 'IN_PROGRESS',
    daysOffset: 10,
    clientIndex: 5,
  },
  {
    title: 'Миграция данных из Excel',
    description: 'Перенести ~15 000 контактов и историю сделок из таблиц в CRM. Нужна очистка дублей.',
    status: 'NEW',
    daysOffset: 5,
    clientIndex: 6,
  },
  {
    title: 'Обучение менеджеров работе в CRM',
    description: '2 воркшопа по 3 часа + видеоинструкции. Группа 12 человек.',
    status: 'DONE',
    daysOffset: -7,
    clientIndex: 0,
  },
  {
    title: 'Подключение IP-телефонии',
    description: 'Интеграция Mango Office: запись звонков, карточка клиента при входящем.',
    status: 'REJECTED',
    daysOffset: -14,
    clientIndex: 7,
  },
  {
    title: 'Дашборд аналитики для руководства',
    description: 'KPI по продажам, конверсия воронки, отчёты в Power BI. Еженедельное обновление.',
    status: 'IN_PROGRESS',
    daysOffset: 18,
    clientIndex: 2,
  },
  {
    title: 'Техподдержка на аутсорсе',
    description: 'SLA 4 часа, 50 рабочих мест. Контракт на 12 месяцев, старт с 1 апреля.',
    status: 'NEW',
    daysOffset: 25,
    clientIndex: 4,
  },
  {
    title: 'Редизайн сайта-визитки',
    description: 'Современный лендинг на Next.js, форма заявки в CRM, SEO-оптимизация.',
    status: 'NEW',
    daysOffset: 12,
    clientIndex: 1,
  },
  {
    title: 'Настройка ролей и прав доступа',
    description: 'Разграничение по отделам: продажи, маркетинг, бухгалтерия. 5 ролей.',
    status: 'IN_PROGRESS',
    daysOffset: 8,
    clientIndex: 3,
  },
];

const tasksWithLead: {
  title: string;
  status: TaskStatus;
  leadIndex: number;
  daysOffset?: number;
}[] = [
  { title: 'Подготовить коммерческое предложение', status: 'TODO', leadIndex: 0, daysOffset: 3 },
  { title: 'Созвон с техлидом клиента', status: 'IN_PROGRESS', leadIndex: 1, daysOffset: 2 },
  { title: 'Собрать чек-лист для аудита', status: 'IN_PROGRESS', leadIndex: 2, daysOffset: 5 },
  { title: 'Согласовать макеты портала', status: 'TODO', leadIndex: 3, daysOffset: 7 },
  { title: 'Передать документацию в 1С-интегратору', status: 'DONE', leadIndex: 4 },
  { title: 'Настроить тестовую рассылку', status: 'IN_PROGRESS', leadIndex: 5, daysOffset: 4 },
];

const tasksStandalone: {
  title: string;
  status: TaskStatus;
  daysOffset?: number;
}[] = [
  { title: 'Обновить прайс-лист в общей папке', status: 'TODO', daysOffset: 1 },
  { title: 'Проверить резервные копии сервера', status: 'IN_PROGRESS', daysOffset: 2 },
  { title: 'Подготовить отчёт за квартал', status: 'TODO', daysOffset: 10 },
  { title: 'Созвон с поставщиком хостинга', status: 'DONE' },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const company = await prisma.company.findUnique({ where: { id: COMPANY_ID } });
    if (!company) {
      throw new Error(`Company ${COMPANY_ID} not found`);
    }

    const users = await prisma.user.findMany({
      where: { companyId: COMPANY_ID },
      select: { id: true, role: true, name: true },
    });

    if (users.length === 0) {
      throw new Error(`No users found for company ${COMPANY_ID}`);
    }

    const creator =
      users.find((u) => u.role === 'OWNER' || u.role === 'ADMIN') ?? users[0];
    const assignees = users.filter((u) => u.role !== 'OWNER');

    const existingClients = await prisma.client.findMany({
      where: { companyId: COMPANY_ID },
    });

    const clientIds: string[] = [...existingClients.map((c) => c.id)];

    for (let i = clientIds.length; i < clientsData.length; i++) {
      const c = await prisma.client.create({
        data: { ...clientsData[i], companyId: COMPANY_ID },
      });
      clientIds.push(c.id);
    }

    const now = new Date();
    const createdLeads: { id: string; title: string; status: LeadStatus }[] = [];

    for (let i = 0; i < leadsData.length; i++) {
      const item = leadsData[i];
      const clientId = clientIds[item.clientIndex % clientIds.length];
      const assignee = assignees.length > 0 ? assignees[i % assignees.length] : null;

      const lead = await prisma.lead.create({
        data: {
          title: item.title,
          description: item.description,
          status: item.status,
          dateDue: addDays(now, item.daysOffset),
          clientId,
          companyId: COMPANY_ID,
          assignedToId: assignee?.id ?? null,
        },
      });
      createdLeads.push(lead);
    }

    const createdTasks: { id: string; title: string; status: TaskStatus; leadId: string | null }[] = [];

    for (let i = 0; i < tasksWithLead.length; i++) {
      const item = tasksWithLead[i];
      const assignee = assignees.length > 0 ? assignees[i % assignees.length] : null;

      const task = await prisma.task.create({
        data: {
          title: item.title,
          status: item.status,
          deadline: item.daysOffset != null ? addDays(now, item.daysOffset) : null,
          companyId: COMPANY_ID,
          leadId: createdLeads[item.leadIndex].id,
          assignedToId: assignee?.id ?? null,
          createdById: creator.id,
        },
      });
      createdTasks.push(task);
    }

    for (let i = 0; i < tasksStandalone.length; i++) {
      const item = tasksStandalone[i];
      const assignee = assignees.length > 0 ? assignees[(i + 2) % assignees.length] : null;

      const task = await prisma.task.create({
        data: {
          title: item.title,
          status: item.status,
          deadline: item.daysOffset != null ? addDays(now, item.daysOffset) : subDays(now, 1),
          companyId: COMPANY_ID,
          leadId: null,
          assignedToId: assignee?.id ?? null,
          createdById: creator.id,
        },
      });
      createdTasks.push(task);
    }

    console.log(`Company: ${company.name} (${COMPANY_ID})`);
    console.log(`Clients used/created: ${clientIds.length}`);
    console.log(`Leads created: ${createdLeads.length}`);
    console.log(`Tasks created: ${createdTasks.length} (${tasksWithLead.length} with lead, ${tasksStandalone.length} standalone)`);
    console.log('\nLead IDs:');
    createdLeads.forEach((l, i) => console.log(`  ${i + 1}. [${l.status}] ${l.title}`));
    console.log('\nTask IDs:');
    createdTasks.forEach((t, i) =>
      console.log(`  ${i + 1}. [${t.status}] ${t.title}${t.leadId ? ' (linked)' : ''}`),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
