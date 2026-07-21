"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/services/auth/auth.queries";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";

const registerSchema = z
  .object({
    name: z.string().min(2, "Enter your full name (at least 2 characters)"),
    email: z.string().email("Enter a valid email address (e.g. you@example.com)"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreementAccepted: z.boolean().refine((value) => value, {
      message: "You must accept the Service Agreement to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match — please re-enter your password",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const PASSWORD_REQUIREMENTS = [
  { key: "length", label: "Min. 8 characters", test: (v: string) => v.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { key: "special", label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
  { key: "number", label: "One number", test: (v: string) => /[0-9]/.test(v) },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const intent = searchParams.get("intent");
  const redirect =
    searchParams.get("redirect") ?? searchParams.get("returnUrl");
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

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreementAccepted: false,
    },
  });

  const { mutateAsync: registerUser, isPending } = useRegister();
  const passwordValue = watch("password");

  const goToNextStep = async () => {
    const isStepOneValid = await trigger(["name", "email"]);
    if (isStepOneValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      const payload = {
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        role: "ORGANIZER" as const,
      };

      await registerUser(payload);

      localStorage.setItem(
        "otpPayload",
        JSON.stringify({ email: data.email, context: "register" })
      );

      const verifyOtpParams = new URLSearchParams();
      if (intent === "organizer") {
        verifyOtpParams.set("intent", "organizer");
      }
      if (redirect) {
        verifyOtpParams.set("redirect", redirect);
      }

      router.push(
        verifyOtpParams.toString()
          ? `/verify-otp?${verifyOtpParams.toString()}`
          : "/verify-otp"
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Something went wrong, try again";
      toast.error(msg);
    }
  };

  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center mb-8">
        <div
          className="flex items-center justify-center rounded-full p-3 mb-2"
          style={{ backgroundColor: "#362222" }}
        >
          <Lock className="w-6 h-6" style={{ color: "var(--home-accent)" }} />
        </div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--home-text)" }}>
          Sign Up
        </h1>
        <p style={{ color: "var(--home-muted)" }}>
          Create your organizer account to start hosting events
        </p>
      </div>

      <div className="space-y-2 mb-6">
        <div
          className="flex items-center justify-between text-sm"
          style={{ color: "var(--home-muted)" }}
        >
          <span style={step === 1 ? { color: "var(--home-accent)" } : undefined}>
            Step 1: Profile
          </span>
          <span style={step === 2 ? { color: "var(--home-accent)" } : undefined}>
            Step 2: Security
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#2e3545" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: step === 1 ? "50%" : "100%",
              backgroundColor: "var(--home-accent)",
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {step === 1 && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium px-1"
                style={{ color: "var(--home-muted)" }}
              >
                Full name
              </label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter your full name"
                className="h-14 rounded-lg px-8"
                style={{
                  backgroundColor: "rgba(12,19,34,0.5)",
                  borderColor: "rgba(86,66,62,0.5)",
                  color: "var(--home-text)",
                }}
              />
              {errors.name && (
                <p className="text-red-400 text-xs px-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium px-1"
                style={{ color: "var(--home-muted)" }}
              >
                Email
              </label>
              <Input
                id="email"
                {...register("email")}
                placeholder="Enter your email"
                className="h-14 rounded-lg px-8"
                style={{
                  backgroundColor: "rgba(12,19,34,0.5)",
                  borderColor: "rgba(86,66,62,0.5)",
                  color: "var(--home-text)",
                }}
              />
              {errors.email && (
                <p className="text-red-400 text-xs px-1">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="button"
              variant="homeAccent"
              onClick={goToNextStep}
              className="w-full h-14 rounded-lg"
            >
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium px-1"
                style={{ color: "var(--home-muted)" }}
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Create a password"
                  className="h-14 rounded-lg px-8 pr-14"
                  style={{
                    backgroundColor: "rgba(12,19,34,0.5)",
                    borderColor: "rgba(86,66,62,0.5)",
                    color: "var(--home-text)",
                  }}
                />
                <button
                  type="button"
                  className="absolute right-6 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--home-muted)" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs px-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium px-1"
                style={{ color: "var(--home-muted)" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Confirm your password"
                  className="h-14 rounded-lg px-8 pr-14"
                  style={{
                    backgroundColor: "rgba(12,19,34,0.5)",
                    borderColor: "rgba(86,66,62,0.5)",
                    color: "var(--home-text)",
                  }}
                />
                <button
                  type="button"
                  className="absolute right-6 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--home-muted)" }}
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs px-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div
              className="rounded-lg border p-4"
              style={{ backgroundColor: "rgba(20,27,43,0.5)", borderColor: "var(--home-border)" }}
            >
              <p className="text-xs mb-2.5" style={{ color: "var(--home-muted)" }}>
                REQUIREMENTS:
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {PASSWORD_REQUIREMENTS.map((req) => {
                  const met = req.test(passwordValue ?? "");
                  return (
                    <div key={req.key} className="flex items-center gap-2">
                      <span
                        className="flex items-center justify-center w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: met ? "var(--home-success)" : "transparent",
                          border: met ? "none" : "1px solid var(--home-border-strong)",
                        }}
                      >
                        {met && <Check className="w-2.5 h-2.5" style={{ color: "var(--home-success-fg)" }} />}
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: met ? "var(--home-success-text)" : "rgba(221,192,186,0.6)" }}
                      >
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Controller
                name="agreementAccepted"
                control={control}
                render={({ field }) => (
                  <label
                    className="flex items-start gap-2.5 text-sm cursor-pointer"
                    style={{ color: "var(--home-muted)" }}
                  >
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      className="mt-0.5 border-[var(--home-border-strong)] data-[state=checked]:bg-[var(--home-accent)] data-[state=checked]:border-[var(--home-accent)] data-[state=checked]:text-[var(--home-accent-fg)]"
                    />
                    <span>
                      I have read and agreed to our{" "}
                      <Link
                        href="/service-agreement"
                        className="underline hover:opacity-80"
                        style={{ color: "var(--home-text)" }}
                      >
                        Event Hosting and Ticketing Platform Agreement
                      </Link>
                      , including the{" "}
                      <Link
                        href="/privacy"
                        className="underline hover:opacity-80"
                        style={{ color: "var(--home-text)" }}
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                )}
              />
              {errors.agreementAccepted && (
                <p className="text-red-400 text-xs">
                  {errors.agreementAccepted.message}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="homeOutline"
                onClick={() => setStep(1)}
                className="h-14 rounded-lg px-8 w-[160px] shrink-0"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="homeAccent"
                disabled={isPending}
                className="h-14 rounded-lg flex-1"
              >
                {isPending ? "Creating account..." : "Create Organizer Account"}
              </Button>
            </div>
          </>
        )}
      </form>

      <div className="text-center mt-6">
        <p className="text-sm" style={{ color: "var(--home-muted)" }}>
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="font-semibold hover:opacity-80"
            style={{ color: "var(--home-text-highlight)" }}
          >
            Sign in
          </Link>
        </p>
      </div>

      {step === 1 && (
        <div className="text-xs text-center mt-4" style={{ color: "var(--home-muted-dim)" }}>
          By creating an organizer account, you agree to our{" "}
          <Link
            href="/service-agreement"
            className="underline hover:opacity-80"
          >
            Service Agreement
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:opacity-80">
            Privacy Policy
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
