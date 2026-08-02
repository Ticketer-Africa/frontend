"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";
import { useVerifyOtp, useResendOtp } from "@/services/auth/auth.queries";
import { ResendOtpDto } from "@/types/auth.type";
import { z } from "zod";

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const { mutate: verifyOtp, isPending } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();
  const [otpPayload, setOtpPayload] = useState<ResendOtpDto | null>(null);
  const redirect =
    searchParams.get("redirect") ?? searchParams.get("returnUrl");
  const intent = searchParams.get("intent");

  const loginParams = new URLSearchParams();
  if (intent === "organizer") {
    loginParams.set("intent", "organizer");
  }
  if (redirect) {
    loginParams.set("redirect", redirect);
  }
  const loginHref = loginParams.toString()
    ? `/login?${loginParams.toString()}`
    : "/login";

  useEffect(() => {
    const stored = localStorage.getItem("otpPayload");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.email && parsed?.context) {
          setOtpPayload(parsed);
        } else {
          throw new Error("Incomplete OTP payload");
        }
      } catch (e) {
        console.error("Failed to parse otpPayload:", e);
        toast.error("Invalid OTP session", {
          description: "We couldn't read your verification details. Please try again.",
        });
      }
    } else {
      toast.error("No OTP session found", {
        description: "Please register again to receive a new verification code.",
      });
      const registerParams = new URLSearchParams();
      if (intent === "organizer") {
        registerParams.set("intent", "organizer");
      }
      if (redirect) {
        registerParams.set("redirect", redirect);
      }

      router.push(
        registerParams.toString()
          ? `/register?${registerParams.toString()}`
          : "/register"
      );
    }
  }, [router, intent, redirect]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = otpPayload?.email;
    const result = otpSchema.safeParse({ email, otp });

    if (!result.success) {
      toast.error("Invalid code", {
        description: result.error.issues[0].message,
      });
      return;
    }

    verifyOtp(result.data, {
      onSuccess: () => {
        toast.success("OTP verified", {
          description: "Your code has been confirmed successfully.",
        });
        const context = otpPayload?.context;
        localStorage.removeItem("otpPayload");
        // const role = user?.role || "user";
        if (context === "forgot-password") {
          localStorage.setItem("resetEmail", email!);
          localStorage.setItem("resetOtp", otp);
          router.push("/reset-password");
        } else {
          router.push(loginHref);
        }
      },
      onError: (err: any) => {
        toast.error("Verification failed", {
          description:
            err?.response?.data?.message || "Failed to verify OTP. Please try again.",
        });
      },
    });
  };

  const handleResend = () => {
    if (!otpPayload) {
      toast.error("Missing OTP details", {
        description: "We couldn't find your verification session. Please register again.",
      });
      return;
    }
    resendOtp(otpPayload, {
      onSuccess: () => {
        localStorage.removeItem("otpPayload");
        setSecondsLeft(60);
      },
    });
  };

  return (
    <div
      className="home-theme min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="my-tickets-bg-circle absolute -top-40 -right-40 w-80 h-80 rounded-full filter blur-xl opacity-20"
          style={{ backgroundColor: "var(--home-accent)" }}
        />
        <div
          className="my-tickets-bg-circle-alt absolute -bottom-40 -left-40 w-80 h-80 rounded-full filter blur-xl opacity-30"
          style={{ backgroundColor: "var(--home-card-highlight)" }}
        />
      </div>

      <div className="auth-form-animate w-full max-w-md relative">
        <Card
          className="backdrop-blur-md shadow-2xl border"
          style={{
            backgroundColor: "rgba(20, 27, 43, 0.92)",
            borderColor: "var(--home-border)",
            borderRadius: "var(--home-radius-card-lg)",
          }}
        >
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--home-accent)" }}
              >
                <span
                  className="font-bold text-sm"
                  style={{ color: "var(--home-accent-fg)" }}
                >
                  T
                </span>
              </div>
              <span
                className="font-bold text-xl"
                style={{ color: "var(--home-text)" }}
              >
                Ticketer Africa
              </span>
            </div>
            <CardTitle className="text-2xl" style={{ color: "var(--home-text)" }}>
              Verify Your Email
            </CardTitle>
            <p style={{ color: "var(--home-muted)" }}>
              Enter the 6-digit code sent to your email
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={otp}
                  onChange={(val) => setOtp(val)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="border-[var(--home-border-strong)] text-[var(--home-text)] bg-[var(--home-bg)]" />
                    <InputOTPSlot index={1} className="border-[var(--home-border-strong)] text-[var(--home-text)] bg-[var(--home-bg)]" />
                    <InputOTPSlot index={2} className="border-[var(--home-border-strong)] text-[var(--home-text)] bg-[var(--home-bg)]" />
                  </InputOTPGroup>
                  <InputOTPSeparator className="text-[var(--home-muted)]" />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="border-[var(--home-border-strong)] text-[var(--home-text)] bg-[var(--home-bg)]" />
                    <InputOTPSlot index={4} className="border-[var(--home-border-strong)] text-[var(--home-text)] bg-[var(--home-bg)]" />
                    <InputOTPSlot index={5} className="border-[var(--home-border-strong)] text-[var(--home-text)] bg-[var(--home-bg)]" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-semibold shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150 hover:brightness-110 disabled:opacity-50"
                style={{
                  backgroundColor: "var(--home-accent)",
                  color: "var(--home-accent-fg)",
                  borderRadius: "var(--home-radius-card)",
                }}
                disabled={otp.length < 6 || isPending}
              >
                {isPending ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm" style={{ color: "var(--home-muted)" }}>
                  Didn&apos;t receive the code?{" "}
                  <button
                    disabled={isResending || secondsLeft > 0}
                    onClick={handleResend}
                    className="hover:underline disabled:opacity-50"
                    style={{ color: "var(--home-text-highlight)" }}
                  >
                    Resend Code
                  </button>
                  {secondsLeft > 0 && (
                    <span className="ml-2" style={{ color: "var(--home-muted-dim)" }}>
                      ({formatTime(secondsLeft)})
                    </span>
                  )}
                </p>
              </div>

              <Button
                variant="ghost"
                className="w-full hover:bg-[var(--home-card-elevated)] hover:text-[var(--home-text-highlight)]"
                style={{ color: "var(--home-muted)" }}
                asChild
              >
                <Link href={loginHref}>
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
