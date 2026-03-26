"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCompany } from "@/features/companies/hooks/use-company";
import { updateUser } from "@/features/users/api/update-user";
import { toast } from "sonner";
import {
  User,
  Building2,
  Copy,
  Check,
  Lock,
  Loader2,
  Pencil,
  X,
  Save,
  Info,
} from "lucide-react";
import { TitleSEO } from "@/components/titleSEO/title-SEO";

// ─── CopyButton ──────────────────────────────────────────────────────────────

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

// ─── ReadonlyField ────────────────────────────────────────────────────────────

function ReadonlyField({
  label,
  value,
  mono = false,
  copy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-b-0 gap-3">
      <span className="text-sm text-muted-foreground shrink-0 w-28">
        {label}
      </span>
      <span
        className={`text-sm flex-1 min-w-0 truncate ${
          mono ? "font-mono text-xs text-muted-foreground" : "font-medium"
        }`}
      >
        {value}
      </span>
      {copy && <CopyButton value={value} />}
    </div>
  );
}

// ─── User Profile Card ────────────────────────────────────────────────────────

function UserProfileCard() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const { mutate, isPending } = useMutation({
    mutationFn: () => updateUser(user?.id ?? user?.userId, { name, email }),
    onSuccess: (updated) => {
      setUser({ ...user, ...updated });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Профиль обновлён");
      setEditing(false);
    },
    onError: () => toast.error("Не удалось сохранить изменения"),
  });

  const handleCancel = () => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setEditing(false);
  };

  if (!user)
    return (
      <p className="text-sm text-muted-foreground">Нет данных о пользователе</p>
    );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
              {(user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base">
                {user.name ?? user.email}
              </CardTitle>
              <CardDescription className="text-xs">{user.role}</CardDescription>
            </div>
          </div>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" /> Изменить
            </Button>
          ) : (
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={handleCancel}
                disabled={isPending}
              >
                <X className="h-3.5 w-3.5" /> Отмена
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => mutate()}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Сохранить
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Editable */}
        <div className="rounded-lg border bg-card p-3 space-y-3">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Редактируемые поля
          </p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="u-name" className="text-sm">
                Имя
              </Label>
              {editing ? (
                <Input
                  id="u-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Введите имя"
                />
              ) : (
                <div className="flex items-center gap-2 h-8 px-3 rounded-md border bg-muted/30 text-sm">
                  <span className="flex-1">
                    {user.name || (
                      <span className="text-muted-foreground italic">
                        не указано
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="u-email" className="text-sm">
                Email
              </Label>
              {editing ? (
                <Input
                  id="u-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="email@example.com"
                />
              ) : (
                <div className="flex items-center gap-2 h-8 px-3 rounded-md border bg-muted/30 text-sm">
                  <span className="flex-1">{user.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Readonly */}
        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Lock className="h-3 w-3 text-muted-foreground/60" />
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Только чтение
            </p>
          </div>
          <ReadonlyField
            label="User ID"
            value={user.id ?? user.userId ?? "—"}
            mono
            copy={true}
          />
          <ReadonlyField
            label="Company ID"
            value={user.companyId ?? "—"}
            mono
            copy={true}
          />
          <ReadonlyField label="Роль" value={user.role ?? "—"} copy={false} />
          {user.createdAt && (
            <ReadonlyField
              label="Создан"
              value={new Date(user.createdAt).toLocaleString("ru")}
              copy={false}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tenant Card ──────────────────────────────────────────────────────────────

function TenantCard() {
  const user = useAuthStore((s) => s.user);
  const { data: company, isLoading } = useCompany(user?.companyId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-sidebar-primary" />
          </div>
          <div>
            <CardTitle className="text-base">
              {isLoading ? "Загрузка..." : company?.name ?? "Компания"}
            </CardTitle>
            <CardDescription className="text-xs">
              Текущий тенант
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Загрузка данных...
          </div>
        ) : (
          <>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Идентификаторы
              </p>
              <ReadonlyField
                label="Company ID"
                value={company?.id ?? user?.companyId ?? "—"}
                mono
                copy={true}
              />
              <ReadonlyField
                label="Название"
                value={company?.name ?? "—"}
                copy={true}
              />
              {company?.createdAt && (
                <ReadonlyField
                  label="Создана"
                  value={new Date(company.createdAt).toLocaleString("ru")}
                  copy={false}
                />
              )}
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <p>
                Редактирование данных компании недоступно через API. Обратитесь
                к администратору.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserSettingsPage() {
  return (
    <div className=" mx-auto space-y-6">
      <TitleSEO
        title="Пользователь"
        description="Управление данными пользователя и компании"
        canonical="/settings/user"
      />

      <Tabs defaultValue="user">
        <TabsList>
          <TabsTrigger value="user" className="gap-1.5 text-base">
            <User className="h-3.5 w-3.5" /> Пользователь
          </TabsTrigger>
          <TabsTrigger value="tenant" className="gap-1.5 text-base">
            <Building2 className="h-3.5 w-3.5" /> Тенант
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="mt-5">
          <div className="max-w-xl">
            <UserProfileCard />
          </div>
        </TabsContent>

        <TabsContent value="tenant" className="mt-5">
          <div className="max-w-xl">
            <TenantCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
