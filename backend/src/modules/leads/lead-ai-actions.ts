import { LeadStatus } from '@prisma/client';

export type LeadAiAction =
  | { type: 'create_task'; title: string; deadline: string | null }
  | { type: 'add_note'; text: string }
  | { type: 'change_status'; status: LeadStatus };

// One tool with a list of actions: gpt-oss on Groq makes only one tool call per answer.
export const LEAD_AI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'propose_actions',
      description: 'Suggest CRM actions for this lead. The manager confirms them later.',
      parameters: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['create_task', 'add_note', 'change_status'] },
                title: { type: 'string', description: 'create_task: short task title' },
                deadline: {
                  type: 'string',
                  description: 'create_task: ISO 8601 with +03:00, omit if no date was mentioned',
                },
                text: { type: 'string', description: 'add_note: note text' },
                status: {
                  type: 'string',
                  enum: Object.values(LeadStatus),
                  description: 'change_status: new lead status',
                },
              },
              required: ['type'],
            },
          },
        },
        required: ['actions'],
      },
    },
  },
];

export function buildToolsInstruction(now: Date): string {
  const days: string[] = [];
  for (let i = 0; i < 14; i++) {
    const day = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    days.push(formatMinsk(day, { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }));
  }
  const nowText = formatMinsk(now, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

  return [
    `Now: ${nowText} (Europe/Minsk, UTC+03:00).`,
    `Calendar for the next 14 days: ${days.join('; ')}.`,
    'When the manager reports agreements, call results or asks to do something, call propose_actions ONCE with ALL suggested actions:',
    'a task for every agreed step, a note with the call summary, a status change only if the lead status clearly changes.',
    'Never list actions in text instead of calling the tool. Take dates from the calendar above and write them as ISO 8601 with +03:00.',
    'If the manager only asks a question, answer without tools.',
  ].join('\n');
}

type ToolCall = { function?: { name?: string; arguments?: string } };

export function parseToolCalls(toolCalls: ToolCall[] | undefined): LeadAiAction[] {
  const actions: LeadAiAction[] = [];

  for (const call of toolCalls ?? []) {
    if (call.function?.name !== 'propose_actions') continue;

    let items: unknown;
    try {
      items = JSON.parse(call.function.arguments || '{}').actions;
    } catch {
      continue;
    }
    if (!Array.isArray(items)) continue;

    for (const item of items) {
      const action = toAction(item);
      if (action) actions.push(action);
    }
  }

  return actions.slice(0, 10);
}

function toAction(item: Record<string, unknown>): LeadAiAction | null {
  switch (item?.type) {
    case 'create_task': {
      const title = cleanText(item.title, 200);
      return title ? { type: 'create_task', title, deadline: parseDeadline(item.deadline) } : null;
    }
    case 'add_note': {
      const text = cleanText(item.text, 5000);
      return text ? { type: 'add_note', text } : null;
    }
    case 'change_status': {
      const status = item.status as LeadStatus;
      return Object.values(LeadStatus).includes(status) ? { type: 'change_status', status } : null;
    }
    default:
      return null;
  }
}

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function parseDeadline(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function formatMinsk(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Minsk', ...options }).format(date);
}
