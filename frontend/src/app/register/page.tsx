"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  Loader2,
  Building2,
  User,
  Smile
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { redirect } from "next/navigation";
import { USER_ROLE_OPTIONS } from "@/lib/options";
import { UserRole } from "@/types/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompany] = useState("");
  const [role, setRole] = useState("");

  const { register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    const data = {
      email,
      password,
      name,
      companyName,
      role,
    };

    e.preventDefault();
    clearError();
    await register(data);
    redirect("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4">
            <Smile className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Draft CRM</h1>
          {/* <p className="text-sm text-muted-foreground mt-1">
            Зарегистрируйтесь
          </p> */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                // placeholder="••••••••"
                className="pl-10 !text-base h-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Компания</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompany(e.target.value)}
                // placeholder="••••••••"
                className="pl-10 !text-base h-10"
                required
              />
            </div>
          </div>

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
            <Label htmlFor="password">Пароль</Label>
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

          <div className="space-y-2 w-full">
            <Label htmlFor="role">Роль</Label>
            <div className="w-full">
              <Select
                value={role}
                onValueChange={(value: UserRole) => setRole(value)}
              >
                <SelectTrigger
                  id="role"
                  size="lg"
                  className="w-full !text-base h-10"
                >
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="!text-base h-10"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full !text-base !h-10" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-full gap-2 " /> : null}
            Зарегистрироваться
          </Button>
        </form>

        <div className="flex justify-center items-center gap-1 mt-2">
            <div>Уже есть аккаунт?</div>
            <Button  asChild variant="link" className="!text-base !h-10" >
            <Link href={"/login"}>Войти</Link>
            </Button>
          </div>
      </div>
    </div>
  );
}
