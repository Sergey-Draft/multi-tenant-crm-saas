# API Reference

Base URL: `http://localhost:3000` (или значение из конфигурации).

Все защищённые эндпоинты требуют заголовок:

```
Authorization: Bearer <accessToken>
```

---

## Auth

### POST /auth/register

Регистрация компании и первого пользователя.

**Request:**
```json
{
  "companyName": "string",
  "email": "string",
  "password": "string"  // min 6 символов
}
```

**Response:**
```json
{
  "company": { "id": "uuid", "name": "string" },
  "user": { "id": "uuid", "email": "string" }
}
```

После регистрации нужно вызвать `POST /auth/login` для получения токена.

---

### POST /auth/login

Вход в систему.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "accessToken": "string",
  "user": {
    "id": "uuid",
    "email": "string",
    "companyId": "uuid"
  }
}
```

---

### GET /auth/me

Текущий пользователь. Требует JWT.

**Response:**
```json
{
  "userId": "uuid",
  "email": "string",
  "companyId": "uuid",
  "createdAt": "ISO date"
}
```

---

## Companies

Все эндпоинты требуют JWT.

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /companies | Создать компанию |
| GET | /companies | Список компаний |
| GET | /companies/:id | Компания по ID |

---

## Clients

CRUD. Все данные изолированы по `companyId` текущего пользователя.

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /clients | Создать клиента |
| GET | /clients | Список клиентов |
| GET | /clients/:id | Клиент по ID |
| PATCH | /clients/:id | Обновить клиента |
| DELETE | /clients/:id | Удалить клиента |

**Create body:** `{ "name": "string", "email": "string?", "phone": "string?" }`

---

## Leads

CRUD + смена статуса. Статусы: `NEW`, `IN_PROGRESS`, `DONE`, `REJECTED`.

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /leads | Создать лид |
| GET | /leads | Список лидов |
| GET | /leads/:id | Лид по ID |
| PATCH | /leads/:id | Обновить лид |
| PATCH | /leads/:id/status | Сменить статус |
| DELETE | /leads/:id | Удалить лид |

**Create body:** `{ "title": "string", "clientId": "uuid", "description": "string", "dateDue": "ISO date", "status?": "NEW"|"IN_PROGRESS"|"DONE"|"REJECTED" }`

**Change status body:** `{ "status": "NEW"|"IN_PROGRESS"|"DONE"|"REJECTED" }`

---

## Tasks

CRUD + смена статуса. Статусы: `TODO`, `IN_PROGRESS`, `DONE`.

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /tasks | Создать задачу |
| GET | /tasks | Список задач |
| GET | /tasks/:id | Задача по ID |
| PATCH | /tasks/:id | Обновить задачу |
| PATCH | /tasks/:id/status | Сменить статус |
| DELETE | /tasks/:id | Удалить задачу |

**Create body:** `{ "title": "string", "leadId?": "uuid", "assignedToId?": "uuid", "deadline?": "ISO date" }`

**Change status body:** `{ "status": "TODO"|"IN_PROGRESS"|"DONE" }`

---

## Users

Управление пользователями компании. Требует JWT.

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /users | Список пользователей |
| GET | /users/:id | Пользователь по ID |
| PATCH | /users/:id | Обновить пользователя |
| PATCH | /users/:id/role | Сменить роль |

**Роли:** `SUPER_ADMIN`, `OWNER`, `ADMIN`, `MANAGER`, `EMPLOYEE`

---

## Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Bad Request — невалидные данные |
| 401 | Unauthorized — нет или неверный JWT |
| 403 | Forbidden — нет доступа |
| 404 | Not Found |
| 409 | Conflict — например, email уже занят |

---

## Как обновлять этот документ

При добавлении или изменении эндпоинта:
1. Добавь описание в соответствующий раздел
2. Укажи тело запроса и пример ответа
3. Обнови таблицу методов
