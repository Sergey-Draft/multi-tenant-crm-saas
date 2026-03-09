import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface AuthState {
  accessToken: string | null
  users: unknown[] 
  user: unknown[] 
  isLoading: boolean
  setToken: (token: string | null) => void
  setUser: (user: string[] | []  ) => void
  setUsers: (users: object[] | []  ) => void
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    users: [],
    user: [],
    isLoading: false,
    accessToken: null,
    setToken: (token) => set({ accessToken: token }),
    setUser: (user) => set({user: user}),
    setUsers: (users) => set({users: users}),
  }))
)