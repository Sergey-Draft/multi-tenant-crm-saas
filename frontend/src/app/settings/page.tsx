/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCompany } from "@/features/companies/hooks/use-company";
import {
  User,
  Code2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Check,
  Copy,
} from "lucide-react";

const API_BASE = "http://localhost:3001";

// ─── JWT decode (no library needed — payload is plain base64) ─────────────────

interface JwtPayload {
  sub: string;
  companyId: string;
  role: string;
  iat: number;
  exp: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    return JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
  } catch {
    return null;
  }
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "истёк";
  if (seconds < 60) return `${seconds} сек`;
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)} мин ${seconds % 60} сек`;
  return `${Math.floor(seconds / 3600)} ч ${Math.floor(
    (seconds % 3600) / 60
  )} мин`;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
      title="Копировать"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard() {
  const user = useAuthStore((s) => s.user);
  const [payload, setPayload] = useState<JwtPayload | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    const p = decodeJwt(token);
    if (!p) return;
    setPayload(p);

    const update = () => setSecondsLeft(p.exp - Math.floor(Date.now() / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const expired = secondsLeft !== null && secondsLeft <= 0;
  const critical = secondsLeft !== null && secondsLeft > 0 && secondsLeft < 120; // < 2 min
  const warning =
    secondsLeft !== null && secondsLeft >= 120 && secondsLeft < 300; // < 5 min

  const timerColor = expired
    ? "text-red-500"
    : critical
    ? "text-red-400"
    : warning
    ? "text-amber-500"
    : "text-emerald-500";

  const barPercent = payload
    ? Math.max(
        0,
        Math.min(100, ((secondsLeft ?? 0) / (payload.exp - payload.iat)) * 100)
      )
    : 0;

  const barColor = expired
    ? "bg-red-500"
    : critical
    ? "bg-red-400"
    : warning
    ? "bg-amber-400"
    : "bg-emerald-500";

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          <span className="text-base font-semibold">Сессия / JWT</span>
        </div>
        {secondsLeft !== null && (
          <Badge
            variant="outline"
            className={`text-sm gap-1 ${
              expired
                ? "border-red-300 text-red-500"
                : critical
                ? "border-red-200 text-red-400"
                : warning
                ? "border-amber-200 text-amber-500"
                : "border-emerald-200 text-emerald-500"
            }`}
          >
            {expired ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            {expired ? "Токен истёк" : "Активен"}
          </Badge>
        )}
      </div>

      {/* Timer */}
      {secondsLeft !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Истекает через
            </span>
            <span
              className={`font-mono font-bold text-lg tabular-nums ${timerColor}`}
            >
              {formatDuration(secondsLeft)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
              style={{ width: `${barPercent}%` }}
            />
          </div>
        </div>
      )}

      <Separator />

      {/* Payload fields */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-0.5">
            Sub (User ID)
          </p>
          <p className="font-mono text-sm truncate text-foreground/80">
            {payload?.sub ?? user?.id ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-0.5">
            Role
          </p>
          <p className="text-sm font-medium">
            {payload?.role ?? user?.role ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-0.5">
            Company ID
          </p>
          <p className="font-mono text-sm truncate text-foreground/80">
            {payload?.companyId ?? user?.companyId ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-0.5">
            Выдан (iat)
          </p>
          <p className="text-sm">
            {payload
              ? new Date(payload.iat * 1000).toLocaleTimeString("ru")
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-0.5">
            Истекает (exp)
          </p>
          <p className="text-sm">
            {payload
              ? new Date(payload.exp * 1000).toLocaleTimeString("ru")
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── API Health Card ──────────────────────────────────────────────────────────
// "online"   = HTTP 2xx  — сервер отвечает корректно
// "degraded" = HTTP 4xx  — сервер работает, но запрос не прошёл (напр. 401)
// "offline"  = HTTP 5xx или сеть недоступна

type HealthStatus = "idle" | "checking" | "online" | "degraded" | "offline";

interface HealthResult {
  status: HealthStatus;
  httpCode: number | null;
  latency: number | null;
}

function ApiHealthCard() {
  const [result, setResult] = useState<HealthResult>({
    status: "idle",
    httpCode: null,
    latency: null,
  });
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const check = useCallback(async () => {
    setResult((r) => ({ ...r, status: "checking" }));
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    const t0 = performance.now();
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const ms = Math.round(performance.now() - t0);
      setCheckedAt(new Date());
      setResult({
        latency: ms,
        httpCode: res.status,
        status:
          res.status < 300
            ? "online"
            : res.status < 500
            ? "degraded"
            : "offline",
      });
    } catch {
      setCheckedAt(new Date());
      setResult({ status: "offline", httpCode: null, latency: null });
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const { status, httpCode, latency } = result;

  const dotClass: Record<HealthStatus, string> = {
    idle: "bg-muted-foreground/40",
    checking: "bg-amber-400 animate-pulse",
    online: "bg-emerald-500",
    degraded: "bg-amber-400",
    offline: "bg-red-500",
  };

  const labelText: Record<HealthStatus, string> = {
    idle: "Не проверено",
    checking: "Проверка...",
    online: "Онлайн",
    degraded: "Доступен (ошибка запроса)",
    offline: "Недоступен",
  };

  const labelColor: Record<HealthStatus, string> = {
    idle: "text-muted-foreground",
    checking: "text-amber-500",
    online: "text-emerald-600",
    degraded: "text-amber-600",
    offline: "text-red-500",
  };

  const latencyColor =
    latency === null
      ? ""
      : latency < 100
      ? "text-emerald-500"
      : latency < 300
      ? "text-amber-500"
      : "text-red-500";

  const StatusIcon =
    status === "offline" ? WifiOff : status === "degraded" ? AlertCircle : Wifi;

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className="h-5 w-5 text-muted-foreground" />
          <span className="text-base font-semibold">API Health</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-sm"
          onClick={check}
          disabled={status === "checking"}
        >
          {status === "checking" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Проверить
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full shrink-0 ${dotClass[status]}`} />
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${labelColor[status]}`}>
            {labelText[status]}
          </p>
          <p className="text-sm text-muted-foreground font-mono mt-0.5">
            {API_BASE}
          </p>
        </div>
        <div className="text-right shrink-0">
          {latency !== null && (
            <p
              className={`text-base font-mono font-bold tabular-nums ${latencyColor}`}
            >
              {latency} ms
            </p>
          )}
          {httpCode !== null && (
            <p className="text-sm text-muted-foreground font-mono">
              HTTP {httpCode}
            </p>
          )}
        </div>
      </div>

      {status === "degraded" && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            Сервер отвечает (HTTP {httpCode}), но запрос не выполнен.
            {httpCode === 401 &&
              " Возможно, токен истёк — попробуйте обновить страницу."}
          </span>
        </div>
      )}

      {checkedAt && (
        <p className="text-sm text-muted-foreground">
          Последняя проверка: {checkedAt.toLocaleTimeString("ru")}
        </p>
      )}
    </div>
  );
}

// ─── Nav Card ─────────────────────────────────────────────────────────────────

function NavCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="rounded-xl border bg-card p-5 h-full transition-all hover:border-primary/40 hover:shadow-sm hover:bg-muted/20">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          {badge && (
            <Badge variant="secondary" className="text-[10px]">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-base font-semibold mb-1">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        <div className="flex items-center gap-1 text-sm text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          Открыть <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsOverviewPage() {
  const user = useAuthStore((s) => s.user);
  const { data: company } = useCompany(user?.companyId);

  const [AccessToken,  setAccessToken]  = useState<string | null>(null);
  const [RefreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken"));
    setRefreshToken(localStorage.getItem("refreshToken"));
  }, []);

  function checkToken(token: string | null): string {
    if (!token) return "Неизвестное значение";
    return token;
  }

  return (
    <div className=" mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {user?.name ?? user?.email ?? "—"} ·{" "}
          {company?.name ?? user?.companyId ?? "—"} · {user?.role ?? "—"}
        </p>
      </div>

      {/* Quick info */}
      <div className="flex justify-start gap-4">
        <div className="rounded-xl border bg-white p-5 inline-block">
          <div className="flex flex-wrap gap-8  ">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                API Base
              </p>
              <code className="text-sm font-mono">{API_BASE}</code>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                Auth
              </p>
              <p className="text-sm">JWT Bearer · 15 мин / 7 дней</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                Multi-tenant
              </p>
              <p className="text-sm">
                Изоляция по{" "}
                <code className="bg-muted px-1 rounded text-sm">companyId</code>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                Stack
              </p>
              <p className="text-sm">NestJS · Prisma · Next.js 14</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 inline-block w-[30%] relative group">
          {/* Видимая часть - только заголовок */}
          <div className="cursor-pointer">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
              Текущий JWT
            </p>
            <p className="text-sm text-gray-500">Наведите для просмотра...</p>
          </div>

          {/* Раскрывающаяся часть поверх */}
          <div className="
    absolute top-0 left-0 w-full bg-white border rounded-xl shadow-xl p-5 z-50 
    opacity-0 invisible group-hover:opacity-100 group-hover:visible 
    transition-all duration-500 ease-in-out break-words
  ">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
              Текущий JWT
            </p>
            <div className="flex justify-between text-sm font-bold break-all">
              Access: <CopyButton value={checkToken(AccessToken)} />{" "}
            </div>
            <p className="text-sm break-all"> {AccessToken}</p>
            <div className="flex justify-between text-sm font-bold break-all mt-2">
              Refresh: <CopyButton value={checkToken(RefreshToken)} />{" "}
            </div>
            <p className="text-sm break-all"> {RefreshToken}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Live widgets */}
      <div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Системный статус · Live
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SessionCard />
          <ApiHealthCard />
        </div>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NavCard
          href="/settings/user"
          icon={User}
          title="Профиль"
          description="Редактирование имени, email. Данные пользователя и информация о тенанте."
        />
        <NavCard
          href="/settings/backend-api"
          icon={Code2}
          title="Backend API"
          description="Swagger UI, OpenAPI JSON, интерактивное тестирование эндпоинтов с текущим JWT."
          badge="Dev"
        />
      </div>
    </div>
  );
}
