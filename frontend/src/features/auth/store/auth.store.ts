import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface AuthState {
  user: any | null
  accessToken: string | null
  refreshToken: string | null

  setUser: (user: any) => void

  setAuth: (data: {
    user: any
    accessToken: string
    refreshToken: string
  }) => void

  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,

    setUser: (user) =>
      set({ user }),
  
    setAuth: ({ user, accessToken, refreshToken }) =>
      set({ user, accessToken, refreshToken }),
  
    logout: () =>
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
      }),
  }))
)