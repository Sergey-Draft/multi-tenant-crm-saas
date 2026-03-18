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
import { useAuthStore } from "@/features/auth/store/auth.store"
import { useCompany } from "@/features/companies/hooks/use-company"
import {
  User,
  Building2,
  Code2,
  Globe,
  Copy,
  Check,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Send,
  Loader2,
} from "lucide-react"

// ─── API Endpoints Definition ──────────────────────────────────────────────

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
        method: "POST",
        path: "/auth/register",
        description: "Регистрация компании и первого пользователя",
        requiresAuth: false,
        bodyExample: JSON.stringify(
          { companyName: "ООО Ромашка", name: "Иван", email: "ivan@example.com", password: "secret" },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/auth/login",
        description: "Вход в систему",
        requiresAuth: false,
        bodyExample: JSON.stringify({ email: "user@example.com", password: "secret" }, null, 2),
      },
      {
        method: "GET",
        path: "/auth/me",
        description: "Текущий пользователь",
        requiresAuth: true,
      },
    ],
  },
  {
    group: "Companies",
    endpoints: [
      {
        method: "POST",
        path: "/companies",
        description: "Создать компанию",
        requiresAuth: true,
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
        method: "POST",
        path: "/clients",
        description: "Создать клиента",
        requiresAuth: true,
        bodyExample: JSON.stringify({ name: "Клиент", email: "client@mail.ru", phone: "+7 999 000 00 00" }, null, 2),
      },
      { method: "GET", path: "/clients", description: "Список клиентов", requiresAuth: true },
      { method: "GET", path: "/clients/:id", description: "Клиент по ID", requiresAuth: true },
      {
        method: "PATCH",
        path: "/clients/:id",
        description: "Обновить клиента",
        requiresAuth: true,
        bodyExample: JSON.stringify({ name: "Новое имя" }, null, 2),
      },
      { method: "DELETE", path: "/clients/:id", description: "Удалить клиента", requiresAuth: true },
    ],
  },
  {
    group: "Leads",
    endpoints: [
      {
        method: "POST",
        path: "/leads",
        description: "Создать лид",
        requiresAuth: true,
        bodyExample: JSON.stringify(
          { title: "Новый лид", clientId: "uuid", description: "Описание", dateDue: new Date().toISOString() },
          null,
          2
        ),
      },
      { method: "GET", path: "/leads", description: "Список лидов", requiresAuth: true },
      { method: "GET", path: "/leads/:id", description: "Лид по ID", requiresAuth: true },
      {
        method: "PATCH",
        path: "/leads/:id",
        description: "Обновить лид",
        requiresAuth: true,
        bodyExample: JSON.stringify({ title: "Обновлённый лид" }, null, 2),
      },
      {
        method: "PATCH",
        path: "/leads/:id/status",
        description: "Сменить статус лида",
        requiresAuth: true,
        bodyExample: JSON.stringify({ status: "IN_PROGRESS" }, null, 2),
      },
      { method: "DELETE", path: "/leads/:id", description: "Удалить лид", requiresAuth: true },
    ],
  },
  {
    group: "Tasks",
    endpoints: [
      {
        method: "POST",
        path: "/tasks",
        description: "Создать задачу",
        requiresAuth: true,
        bodyExample: JSON.stringify({ title: "Задача", leadId: "uuid", assignedToId: "uuid" }, null, 2),
      },
      { method: "GET", path: "/tasks", description: "Список задач", requiresAuth: true },
      { method: "GET", path: "/tasks/:id", description: "Задача по ID", requiresAuth: true },
      {
        method: "PATCH",
        path: "/tasks/:id",
        description: "Обновить задачу",
        requiresAuth: true,
        bodyExample: JSON.stringify({ title: "Новый заголовок" }, null, 2),
      },
      {
        method: "PATCH",
        path: "/tasks/:id/status",
        description: "Сменить статус задачи",
        requiresAuth: true,
        bodyExample: JSON.stringify({ status: "DONE" }, null, 2),
      },
      { method: "DELETE", path: "/tasks/:id", description: "Удалить задачу", requiresAuth: true },
    ],
  },
  {
    group: "Users",
    endpoints: [
      { method: "GET", path: "/users", description: "Список пользователей", requiresAuth: true },
      { method: "GET", path: "/users/:id", description: "Пользователь по ID", requiresAuth: true },
      {
        method: "PATCH",
        path: "/users/:id",
        description: "Обновить пользователя",
        requiresAuth: true,
        bodyExample: JSON.stringify({ name: "Новое имя" }, null, 2),
      },
      {
        method: "PATCH",
        path: "/users/:id/role",
        description: "Сменить роль пользователя",
        requiresAuth: true,
        bodyExample: JSON.stringify({ role: "MANAGER" }, null, 2),
      },
    ],
  },
]

