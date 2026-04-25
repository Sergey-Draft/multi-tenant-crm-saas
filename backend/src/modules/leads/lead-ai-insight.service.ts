import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import type { Lead, Client, Prisma, PrismaClient, Task } from '@prisma/client';
import { LeadAiChatDto, LeadAiChatMode } from './dto/lead-ai-chat.dto';

export type LeadAiInsightResult = {
  summary: string;
  nextAction: string;
  email: string;
};

type LeadForPrompt = Lead & {
  client: Client;
  Task: Pick<Task, 'id' | 'title' | 'status' | 'deadline'>[];
};

const INSIGHT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description:
        'A few natural sentences summarizing the lead for the manager.',
    },
    nextAction: {
      type: 'string',
      description:
        'Concrete, human advice: what the manager should write or do next.',
    },
    email: {
      type: 'string',
      description:
        'A warm, human-sounding client email draft when outreach makes sense; otherwise a short note that no email is needed.',
    },
  },
  required: ['summary', 'nextAction', 'email'],
} as const;

@Injectable()
export class LeadAiInsightService {
  private readonly logger = new Logger(LeadAiInsightService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async analyzeAndPersist(
    leadId: string,
    companyId: string,
    requestedById?: string,
  ): Promise<LeadAiInsightResult> {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
      include: {
        client: true,
        Task: {
          select: { id: true, title: true, status: true, deadline: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const lang = detectLeadLanguage(lead);
    const provider = (
      this.config.get<string>('LEAD_AI_PROVIDER')?.trim().toLowerCase() ??
      'gemini'
    ) as 'gemini' | 'groq';
    const model =
      provider === 'groq'
        ? this.config.get<string>('GROQ_MODEL')?.trim() || 'llama-3.1-8b-instant'
        : this.config.get<string>('GEMINI_MODEL')?.trim() || 'gemini-2.0-flash';
    const apiKey =
      provider === 'groq'
        ? this.config.get<string>('GROQ_API_KEY')?.trim()
        : this.config.get<string>('GEMINI_API_KEY')?.trim();

    let clean: LeadAiInsightResult;
    let usedFallback = false;
    let finishReason: string | null = null;
    let geminiModelStored: string | null = null;

    if (!apiKey) {
      clean = fallbackInsight(lead, lang, 'no_api_key');
      usedFallback = true;
    } else {
      try {
        const raw =
          provider === 'groq'
            ? await this.callGroq(lead, model, apiKey)
            : await this.callGemini(lead, model, apiKey);
        geminiModelStored = model;
        const normalized = normalizeInsight(raw, lead, lang);
        if (normalized._meta?.usedFallback) {
          usedFallback = true;
          if (normalized._meta.reason === 'invalid_json') {
            this.logger.warn(
              `Lead AI ${provider} returned non-parseable JSON for lead ${leadId}; fallback applied`,
            );
            this.logger.warn(
              `Lead AI ${provider} raw response preview for lead ${leadId}: ${raw.text.slice(0, 1200)}`,
            );
          }
        }
        finishReason = normalized._meta?.finishReason ?? null;
        clean = stripMeta(normalized);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Lead AI ${provider} failed for lead ${leadId}: ${message}`,
        );
        const failKind = classifyAiFailure(message);
        const retryAfterSec = extractRetryAfterSeconds(message);
        clean = fallbackInsight(lead, lang, failKind, retryAfterSec);
        usedFallback = true;
      }
    }

    const analysisRow: Prisma.LeadAiAnalysisUncheckedCreateInput = {
      leadId: lead.id,
      companyId: lead.companyId,
      summary: clean.summary,
      nextAction: clean.nextAction,
      email: clean.email,
      usedFallback,
      geminiModel: geminiModelStored,
      finishReason,
      requestedById: requestedById ?? null,
    };

    const db = this.prisma as PrismaClient;
    await db.leadAiAnalysis.create({ data: analysisRow });

    return clean;
  }

  /**
   * Один запрос к тому же провайдеру, что и analyze: режим задаётся явно (кнопки UI),
   * ответ — обычный текст (без JSON). Полный structured-анализ по-прежнему через analyzeAndPersist.
   */
  async chat(
    leadId: string,
    companyId: string,
    dto: LeadAiChatDto,
  ): Promise<{ reply: string }> {
    const last = dto.messages[dto.messages.length - 1];
    if (!last || last.role !== 'user') {
      throw new BadRequestException('Последнее сообщение должно быть от пользователя');
    }
    if (dto.messages.length > 32) {
      throw new BadRequestException('Слишком длинная история (макс. 32 сообщения)');
    }

    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
      include: {
        client: true,
        Task: {
          select: { id: true, title: true, status: true, deadline: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const lang = detectLeadLanguage(lead);
    const provider = (
      this.config.get<string>('LEAD_AI_PROVIDER')?.trim().toLowerCase() ??
      'gemini'
    ) as 'gemini' | 'groq';
    const model =
      provider === 'groq'
        ? this.config.get<string>('GROQ_MODEL')?.trim() || 'llama-3.1-8b-instant'
        : this.config.get<string>('GEMINI_MODEL')?.trim() || 'gemini-2.0-flash';
    const apiKey =
      provider === 'groq'
        ? this.config.get<string>('GROQ_API_KEY')?.trim()
        : this.config.get<string>('GEMINI_API_KEY')?.trim();

    const leadPayload = formatLeadForPrompt(lead);
    const systemText = buildChatSystemInstruction(dto.mode, leadPayload, lang);

    const trimmed = dto.messages.map((m) => ({
      role: m.role,
      content: m.content.trim(),
    }));

    if (!apiKey) {
      return { reply: chatFallbackNoKey(lead, lang, dto.mode) };
    }

    try {
      const reply =
        provider === 'groq'
          ? await this.runGroqChat(systemText, trimmed, model, apiKey)
          : await this.runGeminiChat(systemText, trimmed, model, apiKey);
      return { reply: reply.trim() || chatFallbackNoKey(lead, lang, dto.mode) };
    } catch (err) {
      const errText = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Lead AI chat ${provider} failed for lead ${leadId}: ${errText}`);
      return { reply: chatFallbackError(lead, lang) };
    }
  }

  /** Сначала structured output со схемой; при ошибке — тот же промпт в JSON-режиме без responseJsonSchema (часто падает на 400 из‑за схемы/версии API). */
  private async callGemini(
    lead: LeadForPrompt,
    model: string,
    apiKey: string,
  ): Promise<{ text: string; finishReason?: string }> {
    try {
      return await this.runGeminiRequest(lead, model, apiKey, true);
    } catch (err) {
      this.logger.warn(
        `Gemini structured (responseJsonSchema) failed, retrying as plain JSON: ${(err as Error).message}`,
      );
      return await this.runGeminiRequest(lead, model, apiKey, false);
    }
  }

  private async runGeminiRequest(
    lead: LeadForPrompt,
    model: string,
    apiKey: string,
    useResponseJsonSchema: boolean,
  ): Promise<{ text: string; finishReason?: string }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const userPayload = formatLeadForPrompt(lead);
    const userLeadBlock = JSON.stringify(userPayload, null, 2);
    const userIntro = useResponseJsonSchema
      ? 'Lead data (JSON). Respond only with JSON matching the schema.'
      : 'Lead data (JSON). Output a single JSON object only (no markdown), with string fields exactly: "summary", "nextAction", "email". Values in the same language as the lead.';

    const generationConfig: Record<string, unknown> = {
      temperature: 0.65,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    };
    if (useResponseJsonSchema) {
      generationConfig.responseJsonSchema = INSIGHT_JSON_SCHEMA;
    }

    const body = {
      systemInstruction: {
        parts: [
          {
            text:
              'You are an experienced CRM assistant. Analyze the lead and help the sales manager.\n' +
              'Rules:\n' +
              '- Match the language of the lead data (title, description, names, tasks). If mixed, prefer the dominant language.\n' +
              '- Write like a thoughtful colleague: natural, clear, not stiff or template-heavy.\n' +
              '- "email": a ready-to-send client email when follow-up by email makes sense; if a call or internal step is clearly better, write a short line explaining that instead of a fake letter.\n' +
              '- "nextAction": one focused recommendation (what to write in chat, call script line, or email opener).\n' +
              '- "summary": 2–4 sentences max.\n' +
              '- Do not invent facts not supported by the data; you may note uncertainty briefly.',
          },
        ],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: `${userIntro}\n\n${userLeadBlock}` }],
        },
      ],
      generationConfig,
    };

    const res = await fetch(`${url}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    let json: GeminiGenerateContentResponse & { error?: { message?: string } };
    try {
      json = raw ? (JSON.parse(raw) as typeof json) : ({} as typeof json);
    } catch {
      throw new Error(
        `Gemini response body is not JSON (HTTP ${res.status}): ${raw.slice(0, 240)}`,
      );
    }

    if (!res.ok) {
      const msg = json.error?.message ?? res.statusText;
      throw new Error(`Gemini HTTP ${res.status}: ${msg}`);
    }

    const candidate = json.candidates?.[0];
    const text =
      candidate?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    const fr = candidate?.finishReason;

    if (!text.trim()) {
      const block = (json as { promptFeedback?: { blockReason?: string } })
        ?.promptFeedback?.blockReason;
      throw new Error(
        block ? `Gemini blocked: ${block}` : 'Empty Gemini response',
      );
    }

    return { text: text.trim(), finishReason: fr };
  }

  private async callGroq(
    lead: LeadForPrompt,
    model: string,
    apiKey: string,
  ): Promise<{ text: string; finishReason?: string }> {
    const userPayload = formatLeadForPrompt(lead);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
      model,
      temperature: 0.65,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an experienced CRM assistant. Analyze the lead and help the sales manager.\n' +
            'Rules:\n' +
            '- Match the language of the lead data (title, description, names, tasks). If mixed, prefer the dominant language.\n' +
            '- Write like a thoughtful colleague: natural, clear, not stiff or template-heavy.\n' +
            '- "email": a ready-to-send client email when follow-up by email makes sense; if a call or internal step is clearly better, write a short line explaining that instead.\n' +
            '- "nextAction": one focused recommendation.\n' +
            '- "summary": 2-4 sentences max.\n' +
            '- If lead language is Russian (Cyrillic), write ALL fields in Russian.\n' +
            '- Return ONLY JSON object with keys: summary, nextAction, email.',
        },
        {
          role: 'user',
          content: `Lead data (JSON):\n${JSON.stringify(userPayload, null, 2)}`,
        },
      ],
      }),
    });

    const raw = await res.text();
    let json: GroqChatCompletionsResponse & { error?: { message?: string } };
    try {
      json = raw ? (JSON.parse(raw) as typeof json) : ({} as typeof json);
    } catch {
      throw new Error(
        `Groq response body is not JSON (HTTP ${res.status}): ${raw.slice(0, 240)}`,
      );
    }

    if (!res.ok) {
      const msg = json.error?.message ?? res.statusText;
      throw new Error(`Groq HTTP ${res.status}: ${msg}`);
    }

    const text = json.choices?.[0]?.message?.content?.trim() ?? '';
    if (!text) {
      throw new Error('Empty Groq response');
    }

    return {
      text,
      finishReason: json.choices?.[0]?.finish_reason ?? undefined,
    };
  }

  private async runGeminiChat(
    systemText: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
    model: string,
    apiKey: string,
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body = {
      systemInstruction: { parts: [{ text: systemText }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    const res = await fetch(`${url}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    let json: GeminiGenerateContentResponse & { error?: { message?: string } };
    try {
      json = raw ? (JSON.parse(raw) as typeof json) : ({} as typeof json);
    } catch {
      throw new Error(
        `Gemini chat response is not JSON (HTTP ${res.status}): ${raw.slice(0, 240)}`,
      );
    }

    if (!res.ok) {
      const msg = json.error?.message ?? res.statusText;
      throw new Error(`Gemini HTTP ${res.status}: ${msg}`);
    }

    const candidate = json.candidates?.[0];
    const text =
      candidate?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    if (!text.trim()) {
      const block = (json as { promptFeedback?: { blockReason?: string } })
        ?.promptFeedback?.blockReason;
      throw new Error(
        block ? `Gemini blocked: ${block}` : 'Empty Gemini chat response',
      );
    }
    return text.trim();
  }

  private async runGroqChat(
    systemText: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
    model: string,
    apiKey: string,
  ): Promise<string> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 2048,
        messages: [{ role: 'system', content: systemText }, ...messages],
      }),
    });

    const raw = await res.text();
    let json: GroqChatCompletionsResponse & { error?: { message?: string } };
    try {
      json = raw ? (JSON.parse(raw) as typeof json) : ({} as typeof json);
    } catch {
      throw new Error(
        `Groq chat response is not JSON (HTTP ${res.status}): ${raw.slice(0, 240)}`,
      );
    }

    if (!res.ok) {
      const msg = json.error?.message ?? res.statusText;
      throw new Error(`Groq HTTP ${res.status}: ${msg}`);
    }

    const text = json.choices?.[0]?.message?.content?.trim() ?? '';
    if (!text) {
      throw new Error('Empty Groq chat response');
    }
    return text;
  }
}

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
};

