"use client";

import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { useLogin } from "@/services/auth/auth.queries";
import { Logo } from "@/components/layout/logo";
import { AuthShell } from "@/components/auth/auth-shell";
import { HomeCard } from "@/components/home/home-card";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const redirect =
    searchParams.get("redirect") ?? searchParams.get("returnUrl");
  const intent = searchParams.get("intent");
  const registerParams = new URLSearchParams();
  if (intent === "organizer") {
    registerParams.set("intent", "organizer");
  }
  if (redirect) {
    registerParams.set("redirect", redirect);
  }
  const registerHref = registerParams.toString()
    ? `/register?${registerParams.toString()}`
    : "/register";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginSchema) => {
    loginMutation.mutate(
      { ...data, email: data.email.toLowerCase() },
      {
        onSuccess: () => {
          const returnUrl =
            searchParams.get("redirect") ?? searchParams.get("returnUrl");

          if (returnUrl && !returnUrl.includes("/login")) {
            location.href = returnUrl;
          } else {
            location.href = "/explore";
          }
        },
      }
    );
  };

  return (
    <AuthShell>
      <HomeCard tone="card" radius="card-lg" className="p-8">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 mb-6 group"
          >
            <Logo
              size="sm"
              showImage={false}
              textClassName="text-[var(--home-text-highlight)]"
            />
          </Link>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--home-text)" }}
          >
            Welcome back
          </h1>
          <p style={{ color: "var(--home-muted)" }}>
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium"
              style={{ color: "var(--home-muted)" }}
            >
              Email address
            </Label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "var(--home-muted)" }}
              />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10 h-12 rounded-xl"
                style={{
                  backgroundColor: "var(--home-card)",
                  borderColor: "var(--home-border)",
                  color: "var(--home-text)",
                }}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: "var(--home-muted)" }}
            >
              Password
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "var(--home-muted)" }}
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10 h-12 rounded-xl"
                style={{
                  backgroundColor: "var(--home-card)",
                  borderColor: "var(--home-border)",
                  color: "var(--home-text)",
                }}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: "var(--home-muted)" }}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded"
                style={{ accentColor: "var(--home-accent)" }}
              />
              <span
                className="ml-2 text-sm"
                style={{ color: "var(--home-muted)" }}
              >
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium hover:opacity-80"
              style={{ color: "var(--home-text-highlight)" }}
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="homeAccent"
            disabled={loginMutation.isPending}
            className="w-full h-12 disabled:opacity-50"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--home-muted)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href={registerHref}
            className="font-medium hover:opacity-80"
            style={{ color: "var(--home-text-highlight)" }}
          >
            Sign up
          </Link>
        </p>
      </HomeCard>
    </AuthShell>
  );
}
