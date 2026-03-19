"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Globe, Code2, Copy, Check, Lock, Unlock,
  ChevronDown, ChevronRight, Send, Loader2, ShieldCheck,
} from "lucide-react"

// ─── API Endpoints Definition ─────────────────────────────────────────────────

interface ApiEndpoint {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  path: string
  description: string
  requiresAuth: boolean
  bodyExample?: string
}

interface ApiGroup {
  group: string
  endpoints: ApiEndpoint[]
}

const API_BASE = "http://localhost:3001"

const API_GROUPS: ApiGroup[] = [
  {
    group: "Auth",
    endpoints: [
      {
        method: "POST", path: "/auth/register",
        description: "Регистрация компании и первого пользователя",
        requiresAuth: false,
        bodyExample: JSON.stringify({ companyName: "ООО Ромашка", name: "Иван", email: "ivan@example.com", password: "secret" }, null, 2),
      },
      {
        method: "POST", path: "/auth/login",
        description: "Вход в систему", requiresAuth: false,
        bodyExample: JSON.stringify({ email: "user@example.com", password: "secret" }, null, 2),
      },
      { method: "GET", path: "/auth/me", description: "Текущий пользователь", requiresAuth: true },
    ],
  },
  {
    group: "Companies",
    endpoints: [
      {
        method: "POST", path: "/companies", description: "Создать компанию", requiresAuth: true,
        bodyExample: JSON.stringify({ name: "ООО Пример" }, null, 2),
      },
      { method: "GET", path: "/companies", description: "Список компаний", requiresAuth: true },
      { method: "GET", path: "/companies/:id", description: "Компания по ID", requiresAuth: true },
    ],
  },
  {
    group: "Clients",
    endpoints: [
      {
        method: "POST", path: "/clients", description: "Создать клиента", requiresAuth: true,
        bodyExample: JSON.stringify({ name: "Клиент", email: "client@mail.ru", phone: "+375 29 292929" }, null, 2),
      },
      { method: "GET",    path: "/clients",     description: "Список клиентов",  requiresAuth: true },
      { method: "GET",    path: "/clients/:id", description: "Клиент по ID",     requiresAuth: true },
      {
        method: "PATCH",  path: "/clients/:id", description: "Обновить клиента", requiresAuth: true,
        bodyExample: JSON.stringify({ name: "Новое имя" }, null, 2),
      },
      { method: "DELETE", path: "/clients/:id", description: "Удалить клиента",  requiresAuth: true },
    ],
  },
  {
    group: "Leads",
    endpoints: [
      {
        method: "POST", path: "/leads", description: "Создать лид", requiresAuth: true,
        bodyExample: JSON.stringify({ title: "Новый лид", clientId: "uuid", description: "Описание", dateDue: new Date().toISOString() }, null, 2),
      },
      { method: "GET",    path: "/leads",            description: "Список лидов",     requiresAuth: true },
      { method: "GET",    path: "/leads/:id",        description: "Лид по ID",        requiresAuth: true },
      {
        method: "PATCH",  path: "/leads/:id",        description: "Обновить лид",     requiresAuth: true,
        bodyExample: JSON.stringify({ title: "Обновлённый лид" }, null, 2),
      },
      {
        method: "PATCH",  path: "/leads/:id/status", description: "Сменить статус",   requiresAuth: true,
        bodyExample: JSON.stringify({ status: "IN_PROGRESS" }, null, 2),
      },
      { method: "DELETE", path: "/leads/:id",        description: "Удалить лид",      requiresAuth: true },
    ],
  },
  {
    group: "Tasks",
    endpoints: [
      {
        method: "POST", path: "/tasks", description: "Создать задачу", requiresAuth: true,
        bodyExample: JSON.stringify({ title: "Задача", leadId: "uuid", assignedToId: "uuid" }, null, 2),
      },
      { method: "GET",    path: "/tasks",            description: "Список задач",     requiresAuth: true },
      { method: "GET",    path: "/tasks/:id",        description: "Задача по ID",     requiresAuth: true },
      {
        method: "PATCH",  path: "/tasks/:id",        description: "Обновить задачу",  requiresAuth: true,
        bodyExample: JSON.stringify({ title: "Новый заголовок" }, null, 2),
      },
      {
        method: "PATCH",  path: "/tasks/:id/status", description: "Сменить статус",   requiresAuth: true,
        bodyExample: JSON.stringify({ status: "DONE" }, null, 2),
      },
      { method: "DELETE", path: "/tasks/:id",        description: "Удалить задачу",   requiresAuth: true },
    ],
  },
  {
    group: "Users",
    endpoints: [
      { method: "GET",   path: "/users",          description: "Список пользователей",    requiresAuth: true },
      { method: "GET",   path: "/users/:id",      description: "Пользователь по ID",      requiresAuth: true },
      {
        method: "PATCH", path: "/users/:id",      description: "Обновить пользователя",   requiresAuth: true,
        bodyExample: JSON.stringify({ name: "Новое имя", email: "new@mail.ru" }, null, 2),
      },
      {
        method: "PATCH", path: "/users/:id/role", description: "Сменить роль",            requiresAuth: true,
        bodyExample: JSON.stringify({ role: "MANAGER" }, null, 2),
      },
    ],
  },
]

const METHOD_STYLES: Record<string, string> = {
  GET:    "bg-blue-500/10 text-blue-600 border border-blue-200 dark:border-blue-800",
  POST:   "bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-800",
  PATCH:  "bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-800",
  PUT:    "bg-purple-500/10 text-purple-600 border border-purple-200 dark:border-purple-800",
  DELETE: "bg-red-500/10 text-red-600 border border-red-200 dark:border-red-800",
}

