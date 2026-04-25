import Link from "next/link";
import { cookies } from "next/headers";
import { LandingHeroPreview } from "@/components/landing/landing-hero-preview";
import { 
  ArrowRight, 
  CheckCircle, 
  LayoutDashboard, 
  Shield, 
  Zap, 
  GitBranch,
  Database,
  Server,
  Cloud,
  Eye,
  BarChart3,
  UserCog,
  FolderKanban,
  Building2,
  Sparkles,
  MessageCircle,
  MailCheck
} from "lucide-react";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasAccessToken = Boolean(cookieStore.get("accessToken")?.value);
  const primaryHref = hasAccessToken ? "/dashboard" : "/register";
  const primaryLabel = hasAccessToken ? "Перейти в дашборд" : "Зарегистрироваться";

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO секция с градиентом */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
        
        <div className="relative px-6 py-24 lg:py-32 max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              SaaS платформа для бизнеса
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Draft CRM — Fullstack SaaS платформа
            </h1>
            
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Multi-tenant CRM с ролями, задачами, лидами и real-time обновлениями. 
              Построена с фокусом на архитектуру, масштабируемость и безопасность.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-all duration-200 active:scale-[0.98]"
              >
                Войти
              </Link>
              <a
                href="https://github.com/Sergey-Draft/multi-tenant-crm-saas"
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-all duration-200 active:scale-[0.98]"
              >
                <GitBranch className="h-4 w-4" />
                GitHub
              </a>
            </div>

            {/* Статистика */}
            <div className="mt-12 flex flex-wrap gap-8 border-t border-border pt-8">
              <div>
                <div className="text-2xl font-bold">Multi-tenant</div>
                <div className="text-sm text-muted-foreground">Изоляция данных</div>
              </div>
              <div>
                <div className="text-2xl font-bold">RBAC</div>
                <div className="text-sm text-muted-foreground">Гибкие роли</div>
              </div>
              <div>
                <div className="text-2xl font-bold">Real-time</div>
                <div className="text-sm text-muted-foreground">WebSocket</div>
              </div>
              <div>
                <div className="text-2xl font-bold">Audit Log</div>
                <div className="text-sm text-muted-foreground">Полный контроль</div>
              </div>
            </div>
          </div>

          <LandingHeroPreview />
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Ключевые возможности</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Всё необходимое для эффективного управления бизнесом
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Feature
            icon={<Building2 className="h-5 w-5" />}
            title="Multi-tenant"
            desc="Изоляция данных по компаниям. Безопасная SaaS архитектура с полным разделением клиентов."
          />
          <Feature
            icon={<UserCog className="h-5 w-5" />}
            title="RBAC"
            desc="Гибкая система ролей: OWNER, ADMIN, MANAGER, EMPLOYEE. Контроль доступа на каждом уровне."
          />
          <Feature
            icon={<FolderKanban className="h-5 w-5" />}
            title="Leads & Kanban"
            desc="Управление лидами с канбан-доской. Drag & drop, статусы, фильтрация и аналитика."
          />
          <Feature
            icon={<CheckCircle className="h-5 w-5" />}
            title="Tasks"
            desc="Назначение задач, дедлайны, приоритеты и контроль выполнения."
          />
          <Feature
            icon={<Zap className="h-5 w-5" />}
            title="Real-time"
            desc="WebSocket уведомления в реальном времени. Мгновенные обновления без перезагрузки."
          />
          <Feature
            icon={<Eye className="h-5 w-5" />}
            title="Audit Log"
            desc="Полный журнал действий пользователей. Отслеживайте все изменения в системе."
          />
        </div>
      </section>

      {/* AI ASSISTANT */}
      <section className="px-6 py-20 bg-secondary/20 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              AI для работы с лидами
            </div>
            <h2 className="text-3xl font-bold tracking-tight">ИИ‑ассистент в карточке лида</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Помогает менеджеру быстрее разбирать лиды и сразу формировать следующий шаг.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Feature
              icon={<MessageCircle className="h-5 w-5" />}
              title="Контекстный чат"
              desc="Диалог по текущему лиду: ассистент учитывает клиента, описание, статус и задачи."
            />
            <Feature
              icon={<CheckCircle className="h-5 w-5" />}
              title="Следующий шаг"
              desc="Подсказывает конкретное действие для менеджера и сокращает время на принятие решения."
            />
            <Feature
              icon={<MailCheck className="h-5 w-5" />}
              title="Черновик письма"
              desc="Генерирует готовый human-like ответ клиенту, который можно быстро адаптировать."
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={hasAccessToken ? "/dashboard/leads" : "/register"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
            >
              {hasAccessToken ? "Открыть лиды" : "Попробовать AI в CRM"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={hasAccessToken ? "/dashboard/settings/backend-api" : "/login"}
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-all duration-200 active:scale-[0.98]"
            >
              API ассистента
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 bg-secondary/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Как работает система</h2>
            <p className="mt-3 text-muted-foreground">Современная архитектура для масштабирования</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Block
              icon={<Shield className="h-6 w-6" />}
              title="Auth & Security"
              desc="JWT + refresh tokens, Guards и защита маршрутов. Полная изоляция сессий."
            />
            <Block
              icon={<Database className="h-6 w-6" />}
              title="Multi-tenant Core"
              desc="Данные изолированы через companyId. Автоматическая фильтрация на уровне ORM."
            />
            <Block
              icon={<Server className="h-6 w-6" />}
              title="Real-time Layer"
              desc="Redis + WebSocket для уведомлений. Масштабируемая pub/sub архитектура."
            />
          </div>
        </div>
      </section>

      {/* SYSTEM CAPABILITIES */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Возможности системы</h2>
            <p className="mt-3 text-muted-foreground">
              Полный набор инструментов для управления бизнесом
            </p>
            
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <CapabilityItem text="Управление пользователями и ролями" />
              <CapabilityItem text="Клиенты и лиды" />
              <CapabilityItem text="Канбан доска с Drag & Drop" />
              <CapabilityItem text="Задачи и дедлайны" />
              <CapabilityItem text="Журнал аудита действий" />
              <CapabilityItem text="Swagger API документация" />
              <CapabilityItem text="Настройки компании" />
              <CapabilityItem text="RBAC доступы" />
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Ключевые метрики</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Активные лиды</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-primary rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Конверсия</span>
                  <span className="font-medium">24%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-success rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Активные задачи</span>
                  <span className="font-medium">42</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-2/5 bg-warning rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="px-6 py-20 bg-secondary/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Технологический стек</h2>
            <p className="mt-3 text-muted-foreground">
              Современные технологии для надёжного и быстрого приложения
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <TechCard
              title="Backend"
              icon={<Server className="h-5 w-5" />}
              items={[
                "NestJS — модульная архитектура",
                "PostgreSQL + Prisma ORM",
                "Redis — кэширование и очереди",
                "JWT Auth с refresh токенами",
                "WebSocket — real-time уведомления",
                "Swagger — автоматическая документация"
              ]}
            />
            <TechCard
              title="Frontend"
              icon={<LayoutDashboard className="h-5 w-5" />}
              items={[
                "Next.js 15 (App Router)",
                "TypeScript — типобезопасность",
                "TanStack Query — управление состоянием",
                "TanStack Table — мощные таблицы",
                "shadcn/ui — компоненты",
                "Tailwind CSS — стилизация"
              ]}
            />
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <BadgeItem text="Docker & Docker Compose" />
            <BadgeItem text="Nginx Reverse Proxy" />
            <BadgeItem text="GitHub Actions CI/CD" />
          </div>
        </div>
      </section>

      {/* DEPLOYMENT */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm mb-4">
                <Cloud className="h-3 w-3" />
                Готово к деплою
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                Развёрнуто на VPS
              </h2>
              <p className="mt-3 text-muted-foreground max-w-md">
                Docker Compose, PostgreSQL, Redis, Nginx. 
                Полная production-инфраструктура.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <code className="px-3 py-1.5 bg-secondary rounded-lg text-sm font-mono">
                  docker-compose up -d
                </code>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={primaryHref}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
              >
                {hasAccessToken ? "В дашборд" : "Зарегистрироваться"}
              </Link>
              <a
                href="https://github.com/Sergey-Draft/multi-tenant-crm-saas"
                target="_blank"
                className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-all duration-200 active:scale-[0.98]"
              >
                Документация
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Попробуй Draft CRM
          </h2>
          <p className="mt-4 text-primary-foreground/80 text-lg">
            Готовая SaaS система с продакшн архитектурой.
            Создано для обучения и реального использования.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={primaryHref}
              className="px-8 py-3 bg-white text-primary rounded-lg font-medium hover:bg-white/90 transition-all duration-200 active:scale-[0.98] shadow-lg"
            >
              {primaryLabel}
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border border-white/30 rounded-lg hover:bg-white/10 transition-all duration-200 active:scale-[0.98]"
            >
              Войти
            </Link>
          </div>
          <p className="mt-6 text-primary-foreground/60 text-sm">
            Не требуется кредитная карта • Бесплатный пробный период
          </p>
        </div>
      </section>

      {/* ABOUT PROJECT */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-xl font-semibold">О проекте</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Draft CRM создавался как production-ready fullstack SaaS: с multi-tenant
              архитектурой, ролями, аудитом, real-time и удобным UI для ежедневной
              работы команды.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-xl font-semibold">О разработчике</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Проект демонстрирует мой подход к разработке: чистая модульная
              архитектура, типобезопасность, внимание к UX и готовность системы к
              масштабированию и деплою.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

// Компоненты
function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group p-6 bg-card border border-border rounded-xl hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Block({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function CapabilityItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

function TechCard({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            {title === 'Backend' &&
            (i === 2 || i ===4) ? <><s>{item}</s><span className="text-red-300"> dev</span> </>: item }
          </li>
        ))}
      </ul>
    </div>
  );
}

function BadgeItem({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm text-muted-foreground">
      <CheckCircle className="h-3.5 w-3.5 text-success" />
      {text}
    </div>
  );
}