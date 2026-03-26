"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/** Тот же Checkbox, контур чуть темнее для читаемости в таблице. */
export function TableSelectCheckbox({
  className,
  ...props
}: React.ComponentProps<typeof Checkbox>) {
  return (
    <Checkbox
      {...props}
      className={cn(
        "border-foreground/40 dark:border-foreground/40",
        className
      )}
    />
  );
}
