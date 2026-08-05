"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAdminLogin } from "@/hooks/use-admin-login";

export function AdminLoginForm() {
  const { login, isLoading, error, clearError } = useAdminLogin();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login({ email: email.trim(), password });
  }

  return (
    <form className="w-full max-w-md" onSubmit={handleSubmit} noValidate>
      <h1 className="text-3xl font-black text-secondary sm:text-4xl lg:text-5xl">
        Welcome back !
      </h1>
      <p className="mt-3 text-sm text-secondary/80 sm:mt-4 sm:text-base lg:text-lg">
        Sign in to the Hitadecor admin console to manage products, orders and
        customers.
      </p>

      <div className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
        {error ? (
          <p
            role="alert"
            className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-bold text-secondary sm:text-base"
          >
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) clearError();
            }}
            placeholder="Enter your admin email address"
            className="h-12 rounded-none px-4 text-sm sm:h-14 sm:text-base"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-bold text-secondary sm:text-base"
          >
            Password
          </Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            disabled={isLoading}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) clearError();
            }}
            placeholder="••••••••"
            className="h-12 rounded-none px-4 text-sm sm:h-14 sm:text-base"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="relative isolate h-12 w-full cursor-pointer overflow-hidden rounded-none border-primary bg-transparent px-10 text-base text-white transition-colors duration-300 hover:bg-transparent hover:text-primary sm:h-14 sm:w-auto sm:text-lg before:absolute before:inset-0 before:-z-10 before:bg-primary before:transition-transform before:duration-300 before:ease-out hover:before:-translate-x-full"
        >
          {isLoading ? "Signing in…" : "Login"}
        </Button>
      </div>

      <p className="mt-6 text-xs text-secondary/70 sm:mt-8 sm:text-sm">
        Admin access only. Contact your system administrator if you need an
        account.
      </p>
    </form>
  );
}
