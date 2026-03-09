"use client"

import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const logout = () => {
    document.cookie = "accessToken=; Max-Age=0"
    router.push("/login")
  }

  return (
    <button
      onClick={logout}
      className="mt-10 text-red-400 hover:text-red-300"
    >
      Logout
    </button>
  )
}