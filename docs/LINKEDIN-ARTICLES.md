# Черновики статей для LinkedIn

> Два черновика — подредактируй под свой голос перед публикацией.  
> Рекомендация по языку: **multi-tenant на русском** (проще, концептуально), **ИИ на английском** (интереснее для глобальной аудитории).

---

## Советы перед публикацией

### Что добавить визуально (скрины / схемы)

| Статья | Что показать | Зачем |
|--------|--------------|-------|
| Multi-tenant | 1 скрин ER-диаграммы или схемы `Company → Client → Lead` | Сразу видно модель |
| Multi-tenant | 1 скрин JWT payload (замазать секреты) с `companyId` | Показывает механизм, не теорию |
| Multi-tenant | 1 скрин кода `where: { companyId }` | Конкретика для dev-аудитории |
| ИИ-ассистент | 1 скрин UI панели ассистента в карточке лида | Hook для не-разработчиков |
| ИИ-ассистент | 1 скрин structured output (summary / nextAction / email) | Показывает ценность для бизнеса |
| ИИ-ассистент | Схема потока (можно из PERSONAL-NOTES-RU.md) | Для технической аудитории |

### Чего НЕ стоит класть

- Реальные API keys, JWT, email клиентов
- Полные дампы БД
- Скрины с продакшн-данными

### Формат LinkedIn

- **Хук** — первые 2 строки (до «...ещё») решают, откроют ли пост
- **Короткие абзацы** — 1–3 предложения
- **Списки** — хорошо читаются в ленте
- **CTA в конце** — вопрос к аудитории («а как у вас?»)
- **Хештеги** — 3–5 штук в конце, не в тексте
- Длина: 800–1500 слов оптимально; можно разбить на 2 поста если длинно

### Честность = доверие

- Не называй copilot «autonomous AI agent» — аудитория с опытом заметит
- Упомяни trade-offs (нет RLS, ручная фильтрация) — это сильнее, чем «всё идеально»
- «Lessons learned» работают лучше, чем «я сделал идеальную систему»

---

# СТАТЬЯ 1 — РУССКИЙ

## Как я сделал multi-tenant в своей CRM и что бы сделал иначе

**Тема:** multi-tenant архитектура  
**Язык:** русский  
**Аудитория:** разработчики, тимлиды, фаундеры SaaS  
**Тон:** личный опыт, без академичности

---

Когда я начинал писать свою CRM, multi-tenant казался чем-то из разряда «для больших компаний».

А потом дошло: если продукт хоть немного похож на SaaS — без изоляции данных ты просто строишь single-tenant с лишней сложностью.

Расскажу, как я это сделал. Без магии.

### Что я выбрал

Есть три популярных подхода:

1. **Отдельная БД на каждого клиента** — максимальная изоляция, больше всего боли в DevOps
2. **Одна БД, отдельная схема на клиента** — компромисс, сложнее миграции
3. **Одна БД, одна схема, колонка tenant_id** — самый частый старт для MVP

Я пошёл по третьему пути. В моём случае tenant — это `Company`, а идентификатор — `companyId`.

Почему? Быстро, понятно, легко дебажить. Для учебного/раннего продукта — нормальный выбор.

### Как это работает у меня

**Регистрация = создание компании.**

Пользователь регистрируется → создаётся `Company` → создаётся `User` с привязкой к этой компании.

Один пользователь — одна компания. Пока без «переключения между организациями».

**Логин = tenant в JWT.**

При входе в токен кладётся `companyId`. Фронт не шлёт отдельный заголовок `X-Tenant-Id` — всё через Bearer token.

**Каждый запрос фильтруется вручную.**

```typescript
// Упрощённо
findAll(companyId: string) {
  return prisma.client.findMany({ where: { companyId } });
}
```

Тот же паттерн — clients, leads, tasks, dashboard, audit log.

Отдельного middleware «автоматически подставь tenant» у меня нет. Каждый сервис сам добавляет `companyId` в `where`.

### Схема данных

```
Company (корень)
  ├── User[]
  ├── Client[]
  ├── Lead[]
  └── Task[]
```

У всех дочерних сущностей — `companyId` + индекс на эту колонку.

При создании лида я ещё проверяю: клиент и ответственный менеджер принадлежат той же компании. Иначе теоретически можно привязать лид к чужому клиенту.

### Что сработало хорошо

✅ Простая модель — легко объяснить и поддерживать  
✅ JWT с `companyId` — фронт не думает о tenant  
✅ Индексы на `companyId` — запросы не деградируют сразу  
✅ Роли внутри компании (OWNER, ADMIN, MANAGER, EMPLOYEE) — отдельный слой поверх tenant  

### Что бы сделал иначе (или сделаю дальше)

⚠️ **Нет централизованной защиты.** Новый эндпоинт легко забыть отфильтровать. Решение: Prisma `$extends` или PostgreSQL RLS.

⚠️ **Некоторые API не scoped.** Например, список всех компаний доступен любому авторизованному пользователю. Для MVP ок, для прода — нет.

⚠️ **Маркетинг ≠ код.** На лендинге можно написать «фильтрация на уровне ORM» — а на деле это application-level. Лучше быть честным.

### Главный урок

Multi-tenant — это не одна фича. Это **дисциплина на каждом слое**: схема БД, auth, каждый CRUD, каждый JOIN.

Если думаешь «добавлю tenant_id потом» — почти всегда дороже, чем заложить с первого дня.

---

**Вопрос к вам:** какой подход к multi-tenant используете — shared DB, отдельные схемы или отдельные БД? Что пожалели, что не сделали сразу?

