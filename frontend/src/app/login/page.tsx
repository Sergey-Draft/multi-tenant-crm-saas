"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smile, Mail, Lock, Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlobalLoader } from "@/components/globalLoader/global-loader";

export default function LoginPage() {
  const [email, setEmail] = useState("draft@krot.com");
  const [password, setPassword] = useState("123456");

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); 
    await login({ email, password });
    redirect("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4">
            <Smile className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Draft CRM</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // placeholder="admin@stemlab.edu"
                className="pl-10 !text-base h-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // placeholder="••••••••"
                className="pl-10 !text-base h-10"
                required
              />
            </div>
          </div>

          <Button type="submit" variant="default" className="w-full !text-base !h-10" disabled={isLoading} >
            Войти
          </Button>
        </form>

        <div className="flex justify-center items-center gap-1 mt-2">
            <div>Еще нет аккаунта?</div>
            <Button  asChild variant="link" className="!text-base !h-10" >
            <Link href={"/register"}>Зарегистрироваться</Link>
            </Button>
          </div>
          {isLoading ? <GlobalLoader isLoading={isLoading} /> : null}
      </div>
    </div>
  );
}
