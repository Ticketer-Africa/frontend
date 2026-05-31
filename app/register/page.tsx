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
import { useBecomeOrganizer } from "@/services/user/user.queries";
import { toast } from "sonner";
import { Logo } from "@/components/layout/logo";

// 🧠 ZOD SCHEMA + TYPE
const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    agreementAccepted: z.boolean().refine((value) => value, {
      message: "You must accept the Service Agreement to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
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
  const becomeOrganizerMutation = useBecomeOrganizer();

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
      };

      await registerUser(payload);
      await becomeOrganizerMutation.mutateAsync(data.email);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      {/* Animated BG Circles - CSS animations instead of framer-motion */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="my-tickets-bg-circle absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
        <div className="my-tickets-bg-circle-alt absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
      </div>

      <div className="auth-form-animate relative z-10 w-full max-w-md">
        <Card className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
          <CardHeader className="text-center flex justify-center items-center flex-col space-y-2 p-8">
            <Logo withText={false} size="sm" />
            <CardTitle className="text-2xl font-bold">Organizer Sign Up</CardTitle>
            <p className="text-muted-foreground">Create your organizer account to start hosting events</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className={step === 1 ? "font-semibold text-[#1E88E5]" : ""}>
                  Step 1: Profile
                </span>
                <span className={step === 2 ? "font-semibold text-[#1E88E5]" : ""}>
                  Step 2: Security
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`h-1.5 rounded-full ${
                    step >= 1 ? "bg-[#1E88E5]" : "bg-gray-200"
                  }`}
                />
                <div
                  className={`h-1.5 rounded-full ${
                    step >= 2 ? "bg-[#1E88E5]" : "bg-gray-200"
                  }`}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      {...register("email")}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs">{errors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={goToNextStep}
                    className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Continue
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        placeholder="Create a password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        {...register("confirmPassword")}
                        placeholder="Confirm your password"
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
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Controller
                      name="agreementAccepted"
                      control={control}
                      render={({ field }) => (
                        <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                            className="mt-0.5"
                          />
                          <span>
                            I have read and agree to the{" "}
                            <Link
                              href="/service-agreement"
                              className="text-primary hover:underline"
                            >
                              Event Hosting and Ticketing Platform Agreement
                            </Link>
                            .
                          </span>
                        </label>
                      )}
                    />
                    {errors.agreementAccepted && (
                      <p className="text-red-500 text-xs">
                        {errors.agreementAccepted.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="rounded-full"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isPending}
                    >
                      {isPending ? "Creating account..." : "Create Organizer Account"}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href={loginHref} className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              By creating an organizer account, you agree to our{" "}
              <Link
                href="/service-agreement"
                className="text-primary hover:underline"
              >
                Service Agreement
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
