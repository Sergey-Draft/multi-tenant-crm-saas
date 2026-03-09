# Установка и настройка

## Требования

- Node.js 20+
- Yarn или npm
- Docker и Docker Compose (для Postgres и Redis)
- Git

## 1. Инфраструктура

```bash
cd infra
docker compose up -d
```

Сервисы:
- **Postgres** — `localhost:5432`, user: `crm`, password: `crm`, db: `crm`
- **Redis** — `localhost:6379`

## 2. Backend

```bash
cd backend
yarn install
```

Создайте файл `.env` в папке `backend/`:

```env
DATABASE_URL="postgresql://crm:crm@localhost:5432/crm"
JWT_SECRET="your-secret-key"
```

Миграции:

```bash
npx prisma migrate deploy
```

Запуск:

```bash
yarn start:dev
```

API: `http://localhost:3000` (порт по умолчанию NestJS).

## 3. Frontend

```bash
cd frontend
yarn install
```

Создайте `.env.local` (если нужен другой URL API):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Запуск:

```bash
yarn dev
```

Приложение: `http://localhost:3001` (или 3000, если backend на другом порту).

## Переменные окружения

### Backend

| Переменная | Описание | Обязательно |
|------------|----------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | Да |
| `JWT_SECRET` | Секрет для подписи JWT | Да |

### Frontend

| Переменная | Описание |
|------------|----------|
| `NEXT_PUBLIC_API_URL` | URL backend API |

## Локальная разработка без Docker

Backend может работать с локальным Postgres. Установите PostgreSQL и создайте БД `crm`, затем укажите `DATABASE_URL` в `.env`.

Redis в текущей версии используется в infra, но backend может работать без него (если не подключены кеш-модули).
