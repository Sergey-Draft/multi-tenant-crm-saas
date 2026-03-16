"use client";

import { useState } from "react";
import { CreateUserDto, UserRole } from "@/types/user";
import useCreateUser from "../hooks/use-create-user";
import { USER_ROLE_OPTIONS } from "@/lib/options";

export default function CreateUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("EMPLOYEE");

  const mutation = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateUserDto = {
      email,
      password,
      role,
    };

    mutation.mutate(data);
  };

  return (
    <div>
      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="border p-2"
        >
          {USER_ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button className="bg-black text-white p-2">Add user</button>
      </form>
    </div>
  );
}
