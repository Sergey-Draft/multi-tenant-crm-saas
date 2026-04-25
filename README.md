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

## AI-ассистент для лидов

В проекте реализован AI-ассистент в карточке лида:

- `POST /leads/:id/ai-analyze` — полный структурированный разбор лида (`summary`, `nextAction`, `email`) с сохранением снимка в БД.
- `POST /leads/:id/ai-chat` — чат по текущему лиду с режимами:
  - `CHAT` — свободный диалог;
  - `SUMMARY` — краткое резюме;
  - `NEXT_ACTION` — следующий шаг для менеджера;
  - `DRAFT_EMAIL` — черновик письма клиенту.
- `GET /leads/:id/ai-analysis/latest` — получить последний сохранённый AI-разбор по лиду.

### Что делает backend под капотом

- Загружает лид из Prisma вместе с клиентом и задачами.
- Определяет язык данных лида (RU/EN) и отвечает на этом же языке.
- Работает через AI-провайдера на backend (`Gemini` или `Groq`) по ключам из `backend/.env*`.
- Для `ai-analyze` ожидает structured JSON и нормализует ответ.
- При ошибке провайдера или невалидном JSON возвращает рабочий fallback-ответ.
- Сохраняет снимок анализа в таблицу `LeadAiAnalysis` (результат + метаданные).

### Что сохраняется в `LeadAiAnalysis`

- `summary`, `nextAction`, `email`
- `usedFallback`
- `geminiModel`
- `finishReason`
- `requestedById`
- `createdAt`
