import { create } from "zustand";

export interface StubCompany {
  id: string;
  name: string;
}

interface ImpersonationState {
  /** Компания, которую сейчас "просматривает" супер-админ вместо своей. */
  active: StubCompany | null;
  start: (company: StubCompany) => void;
  stop: () => void;
}

/**
 * Визуальная заглушка переключения тенанта для SUPER_ADMIN.
 * Хранит только локальный UI-стейт (для скриншотов/демо) — не обращается
 * к backend и не переиздаёт JWT. Реальная реализация появится отдельным этапом.
 */
export const useImpersonationStore = create<ImpersonationState>((set) => ({
  active: null,
  start: (company) => set({ active: company }),
  stop: () => set({ active: null }),
}));
