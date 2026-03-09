# CRM Platform

Сервисная CRM-платформа для управления клиентами, лидами и задачами. Multi-tenant SaaS.

## Структура проекта

```
crm-platform/
├── backend/     # NestJS API
├── frontend/    # Next.js SPA
├── infra/       # Docker (Postgres, Redis)
└── docs/        # Документация
```

## Быстрый старт

```bash
# 1. Инфраструктура

cd infra
docker compose up -d

# 2. Backend

cd backend
yarn install
# создать .env (см. docs/SETUP.md)
npx prisma migrate deploy
yarn start:dev

# 3. Frontend

cd frontend
yarn install
yarn dev
```

## Документация

- [Оглавление](docs/README.md)
- [Архитектура](docs/ARCHITECTURE.md)
- [Установка и настройка](docs/SETUP.md)
- [API](docs/API.md)
- [Как вести документацию](docs/MAINTENANCE.md)

## Стек

- **Backend:** NestJS, Prisma, PostgreSQL, Redis, JWT
- **Frontend:** Next.js, React, TanStack Query, Zustand
- **Сборка:** Docker, GitHub Actions
