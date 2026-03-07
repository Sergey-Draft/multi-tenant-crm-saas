# Архитектура

## Обзор

CRM Platform — multi-tenant SaaS. Все данные изолированы по `companyId`. Один пользователь принадлежит одной компании.

## Стек

| Слой | Технология |
|------|------------|
| Backend | NestJS 11, TypeScript |
| ORM | Prisma 7 |
| БД | PostgreSQL 15 |
| Кеш | Redis 7 |
| Auth | JWT (Passport) |
| Frontend | Next.js 16, React 19 |
| API-клиент | Axios, TanStack Query |
| Состояние | Zustand |

## Структура проекта

```
crm-platform/
├── backend/
│   ├── src/
│   │   ├── modules/           # Доменные модули
│   │   │   ├── auth/          # Регистрация, логин, JWT
│   │   │   ├── company/       # Компании
│   │   │   ├── clients/      # Клиенты
│   │   │   ├── leads/         # Лиды
│   │   │   ├── tasks/         # Задачи
│   │   │   └── users/         # Пользователи компании
│   │   ├── prisma/            # PrismaService
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── features/          # Фичи (auth, clients, ...)
│   │   └── lib/               # API-клиент, утилиты
│   └── ...
├── infra/
│   └── docker-compose.yml     # Postgres, Redis
└── docs/
```

## Модель данных

```
Company
  ├── User[] (роли: SUPER_ADMIN, OWNER, ADMIN, MANAGER, EMPLOYEE)
  ├── Client[]
  ├── Lead[] (Client, assignedTo User)
  └── Task[] (Lead?, assignedTo User, createdBy User)

Lead: status = NEW | IN_PROGRESS | DONE | REJECTED
Task: status = TODO | IN_PROGRESS | DONE
```

## Поток аутентификации

1. `POST /auth/register` — создание компании + пользователя
2. `POST /auth/login` — получение `accessToken`
3. Запросы к API — заголовок `Authorization: Bearer <token>`
4. `GET /auth/me` — текущий пользователь

## CI/CD

- **GitHub Actions** — `.github/workflows/backend.yml`
- При push в `backend/` — сборка, Prisma generate, тесты

## Что добавить при изменении

- Новый модуль → описать в «Структура проекта» и «Модель данных»
- Новый эндпоинт → [API.md](API.md)
- Новая переменная окружения → [SETUP.md](SETUP.md)
