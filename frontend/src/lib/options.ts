import { Option } from "@/types/option";

export const LEAD_STATUS_OPTIONS: Option[] = [
  { value: "NEW",         label: "Новый" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE",        label: "Готово" },
  { value: "REJECTED",    label: "Отклонён" },
];

export const TASK_STATUS_OPTIONS: Option[] = [
  { value: "TODO",        label: "К выполнению" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE",        label: "Готово" },
];

export const USER_ROLE_OPTIONS: Option[] = [
  { value: "OWNER",    label: "Владелец" },
  {value: 'SUPER_ADMIN', label: "Супер-админ"},
  { value: "ADMIN",    label: "Администратор" },
  { value: "MANAGER",  label: "Менеджер" },
  { value: "EMPLOYEE", label: "Сотрудник" },
];

// Хелпер: превращает массив опций в словарь { value -> label }
// Пример: toLabelMap(USER_ROLE_OPTIONS)["MANAGER"] → "Менеджер"
export function toLabelMap(options: Option[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]));
}
