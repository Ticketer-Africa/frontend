"use client";

import type React from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/services/auth/auth.queries";
import { AuthShell } from "@/components/auth/auth-shell";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon, Mail01Icon } from "@hugeicons/core-free-icons";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
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
          setSent(true);
        },
      }
    );
  };

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: "var(--home-text)" }}
        >
          Forgot Password?
        </h1>
        <p style={{ color: "var(--home-muted)" }}>
          Enter your email to receive a password reset link
        </p>
      </div>

      {sent ? (
        <div role="status" className="rounded-xl border border-[var(--home-border-strong)] bg-[var(--home-card-elevated)] p-5 text-center text-[var(--home-text)]">
          <p className="font-semibold">Check your email</p>
          <p className="mt-2 text-sm text-[var(--home-muted)]">We sent a password reset link. It expires in 30 minutes.</p>
          <Link href="/login" className="mt-4 inline-block font-semibold text-[var(--home-text-highlight)] underline">Back to sign in</Link>
        </div>
      ) : (
      <>
      {errors.email && (
        <div
          className="mb-6 p-4 rounded-lg flex items-center space-x-2 border"
          style={{
            backgroundColor: "rgba(20,27,43,0.5)",
            borderColor: "var(--home-border-strong)",
          }}
        >
          <HugeiconsIcon icon={Alert01Icon} className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{errors.email.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium px-1"
            style={{ color: "var(--home-muted)" }}
          >
            Email address
          </Label>
          <div className="relative">
            <HugeiconsIcon icon={Mail01Icon}
              className="absolute left-8 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--home-muted)" }}
            />
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="pl-16 h-14 rounded-lg"
              style={{
                backgroundColor: "rgba(12,19,34,0.5)",
                borderColor: "rgba(86,66,62,0.5)",
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
          className="w-full h-14 rounded-lg disabled:opacity-50"
        >
          {forgotPasswordMutation.isPending ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      </>
      )}
    </AuthShell>
  );
}