const STATUS_STYLE = (s: number) =>
  s >= 200 && s < 300 ? "bg-emerald-500/10 text-emerald-600"
  : s >= 400           ? "bg-red-500/10 text-red-600"
  :                      "bg-muted text-muted-foreground"

// ─── Endpoint Row ─────────────────────────────────────────────────────────────

function EndpointRow({ endpoint }: { endpoint: ApiEndpoint }) {
  const [isOpen,     setIsOpen]     = useState(false)
  const [url,        setUrl]        = useState(`${API_BASE}${endpoint.path}`)
  const [body,       setBody]       = useState(endpoint.bodyExample ?? "")
  const [response,   setResponse]   = useState<string | null>(null)
  const [httpStatus, setHttpStatus] = useState<number | null>(null)
  const [isLoading,  setIsLoading]  = useState(false)
  const [copied,     setCopied]     = useState(false)

  const hasBody = ["POST", "PATCH", "PUT"].includes(endpoint.method)

  const handleSend = async () => {
    setIsLoading(true); setResponse(null); setHttpStatus(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (endpoint.requiresAuth && token) headers["Authorization"] = `Bearer ${token}`
      const options: RequestInit = { method: endpoint.method, headers }
      if (hasBody && body.trim()) options.body = body
      const res = await fetch(url, options)
      setHttpStatus(res.status)
      try {
        setResponse(JSON.stringify(await res.json(), null, 2))
      } catch {
        setResponse((await res.text()) || "(пустой ответ)")
      }
    } catch (err) {
      setResponse(`Ошибка: ${err instanceof Error ? err.message : "Неизвестная ошибка"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${METHOD_STYLES[endpoint.method]}`}>
            {endpoint.method}
          </span>
          <code className="text-sm font-mono text-foreground shrink-0">{endpoint.path}</code>
          <span className="text-sm text-muted-foreground truncate hidden sm:block">{endpoint.description}</span>
          {endpoint.requiresAuth
            ? <Lock   className="h-3 w-3 text-muted-foreground/60 shrink-0" />
            : <Unlock className="h-3 w-3 text-muted-foreground/30 shrink-0" />
          }
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <Button
            variant="outline" size="sm" className="h-7 text-xs"
            onClick={(e) => { e.stopPropagation(); setIsOpen((v) => !v) }}
          >Try</Button>
          {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {isOpen && (
        <div className="border-t px-4 py-4 bg-muted/10 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">URL</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} className="font-mono text-sm h-8" />
            {endpoint.path.includes(":id") && (
              <p className="text-[11px] text-muted-foreground">
                Замените <code className="bg-muted px-1 rounded">:id</code> на реальный идентификатор
              </p>
            )}
          </div>

          {hasBody && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Request Body (JSON)</label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-sm min-h-[100px] resize-y" placeholder="{}" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSend} disabled={isLoading} className="gap-1.5">
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {isLoading ? "Отправка..." : "Отправить"}
            </Button>
            {endpoint.requiresAuth && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> Текущий JWT
              </span>
            )}
          </div>

          {response !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ответ</label>
                  {httpStatus && (
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded font-medium ${STATUS_STYLE(httpStatus)}`}>
                      {httpStatus}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost" size="sm" className="h-6 px-2 gap-1 text-xs"
                  onClick={() => { navigator.clipboard.writeText(response); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Скопировано" : "Копировать"}
                </Button>
              </div>
              <ScrollArea className="h-48 border rounded-md">
                <pre className="text-xs font-mono p-3 whitespace-pre-wrap break-all leading-relaxed">{response}</pre>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BackendApiPage() {
  return (
    <div className="mx-auto space-y-6">
      <div>
        <p className="text-base text-muted-foreground mt-0.5">Документация и интерактивное тестирование эндпоинтов</p>
      </div>

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="swagger" className="gap-1.5 text-base">
            <Globe className="h-3.5 w-3.5" /> Swagger
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="gap-1.5 text-base">
            <ShieldCheck className="h-3.5 w-3.5" /> API Эндпоинты
          </TabsTrigger>
        </TabsList>

        {/* Swagger */}
        <TabsContent value="swagger" className="mt-5">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" /> Swagger / OpenAPI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <a
                  href="http://localhost:3001/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Swagger UI</p>
                      <p className="text-xs text-muted-foreground font-mono">http://localhost:3001/api</p>
                    </div>
                  </div>
                  <Badge className="text-xs">Открыть ↗</Badge>
                </a>
                <a
                  href="http://localhost:3001/api/json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Code2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">OpenAPI JSON</p>
                      <p className="text-xs text-muted-foreground font-mono">http://localhost:3001/api/json</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">JSON ↗</Badge>
                </a>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Локальная документация</p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <code className="text-sm font-mono text-foreground flex-1">docs/API.md</code>
                  <Badge variant="outline" className="text-xs">local</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints */}
        <TabsContent value="endpoints" className="mt-5">
          <div className="max-w-5xl space-y-6">
            {API_GROUPS.map((group) => (
              <div key={group.group}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold">{group.group}</h3>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{group.endpoints.length}</Badge>
                </div>
                <div className="space-y-1.5">
                  {group.endpoints.map((ep) => (
                    <EndpointRow key={`${ep.method}-${ep.path}`} endpoint={ep} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
