import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getApiErrorMessage } from "@/lib/api-client";
import { login } from "../api/login";
import registerApi, { registerDto } from "../api/register";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";

/** Удалить accessToken cookie так же, как он мог быть выставлен (разные path). */
function clearAccessTokenCookie() {
  if (typeof document === "undefined") return;
  const expire = "max-age=0";
  const base = "accessToken=;";
  document.cookie = `${base} path=/; ${expire}; SameSite=Lax`;
  document.cookie = `${base} path=/login; ${expire}; SameSite=Lax`;
  document.cookie = `${base} path=/register; ${expire}; SameSite=Lax`;
  document.cookie = `${base} ${expire}`;
}

interface AuthState {
  user: any | null;
  company: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Добавляем состояние загрузки
  error: string | null; // Добавляем для обработки ошибок

  setUser: (user: any) => void;
  setAuth: (data: { user: any; accessToken: string; refreshToken: string }) => void;
  register: (data: registerDto ) => Promise<boolean>;
  logout: () => void;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    company: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user }),

    setAuth: ({ user, accessToken, refreshToken }) =>
      set({ user, accessToken, refreshToken, isAuthenticated: true }),

    logout: () => {
      queryClient.clear();
      set({
        user: null,
        company: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      clearAccessTokenCookie();
      if (typeof window !== "undefined") {
        window.location.assign("/");
      }
    },

    clearError: () => set({ error: null }),

    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await registerApi(data);

        set({
          user: response.user,
          company: response.company,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } catch (error) {
        const message = getApiErrorMessage(error, "Ошибка регистрации");
        set({ isLoading: false, error: message });
        return false;
      }
    },

    login: async ({ email, password }) => {
      set({ isLoading: true, error: null });
      
      try {
        const data = await login({ email, password });
        
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        queryClient.clear();
        document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax`;
        return true;
      } catch (error) {
        const message = getApiErrorMessage(error, "Ошибка входа");
        set({
          isLoading: false,
          error: message,
        });
        return false;
      }
    },
  }))
);