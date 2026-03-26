"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "../hooks/use-user";
import { toLabelMap, USER_ROLE_OPTIONS } from "@/lib/options";

const ROLE_LABELS = toLabelMap(USER_ROLE_OPTIONS);

interface UserDetailModalProps {
  userId: string | null;
  onClose: () => void;
}

export function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const { data: user, isLoading } = useUser(userId);

  return (
    <Dialog open={Boolean(userId)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              user?.name || user?.email || "Пользователь"
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : user ? (
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground w-28 shrink-0">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-28 shrink-0">Роль</span>
              <span>{ROLE_LABELS[user.role] ?? user.role}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-28 shrink-0">
                Компания
              </span>
              <span className="font-mono text-xs">{user.companyId}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-28 shrink-0">
                Создан
              </span>
              <span>
                {new Date(user.createdAt).toLocaleString("ru", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
