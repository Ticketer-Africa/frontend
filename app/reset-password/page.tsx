"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, AlertCircle } from "lucide-react";
import { useResetPassword } from "@/services/auth/auth.queries";
import { AuthShell } from "@/components/auth/auth-shell";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // resetToken from OTP step
  const resetpasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    const email = localStorage.getItem("resetEmail");
    const otp = localStorage.getItem("resetOtp");

    if (!email || !otp) {
      alert("Reset session expired. Please request a new OTP.");
      router.push("/forgot-password");
      return;
    }

    const payload = {
      email,
      otp,
      newPassword: data.password,
    };

    resetpasswordMutation.mutate(
      {
        email,
        otp,
        newPassword: data.password,
      },
      {
        onSuccess: () => {
          localStorage.removeItem("resetEmail");
          localStorage.removeItem("resetOtp");

          router.push("/login");
        },
        onError: (err: any) => {
          console.error(err);
          alert(
            err?.response?.data?.message ||
              "Failed to reset password. Try again."
          );
        },
      }
    );
  };

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--home-text)" }}
        >
          Set New Password
        </h1>
        <p style={{ color: "var(--home-muted)" }}>
          Enter your new password below to secure your account
        </p>
      </div>

      {errors.password && (
        <div
          className="mb-4 p-3 rounded-lg flex items-center space-x-2 border"
          style={{
            backgroundColor: "rgba(20,27,43,0.5)",
            borderColor: "var(--home-border-strong)",
          }}
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-400">{errors.password.message}</p>
        </div>
      )}
      {errors.confirmPassword && (
        <div
          className="mb-4 p-3 rounded-lg flex items-center space-x-2 border"
          style={{
            backgroundColor: "rgba(20,27,43,0.5)",
            borderColor: "var(--home-border-strong)",
          }}
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-400">
            {errors.confirmPassword.message}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="px-1" style={{ color: "var(--home-muted)" }}>
            New Password
          </Label>
          <div className="relative">
            <Lock
              className="absolute left-8 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--home-muted)" }}
            />
            <Input
              id="password"
              type="password"
              {...register("password")}
              className="pl-16 h-14 rounded-lg"
              style={{
                backgroundColor: "rgba(12,19,34,0.5)",
                borderColor: "rgba(86,66,62,0.5)",
                color: "var(--home-text)",
              }}
              placeholder="Enter new password"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="px-1" style={{ color: "var(--home-muted)" }}>
            Confirm Password
          </Label>
          <div className="relative">
            <Lock
              className="absolute left-8 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--home-muted)" }}
            />
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className="pl-16 h-14 rounded-lg"
              style={{
                backgroundColor: "rgba(12,19,34,0.5)",
                borderColor: "rgba(86,66,62,0.5)",
                color: "var(--home-text)",
              }}
              placeholder="Re-enter new password"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="homeAccent"
          className="w-full h-14 rounded-lg"
        >
          Reset Password
        </Button>
      </form>
    </AuthShell>
  );
}
