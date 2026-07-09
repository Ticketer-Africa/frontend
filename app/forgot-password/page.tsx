"use client";

import type React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, AlertCircle } from "lucide-react";
import { useForgotPassword } from "@/services/auth/auth.queries";
import { Logo } from "@/components/layout/logo";
import { AuthShell } from "@/components/auth/auth-shell";
import { HomeCard } from "@/components/home/home-card";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordSchema) => {
    forgotPasswordMutation.mutate(
      { email: data.email.toLowerCase() },
      {
        onSuccess: () => {
          localStorage.setItem(
            "otpPayload",
            JSON.stringify({
              email: data.email,
              context: "forgot-password",
            })
          );

          router.push("/verify-otp");
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
            Forgot Password?
          </h1>
          <p style={{ color: "var(--home-muted)" }}>
            Enter your email to receive an OTP
          </p>
        </div>

        {errors.email && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center space-x-2 border"
            style={{
              backgroundColor: "var(--home-card-elevated)",
              borderColor: "var(--home-border-strong)",
            }}
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{errors.email.message}</p>
          </div>
        )}

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
                {...register("email")}
                className="pl-10 h-12 rounded-xl"
                style={{
                  backgroundColor: "var(--home-card)",
                  borderColor: "var(--home-border)",
                  color: "var(--home-text)",
                }}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="homeAccent"
            disabled={forgotPasswordMutation.isPending}
            className="w-full h-12 disabled:opacity-50"
          >
            {forgotPasswordMutation.isPending ? "Sending..." : "Send OTP"}
          </Button>
        </form>
      </HomeCard>
    </AuthShell>
  );
}
