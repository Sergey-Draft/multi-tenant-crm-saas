import { redirect } from "next/navigation";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { login } from "../api/login";
import register, { registerDto } from "../api/register";
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
      redirect("/login");
    },

    clearError: () => set({ error: null }),

    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        // Ваша логика входа
        const response = await register(data);

        console.log('Res', response)
        
        set({
          user: response.user,
          company: response.company,
          isLoading: false,
        });
        toast.success("Вы успешно прошли регистрацию");
        setTimeout(()=> redirect('/login'), 3000)
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : "Ошибка регистрации" 
        });
        toast.error("Ошибка при регистрации");
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
        redirect("/dashboard");
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : "Ошибка входа" 
        });
      }
    },
  }))
);