type InsightWithMeta = LeadAiInsightResult & {
  _meta?: {
    usedFallback?: boolean;
    finishReason?: string;
    reason?: 'invalid_json';
  };
};

function stripMeta(i: InsightWithMeta): LeadAiInsightResult {
  const { summary, nextAction, email } = i;
  return { summary, nextAction, email };
}

function detectLeadLanguage(lead: LeadForPrompt): 'ru' | 'en' {
  const blob = [
    lead.title,
    lead.description,
    lead.client?.name,
    lead.client?.email,
    ...lead.Task.map((t) => t.title),
  ]
    .filter(Boolean)
    .join(' ');
  if (/[\u0400-\u04FF]/.test(blob)) return 'ru';
  return 'en';
}

function formatLeadForPrompt(lead: LeadForPrompt) {
  return {
    title: lead.title,
    description: lead.description,
    status: lead.status,
    dateDue: lead.dateDue?.toISOString?.() ?? String(lead.dateDue),
    client: {
      name: lead.client.name,
      email: lead.client.email,
      phone: lead.client.phone,
    },
    tasks: lead.Task.map((t) => ({
      title: t.title,
      status: t.status,
      deadline: t.deadline?.toISOString?.() ?? t.deadline,
    })),
  };
}

function buildChatSystemInstruction(
  mode: LeadAiChatMode,
  leadPayload: ReturnType<typeof formatLeadForPrompt>,
  lang: 'ru' | 'en',
): string {
  const leadBlock = JSON.stringify(leadPayload, null, 2);
  const modeRu: Record<LeadAiChatMode, string> = {
    [LeadAiChatMode.CHAT]:
      'Режим: свободный диалог. Отвечай кратко по сути, только на основе данных лида и истории ниже.',
    [LeadAiChatMode.SUMMARY]:
      'Режим: резюме. 2–4 предложения: суть лида, клиент, текущая ситуация.',
    [LeadAiChatMode.NEXT_ACTION]:
      'Режим: следующий шаг. Один конкретный практический совет менеджеру (что сделать или написать).',
    [LeadAiChatMode.DRAFT_EMAIL]:
      'Режим: черновик письма. Если уместно — готовый текст письма клиенту; если лучше звонок — одной строкой объясни.',
  };
  const modeEn: Record<LeadAiChatMode, string> = {
    [LeadAiChatMode.CHAT]:
      'Mode: free Q&A. Answer concisely based only on the lead data and chat history.',
    [LeadAiChatMode.SUMMARY]:
      'Mode: summary. 2–4 sentences: what the lead is about, client, current state.',
    [LeadAiChatMode.NEXT_ACTION]:
      'Mode: next step. One concrete action for the sales manager.',
    [LeadAiChatMode.DRAFT_EMAIL]:
      'Mode: email draft. If email fits, provide ready-to-send text; otherwise one line on a better channel.',
  };
  const modeLine = lang === 'ru' ? modeRu[mode] : modeEn[mode];
  const base =
    lang === 'ru'
      ? 'Ты опытный помощник в CRM по продажам. Пиши естественно, без канцелярита. Не выдумывай факты — если данных мало, скажи об этом кратко.\n'
      : 'You are an experienced CRM sales assistant. Write naturally. Do not invent facts; if data is thin, say so briefly.\n';
  return `${base}${modeLine}\n\nCurrent lead (JSON):\n${leadBlock}`;
}

