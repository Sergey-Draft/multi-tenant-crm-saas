import { redirect } from "next/navigation";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getApiErrorMessage } from "@/lib/api-client";
import { login } from "../api/login";
import registerApi, { registerDto } from "../api/register";
import { toast } from "sonner";

interface AuthState {
  user: any | null;
  company: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean; // Добавляем состояние загрузки
  error: string | null; // Добавляем для обработки ошибок

  setUser: (user: any) => void;
  setAuth: (data: { user: any; accessToken: string; refreshToken: string }) => void;
  register: (data: registerDto ) => Promise<void>;
  logout: () => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set, get) => ({
    user: null,
    company: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user }),

    setAuth: ({ user, accessToken, refreshToken }) =>
      set({ user, accessToken, refreshToken }),

    logout: () => {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null,
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      redirect("/");
    },

    clearError: () => set({ error: null }),

    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await registerApi(data);

        set({
          user: response.user,
          company: response.company,
          isLoading: false,
        });
        toast.success("Вы успешно прошли регистрацию");
        setTimeout(() => redirect("/login"), 1500);
        return response;
      } catch (error) {
        const message = getApiErrorMessage(error, "Ошибка регистрации");
        set({ isLoading: false, error: message });
        toast.error(message);
      }
    },

    login: async ({ email, password }) => {
      set({ isLoading: true, error: null });
      
      try {
        // Ваша логика входа
        const data = await login({ email, password });
        
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isLoading: false,
        });
        
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        document.cookie = `accessToken=${data.accessToken}`;
        setTimeout(() => redirect("/dashboard"), 300);
      } catch (error) {
        set({
          isLoading: false,
          error: getApiErrorMessage(error, "Ошибка входа"),
        });
        toast.error(getApiErrorMessage(error, "Ошибка входа"),);
      }
    },
  }))
);