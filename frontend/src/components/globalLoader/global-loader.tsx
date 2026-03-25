"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalLoaderProps {
  isLoading: boolean;
  message?: string;
}

export function GlobalLoader({ isLoading, message = "Loading..." }: GlobalLoaderProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        "flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm",
        "transition-all duration-300"
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}