import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface AuthState {
  accessToken: string | null
  setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    accessToken: null,
    setToken: (token) => set({ accessToken: token }),
  }))
)