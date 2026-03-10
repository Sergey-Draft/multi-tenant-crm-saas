"use client"

import { useEffect } from "react"
import { useMe } from "@/features/auth/hooks/use-me"
import { useAuthStore } from "@/features/auth/store/auth.store"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {

  const setUser = useAuthStore((s) => s.setUser)
  const { data } = useMe()

  useEffect(() => {
    if (data) {
      setUser(data)
    }
  }, [data])

  return children
}