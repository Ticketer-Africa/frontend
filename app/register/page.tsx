"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRegister } from "@/services/auth/auth.queries";
import { toast } from "sonner";
import { Logo } from "@/components/layout/logo";
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
      <Card
        className="rounded-3xl border"
        style={{
          backgroundColor: "var(--home-card)",
          borderColor: "var(--home-border)",
        }}
      >
        <CardHeader className="text-center flex justify-center items-center flex-col space-y-2 p-8">
          <Logo withText={false} size="sm" />
          <CardTitle style={{ color: "var(--home-text)" }}>Sign Up</CardTitle>
          <p style={{ color: "var(--home-muted)" }}>
            Create your organizer account to start hosting events
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div
              className="flex items-center justify-between text-xs"
              style={{ color: "var(--home-muted)" }}
            >
              <span
                className={step === 1 ? "font-semibold" : ""}
                style={step === 1 ? { color: "var(--home-text-highlight)" } : undefined}
              >
                Step 1: Profile
              </span>
              <span
                className={step === 2 ? "font-semibold" : ""}
                style={step === 2 ? { color: "var(--home-text-highlight)" } : undefined}
              >
                Step 2: Security
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div
                className="h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    step >= 1 ? "var(--home-accent)" : "var(--home-border-strong)",
                }}
              />
              <div
                className="h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    step >= 2 ? "var(--home-accent)" : "var(--home-border-strong)",
                }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium"
                    style={{ color: "var(--home-muted)" }}
                  >
                    Full Name
                  </label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Enter your full name"
                    style={{
                      backgroundColor: "var(--home-bg)",
                      borderColor: "var(--home-border)",
                      color: "var(--home-text)",
                    }}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium"
                    style={{ color: "var(--home-muted)" }}
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    {...register("email")}
                    placeholder="Enter your email"
                    style={{
                      backgroundColor: "var(--home-bg)",
                      borderColor: "var(--home-border)",
                      color: "var(--home-text)",
                    }}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="homeAccent"
                  onClick={goToNextStep}
                  className="w-full px-6"
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
                    className="text-sm font-medium"
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
                      style={{
                        backgroundColor: "var(--home-bg)",
                        borderColor: "var(--home-border)",
                        color: "var(--home-text)",
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" style={{ color: "var(--home-muted)" }} />
                      ) : (
                        <Eye className="h-4 w-4" style={{ color: "var(--home-muted)" }} />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
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
                      style={{
                        backgroundColor: "var(--home-bg)",
                        borderColor: "var(--home-border)",
                        color: "var(--home-text)",
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" style={{ color: "var(--home-muted)" }} />
                      ) : (
                        <Eye className="h-4 w-4" style={{ color: "var(--home-muted)" }} />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Controller
                    name="agreementAccepted"
                    control={control}
                    render={({ field }) => (
                      <label
                        className="flex items-start gap-2 text-sm cursor-pointer"
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
                          I have read and agree to the{" "}
                          <Link
                            href="/service-agreement"
                            className="hover:underline"
                            style={{ color: "var(--home-text-highlight)" }}
                          >
                            Event Hosting and Ticketing Platform Agreement
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

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="homeOutline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="homeAccent"
                    disabled={isPending}
                  >
                    {isPending ? "Creating account..." : "Create Organizer Account"}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="text-center">
            <p className="text-sm" style={{ color: "var(--home-muted)" }}>
              Already have an account?{" "}
              <Link
                href={loginHref}
                className="hover:underline"
                style={{ color: "var(--home-text-highlight)" }}
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="text-xs text-center" style={{ color: "var(--home-muted)" }}>
            By creating an organizer account, you agree to our{" "}
            <Link
              href="/service-agreement"
              className="hover:underline"
              style={{ color: "var(--home-text-highlight)" }}
            >
              Service Agreement
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="hover:underline"
              style={{ color: "var(--home-text-highlight)" }}
            >
              Privacy Policy
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
