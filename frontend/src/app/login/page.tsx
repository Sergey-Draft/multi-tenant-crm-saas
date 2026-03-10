"use client";

import { useState } from "react";
import { login } from "@/features/auth/api/login";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("draft@krot.com");
  const [password, setPassword] = useState("123456");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = await login({ email, password });

    setAuth({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    document.cookie = `accessToken=${data.accessToken}`;

    redirect("/dashboard");
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
        />

        <button className="bg-black text-white p-2">Login</button>
      </form>
    </div>
  );
}