function chatFallbackNoKey(
  lead: LeadForPrompt,
  lang: 'ru' | 'en',
  mode: LeadAiChatMode,
): string {
  const title = lead.title;
  if (lang === 'ru') {
    const byMode: Record<LeadAiChatMode, string> = {
      [LeadAiChatMode.CHAT]: `Ключ API не настроен — отвечаю шаблонно. По лиду «${title}» откройте карточку клиента и зафиксируйте следующий контакт вручную.`,
      [LeadAiChatMode.SUMMARY]: `Ключ API не настроен. Лид «${title}», клиент ${lead.client.name || '—'}: кратко опишите суть в заметке сами после звонка.`,
      [LeadAiChatMode.NEXT_ACTION]: `Ключ API не настроен. Рекомендую: коротко написать клиенту и согласовать время для уточнения деталей по «${title}».`,
      [LeadAiChatMode.DRAFT_EMAIL]: `Ключ API не настроен. Черновик: «Здравствуйте! Пишу по заявке «${title}». Подскажите, удобно ли обсудить детали в ответном письме или коротком звонке?»`,
    };
    return byMode[mode];
  }
  const byModeEn: Record<LeadAiChatMode, string> = {
    [LeadAiChatMode.CHAT]: `API key is not configured. For lead "${title}", review the client card and plan the next touch manually.`,
    [LeadAiChatMode.SUMMARY]: `API key is not configured. Lead "${title}", client ${lead.client.name || '—'}: add a short note after your call.`,
    [LeadAiChatMode.NEXT_ACTION]: `API key is not configured. Suggest: send a short message and agree on a time to clarify "${title}".`,
    [LeadAiChatMode.DRAFT_EMAIL]: `API key is not configured. Draft: "Hello — following up on \\"${title}\\". Would email or a quick call work best to align on details?"`,
  };
  return byModeEn[mode];
}