`#saas` `#multitenant` `#backend` `#nestjs` `#postgresql`

---

### Заметки для себя перед публикацией

- [ ] Добавить 1 скрин схемы Company → entities
- [ ] Добавить 1 скрин JWT payload (замазать)
- [ ] Можно упомянуть стек: NestJS + Prisma + PostgreSQL + Next.js
- [ ] Не писать «идеальная архитектура» — писать «рабочий MVP с понятными trade-offs»

---

# СТАТЬЯ 2 — ENGLISH

## I Built an AI Assistant for Our CRM. Here's What Actually Worked (and What Didn't)

**Topic:** AI copilot for sales leads  
**Language:** English (simple, clear)  
**Audience:** developers, product people, indie builders  
**Tone:** practical, honest, no hype

---

Everyone talks about "AI agents" now.

I added AI to my CRM project. But I did **not** build a full autonomous agent. I built something smaller — and honestly, that was the right call.

Here's what I learned.

### The problem I wanted to solve

Sales managers open a lead card and need to:
- understand the situation quickly
- decide the next step
- sometimes draft an email

Copy-pasting lead data into ChatGPT works. But it's slow, context gets lost, and API keys shouldn't live in the browser.

So I built an AI assistant **inside** the lead card.

### What I actually built (not an "agent")

Important distinction:

| What people imagine | What I built |
|---------------------|--------------|
| AI that calls APIs and updates the CRM | AI that **reads** lead context and **writes** text |
| Tool loop (plan → act → observe) | Single LLM call per request |
| Server-side chat memory | Chat history only in the UI (for now) |
| Token streaming | Full response, then display |

It's a **copilot**, not an agent. And that's fine for v1.

### Two modes, one service

All AI logic lives in **one backend service**. Two user-facing modes:

**1. Chat** — ask questions about the lead  
- History stays in the frontend  
- Each message sends full history to the backend  
- Response: plain text  

**2. Full analysis** — structured snapshot saved to the database  
- Output: `summary`, `nextAction`, `email draft`  
- Stored in `LeadAiAnalysis` table  
- UI shows the latest snapshot  

The chat is lightweight. The analysis is heavier but persistent.

### What context does the AI get?

I send a JSON snapshot of the lead:

- title, description, status, due date
- client name, email, phone
- up to 20 related tasks (title, status, deadline)

No task descriptions. No comments. Keep the prompt focused.

Language detection is simple: if the lead data has Cyrillic → Russian prompts. Otherwise → English.

### Provider switch without code changes

I support two providers via environment variable:

- **Gemini** (default) — structured JSON with schema
- **Groq** (fallback) — OpenAI-compatible API

Switch: `LEAD_AI_PROVIDER=gemini` or `groq`.

API keys stay on the backend. The frontend never talks to the LLM directly.

### The feature I'm most proud of: graceful fallback

LLMs fail. Quotas run out. JSON parsing breaks.

My rule: **the user should never see a blank screen or a 500 error.**

If anything fails:
- return a useful fallback message in the lead's language
- for analysis: still save to DB with `usedFallback: true`
- show a warning in the UI: "simplified response"

This one decision made the feature feel reliable in production.

### Chat modes via buttons, not NLP

Instead of guessing user intent from text, I added explicit modes:

- **Chat** — free conversation
- **Summary** — 2–4 sentences
- **Next action** — one concrete step
- **Draft email** — ready-to-send text or a suggestion to call instead

Buttons → predictable behavior. No intent classifier needed.

### What I skipped (on purpose)

- Token streaming — simpler code, worse UX for long answers
- Function calling — AI doesn't create tasks or update leads yet
- Chat persistence — history resets when you close the panel
- Response caching — not needed at this scale

These are good v2 items. Not v1 blockers.

### Key lesson

**Start with a copilot, not an agent.**

A copilot gives value fast: context + structured output + fallback.  
An agent needs tools, permissions, audit logs, and error handling at another level.

If your AI feature just needs to *help humans decide faster* — you probably don't need an agent loop on day one.

---

**Question for you:** Have you added AI to an internal tool? Did you go copilot-first or agent-first?

`#ai` `#llm` `#crm` `#saas` `#buildinpublic`

---

### Notes for yourself before publishing

- [ ] Add 1 screenshot of the AI assistant panel in the lead card
- [ ] Add 1 screenshot of structured output (summary / next action / email)
- [ ] Optional: simple flow diagram (user → API → LLM → DB)
- [ ] Don't call it "autonomous agent" — say "copilot" or "assistant"
- [ ] Mention stack briefly if asked in comments: NestJS, Gemini/Groq, Next.js

---

## Какую статью публиковать первой?

**Рекомендация: сначала multi-tenant (русский).**

Почему:
- Ты делал сам — история личнее, меньше ощущение «мне помогли»
- Тема понятна широкой dev-аудитории в СНГ
- Меньше hype-конкуренции, чем у «AI agent» постов
- Можно сослаться на вторую статью: «в следующем посте — как я добавил ИИ»

Второй пост (AI, English) — через 1–2 недели, со ссылкой на первый для русскоязычных подписчиков.

---

## Идеи для follow-up постов (если зайдёт)

1. «Почему я не стал делать AI agent с tools» (короткий, provocativ)
2. «Prisma + multi-tenant: 3 способа и что выбрать» (technical deep-dive)
3. «Graceful degradation для LLM — паттерн, который спасает UX» (практический)
4. «Что я бы добавил в multi-tenant перед продом» (чеклист)
