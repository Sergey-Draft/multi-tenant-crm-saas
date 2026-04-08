import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UserOption {
  value: string;
  label: string;
}

/**
 * Получить имя пользователя по ID
 * @param userId - ID пользователя
 * @param userOptions - массив опций пользователей
 * @returns имя пользователя или "unknown user"
 */
export const getUserName = (
  userId: string | null | undefined,
  userOptions: UserOption[]
): string => {
  if (!userId) return "unknown user";

  const user = userOptions?.find((option) => option.value === userId);
  return user?.label || "unknown user";
};