function chatFallbackError(lead: LeadForPrompt, lang: 'ru' | 'en'): string {
  if (lang === 'ru') {
    return `Сейчас не удалось получить ответ от модели. Попробуйте ещё раз через минуту. Лид: «${lead.title}».`;
  }
  return `The model is temporarily unavailable. Please retry in a minute. Lead: "${lead.title}".`;
}

function normalizeInsight(
  rawText: { text: string; finishReason?: string },
  lead: LeadForPrompt,
  lang: 'ru' | 'en',
): InsightWithMeta {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText.text);
  } catch {
    parsed = tryExtractJson(rawText.text);
  }

  const o = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  const summary = typeof o?.summary === 'string' ? o.summary.trim() : '';
  const nextAction = typeof o?.nextAction === 'string' ? o.nextAction.trim() : '';
  const rawEmail = typeof o?.email === 'string' ? o.email.trim() : '';
  const email =
    rawEmail ||
    fallbackInsight(lead, lang, 'invalid_json').email;

  if (!summary || !nextAction) {
    const fb = fallbackInsight(lead, lang, 'invalid_json');
    return {
      ...fb,
      _meta: {
        usedFallback: true,
        finishReason: rawText.finishReason,
        reason: 'invalid_json',
      },
    };
  }

  return {
    summary,
    nextAction,
    email,
    _meta: { finishReason: rawText.finishReason },
  };
}

function tryExtractJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** 429 / квота — не «сломался сервис», а лимит провайдера. */
function classifyAiFailure(message: string): 'quota_rate_limit' | 'request_failed' {
  if (
    /\b429\b/i.test(message) ||
    /quota|rate limit|RESOURCE_EXHAUSTED|exceeded your current quota|free_tier_requests/i.test(
      message,
    )
  ) {
    return 'quota_rate_limit';
  }
  return 'request_failed';
}

function extractRetryAfterSeconds(message: string): string | null {
  const m = message.match(/Please retry in ([\d.]+)\s*s\b/i);
  return m?.[1] ?? null;
}

type FallbackReason =
  | 'no_api_key'
  | 'request_failed'
  | 'invalid_json'
  | 'quota_rate_limit';

function fallbackInsight(
  lead: LeadForPrompt,
  lang: 'ru' | 'en',
  reason: FallbackReason,
  retryAfterSeconds: string | null = null,
): LeadAiInsightResult {
  const clientName = lead.client.name || (lang === 'ru' ? 'клиент' : 'the client');
  const retryHintRu =
    retryAfterSeconds != null
      ? ` Примерно через ${retryAfterSeconds} с можно повторить запрос.`
      : '';
  const retryHintEn =
    retryAfterSeconds != null
      ? ` You can retry in about ${retryAfterSeconds}s.`
      : '';

  if (lang === 'ru') {
    const reasonNote =
      reason === 'no_api_key'
        ? 'Автоматический разбор сейчас недоступен (не настроен ключ API).'
        : reason === 'invalid_json'
          ? 'Ответ ассистента не удалось разобрать.'
          : reason === 'quota_rate_limit'
            ? `ИИ не ответил: исчерпана квота или лимит запросов у AI-провайдера.${retryHintRu}`
            : 'Сервис анализа временно недоступен (сетевая ошибка или недоступность API).';
    const nextQuota =
      reason === 'quota_rate_limit'
        ? `Повторите «ИИ-анализ» позже${retryAfterSeconds ? ` (~${retryAfterSeconds} с)` : ''} или смените ключ/тариф в Google. Пока можно действовать вручную по лиду.`
        : `Напишите ${clientName} короткое сообщение: уточните актуальность запроса и предложите удобное время для звонка или переписки.`;
    return {
      summary: `${reasonNote} Лид «${lead.title}» для ${clientName}, статус ${lead.status}. По описанию стоит уточнить потребности и следующий шаг с клиентом.`,
      nextAction: nextQuota,
      email: `Здравствуйте${lead.client.name ? `, ${lead.client.name}` : ''}!\n\nПишу по вашему обращению («${lead.title}»). Подскажите, пожалуйста, удобен ли вам сейчас короткий созвон или удобнее ответить в письме — чтобы мы могли двигаться дальше без лишней суеты.\n\nС уважением`,
    };
  }
  const reasonNote =
    reason === 'no_api_key'
      ? 'AI analysis is unavailable (API key not configured).'
      : reason === 'invalid_json'
        ? 'The assistant response could not be parsed.'
        : reason === 'quota_rate_limit'
          ? `The model did not respond: provider quota or rate limit was hit.${retryHintEn}`
          : 'The analysis service is temporarily unavailable (network or API error).';
  const nextQuota =
    reason === 'quota_rate_limit'
      ? `Try “AI analysis” again later${retryAfterSeconds ? ` (~${retryAfterSeconds}s)` : ''} or update your Google API plan/key. Until then, handle the lead manually.`
      : `Send ${clientName} a short note: confirm the request is still relevant and suggest a quick call or async reply—whatever they prefer.`;
  return {
    summary: `${reasonNote} Lead "${lead.title}" for ${clientName}, status ${lead.status}. From the description, clarify needs and agree on a clear next step.`,
    nextAction: nextQuota,
    email: `Hello${lead.client.name ? ` ${lead.client.name}` : ''},\n\nFollowing up on "${lead.title}". Would a brief call work, or would you rather reply here? Either way, happy to keep this simple and move at your pace.\n\nBest regards`,
  };
}

type GroqChatCompletionsResponse = {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
};