// ─── Method badge colours ───────────────────────────────────────────────────

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-600 border border-blue-200 dark:border-blue-800",
  POST: "bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-800",
  PATCH: "bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-800",
  PUT: "bg-purple-500/10 text-purple-600 border border-purple-200 dark:border-purple-800",
  DELETE: "bg-red-500/10 text-red-600 border border-red-200 dark:border-red-800",
}

const STATUS_STYLE = (s: number) =>
  s >= 200 && s < 300
    ? "bg-emerald-500/10 text-emerald-600"
    : s >= 400
    ? "bg-red-500/10 text-red-600"
    : "bg-muted text-muted-foreground"

// ─── Endpoint Row ───────────────────────────────────────────────────────────

function EndpointRow({ endpoint }: { endpoint: ApiEndpoint }) {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState(`${API_BASE}${endpoint.path}`)
  const [body, setBody] = useState(endpoint.bodyExample ?? "")
  const [response, setResponse] = useState<string | null>(null)
  const [httpStatus, setHttpStatus] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const hasBody = ["POST", "PATCH", "PUT"].includes(endpoint.method)

  const handleSend = async () => {
    setIsLoading(true)
    setResponse(null)
    setHttpStatus(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (endpoint.requiresAuth && token) {
        headers["Authorization"] = `Bearer ${token}`
      }
      const options: RequestInit = { method: endpoint.method, headers }
      if (hasBody && body.trim()) {
        options.body = body
      }
      const res = await fetch(url, options)
      setHttpStatus(res.status)
      try {
        const json = await res.json()
        setResponse(JSON.stringify(json, null, 2))
      } catch {
        const text = await res.text()
        setResponse(text || "(пустой ответ)")
      }
    } catch (err) {
      setResponse(`Ошибка: ${err instanceof Error ? err.message : "Неизвестная ошибка"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden transition-all">
      <div
        className="flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${METHOD_STYLES[endpoint.method]}`}
          >
            {endpoint.method}
          </span>
          <code className="text-sm font-mono text-foreground shrink-0">{endpoint.path}</code>
          <span className="text-sm text-muted-foreground truncate">{endpoint.description}</span>
          {endpoint.requiresAuth ? (
            <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
          ) : (
            <Unlock className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen((v) => !v)
            }}
          >
            Try
          </Button>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="border-t px-4 py-4 bg-muted/10 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono text-sm h-8"
            />
            {endpoint.path.includes(":id") && (
              <p className="text-[11px] text-muted-foreground">
                Замените <code className="bg-muted px-1 rounded">:id</code> на реальный идентификатор
              </p>
            )}
          </div>

          {hasBody && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Request Body (JSON)
              </label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="font-mono text-sm min-h-[100px] resize-y"
                placeholder="{}"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSend} disabled={isLoading} className="gap-1.5">
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {isLoading ? "Отправка..." : "Отправить"}
            </Button>
            {endpoint.requiresAuth && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> Используется текущий JWT
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
                <Button variant="ghost" size="sm" className="h-6 px-2 gap-1 text-xs" onClick={handleCopyResponse}>
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

// ─── Info Row helper ────────────────────────────────────────────────────────

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex items-start justify-between py-2.5 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground w-36 shrink-0">{label}</span>
      <span className={`text-sm font-medium flex-1 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
      <Button variant="ghost" size="sm" className="h-6 px-1.5 ml-2 shrink-0" onClick={handleCopy}>
        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
      </Button>
    </div>
  )
}

// ─── Backend Info Tab ───────────────────────────────────────────────────────

function BackendInfoTab() {
  const user = useAuthStore((s) => s.user)
  const { data: company, isLoading: companyLoading } = useCompany(user?.companyId)

  return (
    <Tabs defaultValue="user" className="mt-1">
      <TabsList className="mb-4">
        <TabsTrigger value="user" className="gap-1.5">
          <User className="h-3.5 w-3.5" /> Пользователь
        </TabsTrigger>
        <TabsTrigger value="tenant" className="gap-1.5">
          <Building2 className="h-3.5 w-3.5" /> Тенант
        </TabsTrigger>
        <TabsTrigger value="swagger" className="gap-1.5">
          <Globe className="h-3.5 w-3.5" /> Swagger
        </TabsTrigger>
        <TabsTrigger value="endpoints" className="gap-1.5">
          <Code2 className="h-3.5 w-3.5" /> API Эндпоинты
        </TabsTrigger>
      </TabsList>

      {/* User Info */}
      <TabsContent value="user">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Текущий пользователь
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div>
                <InfoRow label="User ID" value={user.id ?? user.userId ?? "—"} mono />
                <InfoRow label="Email" value={user.email ?? "—"} />
                <InfoRow label="Имя" value={user.name ?? "—"} />
                <InfoRow label="Company ID" value={user.companyId ?? "—"} mono />
                <InfoRow label="Роль" value={user.role ?? "—"} />
                <InfoRow label="Создан" value={user.createdAt ? new Date(user.createdAt).toLocaleString("ru") : "—"} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Нет данных о пользователе</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tenant Info */}
      <TabsContent value="tenant">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Текущий тенант
            </CardTitle>
          </CardHeader>
          <CardContent>
            {companyLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Загрузка...
              </div>
            ) : company ? (
              <div>
                <InfoRow label="Company ID" value={company.id} mono />
                <InfoRow label="Название" value={company.name} />
                {company.createdAt && (
                  <InfoRow label="Создана" value={new Date(company.createdAt).toLocaleString("ru")} />
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Данные компании не загружены</p>
                {user?.companyId && (
                  <InfoRow label="Company ID" value={user.companyId} mono />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Swagger */}
      <TabsContent value="swagger">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" /> Swagger / OpenAPI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center space-y-2">
              <Globe className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">Swagger не настроен</p>
              <p className="text-xs text-muted-foreground/60">
                Для подключения добавьте <code className="bg-muted px-1 rounded">@nestjs/swagger</code> в{" "}
                <code className="bg-muted px-1 rounded">main.ts</code>
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Документация</p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                <code className="text-sm font-mono text-foreground flex-1">docs/API.md</code>
                <Badge variant="outline" className="text-xs">local</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* API Endpoints */}
      <TabsContent value="endpoints">
        <div className="space-y-5">
          {API_GROUPS.map((group) => (
            <div key={group.group}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold">{group.group}</h3>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                  {group.endpoints.length}
                </Badge>
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
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Настройки</h1>
        <p className="text-sm text-muted-foreground mt-1">Управление профилем, компанией и инструменты разработки</p>
      </div>

      <Tabs defaultValue="backend">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="company">Компания</TabsTrigger>
          <TabsTrigger value="backend">Backend Info</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Профиль</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Раздел в разработке</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Компания</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Раздел в разработке</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backend" className="mt-4">
          <BackendInfoTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
