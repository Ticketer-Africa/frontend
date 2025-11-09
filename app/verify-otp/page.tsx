"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";
import { useVerifyOtp, useResendOtp } from "@/services/auth/auth.queries";
import { ResendOtpDto } from "@/types/auth.type";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const { user } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(60);
  const { mutate: verifyOtp, isPending } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();
  const [otpPayload, setOtpPayload] = useState<ResendOtpDto | null>(null);

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
        toast.error("Invalid OTP session. Please try again.");
      }
    } else {
      toast.error("No OTP session found. Please register again.");
      router.push("/register");
    }
  }, [router]);

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
      toast.error(result.error.issues[0].message);
      return;
    }

    verifyOtp(result.data, {
      onSuccess: () => {
        toast.success("OTP verified Sucessfully!");
        const context = otpPayload?.context;
        localStorage.removeItem("otpPayload");
        // const role = user?.role || "user";
        if (context === "forgot-password") {
          localStorage.setItem("resetEmail", email!);
          localStorage.setItem("resetOtp", otp);
          router.push("/reset-password");
        } else {
          router.push("/login");
        }
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message || "Failed to verify OTP. Try again."
        );
      },
    });
  };

  const handleResend = () => {
    if (!otpPayload) {
      toast.error("Missing OTP details");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-pink-50 to-orange-50 dark:from-blue-950/20 dark:via-pink-950/20 dark:to-orange-950/20 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#1E88E5] to-pink-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-xl">Ticketer Africa</span>
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <p className="text-muted-foreground">
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
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#1E88E5] hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                disabled={otp.length < 6 || isPending}
              >
                {isPending ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn&apos;t receive the code?{" "}
                  <button
                    disabled={isResending || secondsLeft > 0}
                    onClick={handleResend}
                    className="text-[#1E88E5] hover:underline disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                  {secondsLeft > 0 && (
                    <span className="ml-2 text-gray-500">
                      ({formatTime(secondsLeft)})
                    </span>
                  )}
                </p>
              </div>

              <Button variant="ghost" className="w-full" asChild>
                <Link href="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
