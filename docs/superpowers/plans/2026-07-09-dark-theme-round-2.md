# Dark Theme Round 2 (Public-Facing Pages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the `.home-theme` dark/coral design system (already shipped on the homepage) to 7 more pages — Explore, Event Details, Checkout, Login, Register, Forgot Password, Reset Password — plus the shared Header, by systematically substituting colors/surfaces per an established token table. No Figma reference exists for these pages; "correct" means "consistently applies the token system," not "pixel-matches a design."

**Architecture:** Reuse every primitive from round 1 (`.home-theme` CSS scope, `HomeCard`, `Button variant="homeAccent"`) and add one new primitive (`Button variant="homeOutline"`) plus one new shared component (`AuthShell`, replacing 4x duplicated auth-page shell markup). Each page gets its wrapper backgrounded with `var(--home-bg)`, its card surfaces converted to `HomeCard` or restyled via `className`/`style` overrides (never touching shared component defaults, since Input/Card/Checkbox/Select/Textarea are used by pages staying light too), and its primary/secondary buttons mapped to `homeAccent`/`homeOutline`. All data-fetching, business logic, form validation, and component structure stay unchanged — this is a visual-only change, same discipline as round 1.

**Tech Stack:** Next.js 14 (App Router), React 18, Tailwind CSS v3, `class-variance-authority`, `react-hook-form` + `zod`, shadcn-style UI primitives (`Input`, `Card`, `Checkbox`, `Select`, `Textarea` — confirmed all forward `className` via `cn()` and spread `...props` including `style`). No test runner exists in this repo — verification is `npx tsc --noEmit` (baseline: 9 pre-existing unrelated errors, listed in Task 1) plus visual checks via the preview tool.

**Spec:** `docs/superpowers/specs/2026-07-09-dark-theme-round-2-design.md`

---

## File Structure

| File | Change |
|---|---|
| `components/ui/button.tsx` | Add `homeOutline` variant |
| `components/layout/header.tsx` | Widen dark-route condition from `isHome` to `isDarkRoute` |
| `components/auth/auth-shell.tsx` | **New.** Shared outer shell for the 4 auth pages |
| `app/login/page.tsx` | Use `AuthShell` + `HomeCard`, dark-theme all form elements |
| `app/register/page.tsx` | Dark-theme `Card`-based form (keeps `Card` structure, restyled via className/style) |
| `app/forgot-password/page.tsx` | Use `AuthShell` + `HomeCard`, dark-theme all form elements |
| `app/reset-password/page.tsx` | Use `AuthShell` + `HomeCard`, dark-theme all form elements |
| `app/explore/page.tsx` | Dark wrapper + heading |
| `app/explore/filter-section.tsx` | Dark panel, inputs, `homeOutline`/`homeAccent` buttons |
| `app/explore/pagination-controls.tsx` | Dark text/borders |
| `app/explore/empty-state.tsx` | Dark text, `homeOutline` button |
| `app/explore/skeletons.tsx` | Dark skeleton surfaces |
| `app/explore/explore-event-card.tsx` | Convert to `HomeCard` with thumbnail image |
| `app/events/[slug]/page.tsx` | Dark wrapper, cards, occurrence selector, avatar gradient |
| `app/events/[slug]/_components/event-header.tsx` | Dark card + text |
| `app/events/[slug]/_components/ticket-category-card.tsx` | Dark card + selected-state coloring |
| `app/checkout/page.tsx` | Dark wrapper (all 4 states), `Card` instances restyled, coral accents |

---

## Task 1: `homeOutline` Button variant

**Files:**
- Modify: `components/ui/button.tsx:11-26`

- [ ] **Step 1: Add the variant**

In `components/ui/button.tsx`, inside the `variants.variant` object, add a new entry after `homeAccent`:

```ts
        homeAccent:
          "border-transparent bg-[var(--home-accent)] text-[var(--home-accent-fg)] font-['Hanken_Grotesk'] font-semibold transition-opacity hover:opacity-90",
        homeOutline:
          "border-[var(--home-border-strong)] bg-transparent text-[var(--home-text)] font-['Hanken_Grotesk'] font-semibold hover:bg-[var(--home-card)] transition-colors",
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exactly the same 9 pre-existing baseline errors as before this change:
```
app/checkout/page.tsx(214,13)
app/organizer/_components/event-form-schema.ts(165,3)
app/organizer/create-event/page.tsx(84,40)
app/organizer/update-event/[id]/page.tsx(77,16)
app/organizer/update-event/[id]/page.tsx(145,40)
app/ticket/[id]/page.tsx(251,41)
components/qr-code-display.tsx(29,15)
components/ticket-purchase-modal/quantity-step.tsx(13,32)
components/ticket-purchase-modal/types.ts(1,32)
services/attendees/attendees.queries.ts(10,56)
```
No new errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/button.tsx
git commit -m "Add homeOutline button variant for dark-theme secondary actions"
```

---

## Task 2: Widen Header's dark-route condition

**Files:**
- Modify: `components/layout/header.tsx:19-29`

- [ ] **Step 1: Replace the `NAVIGATION`/`isHome` setup**

In `components/layout/header.tsx`, change:

```tsx
const NAVIGATION = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Resale Market", href: "/explore" }, // TODO: point at a dedicated resale route if/when one exists
] as const;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
```

to:

```tsx
const NAVIGATION = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Resale Market", href: "/explore" }, // TODO: point at a dedicated resale route if/when one exists
] as const;

// Round 2: dark theme extends beyond "/" to these public-facing pages.
// Every other route (My Tickets, Organizer, Wallet, Settings, Admin, Terms, etc.) stays light.
const DARK_ROUTES = [
  "/",
  "/explore",
  "/checkout",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = DARK_ROUTES.includes(pathname) || pathname.startsWith("/events/");
```

Note: the variable name `isHome` is kept as-is (not renamed to `isDarkRoute`) so every existing `isHome ? X : Y` branch in the rest of the file needs zero further changes — only the assignment line changes. Renaming the variable would be pure churn across ~15 usages for no behavioral benefit.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: same 9 pre-existing baseline errors, none new.

- [ ] **Step 3: Visual/regression check**

With the dev server running:
- Open `/my-tickets`, `/organizer`, `/wallet`, `/settings`, `/terms` — confirm all still show the light sticky header (unaffected routes).
- Open `/explore`, `/login`, `/register`, `/forgot-password`, `/reset-password` — confirm the header now renders the dark/transparent variant (content below will still look light until later tasks restyle those pages — that's expected and temporary).
- Open `/events/<any-slug>` — confirm dark header there too.

- [ ] **Step 4: Commit**

```bash
git add components/layout/header.tsx
git commit -m "Widen Header dark-route condition to round 2 pages"
```

---

## Task 3: `AuthShell` shared component

**Files:**
- Create: `components/auth/auth-shell.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type React from "react";

/**
 * Shared dark-theme shell for the 4 auth pages (Login, Register,
 * Forgot Password, Reset Password). Replaces the identical
 * copy-pasted wrapper + decorative-circle markup that existed in
 * all 4 files pre-redesign.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="home-theme min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="auth-form-animate relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: same 9 pre-existing baseline errors, none new (this file has no consumers yet).

- [ ] **Step 3: Commit**

```bash
git add components/auth/auth-shell.tsx
git commit -m "Add AuthShell shared component for dark-theme auth pages"
```

---

## Task 4: Login page dark theme

**Files:**
- Modify: `app/login/page.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
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
```

Notes:
- Dropped the `Sparkles` import — it was imported in the original file but never used in JSX (dead import), safe to remove since we're already touching this file.
- Form validation error text stays `text-red-400` (not a `--home-*` token) — the palette has no dedicated error color (flagged as an open item in the spec), and red is still the clearest signal for "this field is invalid" against a dark background.
- `router`/`useRouter` was never imported here originally (uses `location.href` directly) — unchanged.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: same 9 pre-existing baseline errors, none new.

- [ ] **Step 3: Visual check**

Open `/login`. Confirm: dark card on dark background, coral "Ticketer Africa" text-only logo, coral "Sign in" button, dark input fields with visible placeholder text, "Forgot password?"/"Sign up" links in coral.

- [ ] **Step 4: Commit**

```bash
git add app/login/page.tsx
git commit -m "Dark-theme the login page"
```

---

## Task 5: Register page dark theme

**Files:**
- Modify: `app/register/page.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
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
```

Notes:
- `Button` base class is `rounded-full` already (from `components/ui/button.tsx:8`), so the original per-instance `rounded-full`/`rounded-full px-6` classes are redundant with the base and were dropped where the variant already implies it — kept `px-6` on the step-1 Continue button to preserve its wider tap target, matches original intent.
- `Logo withText={false}` here shows only the ticket icon (no text) — left as the original behavior, this page's logo usage is icon-only above "Sign Up" as a heading, unlike Header/Footer's text-only treatment, so `showImage`/`textClassName` don't apply here.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: same 9 pre-existing baseline errors, none new.

- [ ] **Step 3: Visual check**

Open `/register`. Confirm: dark card, step indicator dots in coral when active, step 1 form (Name/Email) with dark inputs, "Continue" as coral pill. Advance to step 2, confirm password fields, checkbox (coral when checked), "Back" as outline pill and "Create Organizer Account" as coral pill.

- [ ] **Step 4: Commit**

```bash
git add app/register/page.tsx
git commit -m "Dark-theme the register page"
```

---

## Task 6: Forgot Password page dark theme

**Files:**
- Modify: `app/forgot-password/page.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
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
```

Note: dropped the `Sparkles` icon + inline "Ticketer Africa" text link (original lines 66-74) in favor of the shared `Logo` component (text-only, coral), matching the pattern used on Login/Register rather than hand-rolling a duplicate wordmark — this mirrors how the homepage's own Header/Footer consolidated onto one `Logo` component instead of ad-hoc icon+text pairs.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: same 9 pre-existing baseline errors, none new.

- [ ] **Step 3: Visual check**

Open `/forgot-password`. Confirm dark card, coral logo/button, dark input.

- [ ] **Step 4: Commit**

```bash
git add app/forgot-password/page.tsx
git commit -m "Dark-theme the forgot password page"
```

---

## Task 7: Reset Password page dark theme

**Files:**
- Modify: `app/reset-password/page.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
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
import { Logo } from "@/components/layout/logo";
import { AuthShell } from "@/components/auth/auth-shell";
import { HomeCard } from "@/components/home/home-card";

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
      <HomeCard tone="card" radius="card-lg" className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <Logo
              size="sm"
              showImage={false}
              textClassName="text-[var(--home-text-highlight)]"
            />
          </div>
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
            className="mb-4 p-3 rounded-xl flex items-center space-x-2 border"
            style={{
              backgroundColor: "var(--home-card-elevated)",
              borderColor: "var(--home-border-strong)",
            }}
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-400">{errors.password.message}</p>
          </div>
        )}
        {errors.confirmPassword && (
          <div
            className="mb-4 p-3 rounded-xl flex items-center space-x-2 border"
            style={{
              backgroundColor: "var(--home-card-elevated)",
              borderColor: "var(--home-border-strong)",
            }}
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-400">
              {errors.confirmPassword.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" style={{ color: "var(--home-muted)" }}>
              New Password
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "var(--home-muted)" }}
              />
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="pl-10 h-12 rounded-xl"
                style={{
                  backgroundColor: "var(--home-card)",
                  borderColor: "var(--home-border)",
                  color: "var(--home-text)",
                }}
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" style={{ color: "var(--home-muted)" }}>
              Confirm Password
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "var(--home-muted)" }}
              />
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="pl-10 h-12 rounded-xl"
                style={{
                  backgroundColor: "var(--home-card)",
                  borderColor: "var(--home-border)",
                  color: "var(--home-text)",
                }}
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="homeAccent"
            className="w-full h-12"
          >
            Reset Password
          </Button>
        </form>
      </HomeCard>
    </AuthShell>
  );
}
```

Same `Sparkles`-icon-to-`Logo`-component consolidation as Task 6, for the same reason.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: same 9 pre-existing baseline errors, none new.

- [ ] **Step 3: Visual check**

Open `/reset-password`. Confirm dark card, two password fields, coral submit button.

- [ ] **Step 4: Commit**

```bash
git add app/reset-password/page.tsx
git commit -m "Dark-theme the reset password page"
```

---

## Task 8: Explore page shell, filters, pagination, empty state, skeletons

**Files:**
- Modify: `app/explore/page.tsx`
- Modify: `app/explore/filter-section.tsx`
- Modify: `app/explore/pagination-controls.tsx`
- Modify: `app/explore/empty-state.tsx`
- Modify: `app/explore/skeletons.tsx`

This task does NOT touch `explore-event-card.tsx` (that's Task 9) or any data-fetching/state logic in `page.tsx` — only the JSX markup listed below.

- [ ] **Step 1: `app/explore/page.tsx` — wrapper and heading**

Change:

```tsx
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/*
         * Header - renders immediately without animation
         * Performance: No JS animation delay, text is LCP candidate
         */}
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find and book tickets for the best events happening near you
          </p>
        </header>
```

to:

```tsx
  return (
    <div
      className="home-theme min-h-screen pt-16"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/*
         * Header - renders immediately without animation
         * Performance: No JS animation delay, text is LCP candidate
         */}
        <header className="text-center mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: "var(--home-text)" }}
          >
            Discover Amazing Events
          </h1>
          <p
            className="text-xl max-w-2xl mx-auto"
            style={{ color: "var(--home-muted)" }}
          >
            Find and book tickets for the best events happening near you
          </p>
        </header>
```

No other lines in `page.tsx` change (all state/effects/callbacks/data-fetching stay exactly as-is).

- [ ] **Step 2: `app/explore/filter-section.tsx` — dark panel and controls**

Change the outer panel (around line 98-99):

```tsx
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
```

to:

```tsx
    <div className="mb-8">
      <div
        className="rounded-2xl p-6 border"
        style={{
          backgroundColor: "var(--home-card)",
          borderColor: "var(--home-border)",
        }}
      >
```

Change the search input row (around line 100-124):

```tsx
        <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1E88E5]"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder="Search events, locations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 outline-none focus:outline-none border-[#1E88E5] rounded-full focus:ring-2 focus-visible:ring-[#1E88E5] focus:ring-[#1E88E5] focus:border-[#1E88E5]"
              aria-label="Search events"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="h-12 px-5"
            disabled={!canSubmitSearch}
          >
            Search
          </Button>
        </form>
        {!canSubmitSearch && (
          <p className="mt-1 text-xs text-muted-foreground">
            Enter at least 3 letters to search.
          </p>
        )}
```

to:

```tsx
        <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--home-text-highlight)" }}
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder="Search events, locations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 rounded-full"
              style={{
                backgroundColor: "var(--home-bg)",
                borderColor: "var(--home-border-strong)",
                color: "var(--home-text)",
              }}
              aria-label="Search events"
            />
          </div>
          <Button
            type="submit"
            variant="homeAccent"
            className="h-12 px-5"
            disabled={!canSubmitSearch}
          >
            Search
          </Button>
        </form>
        {!canSubmitSearch && (
          <p className="mt-1 text-xs" style={{ color: "var(--home-muted)" }}>
            Enter at least 3 letters to search.
          </p>
        )}
```

Change the filter-toggle row (around line 132-151):

```tsx
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onToggleFilters}
            className="flex items-center space-x-2 border-gray-200 hover:bg-gray-50 rounded-xl bg-transparent"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <p className="text-sm text-gray-600" aria-live="polite">
            {resultsCount} events found
          </p>
        </div>
```

to:

```tsx
        <div className="flex items-center justify-between">
          <Button
            variant="homeOutline"
            onClick={onToggleFilters}
            className="flex items-center space-x-2"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2"
                style={{
                  backgroundColor: "var(--home-accent)",
                  color: "var(--home-accent-fg)",
                }}
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <p className="text-sm" style={{ color: "var(--home-muted)" }} aria-live="polite">
            {resultsCount} events found
          </p>
        </div>
```

Change the filter panel border (around line 158-169):

```tsx
        <div
          id="filter-panel"
          className={`
            grid transition-all duration-300 ease-in-out
            ${
              showFilters
                ? "grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-gray-200"
                : "grid-rows-[0fr] opacity-0 overflow-hidden"
            }
          `}
          aria-hidden={!showFilters}
        >
```

to:

```tsx
        <div
          id="filter-panel"
          className={`
            grid transition-all duration-300 ease-in-out
            ${
              showFilters
                ? "grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t"
                : "grid-rows-[0fr] opacity-0 overflow-hidden"
            }
          `}
          style={showFilters ? { borderColor: "var(--home-border)" } : undefined}
          aria-hidden={!showFilters}
        >
```

Change the three filter labels and two `<select>` elements (around line 173-246) — apply this same pattern to all three labels (`htmlFor="location-filter"`, the price range label, `htmlFor="category-filter"`):

```tsx
                <label
                  htmlFor="location-filter"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
```
→
```tsx
                <label
                  htmlFor="location-filter"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--home-muted)" }}
                >
```

(repeat identically for the `id="price-filter-label"` label and the `htmlFor="category-filter"` label — same class/style change, different `htmlFor`/`id` and text content, which stay unchanged)

Both `<select>` elements change from:

```tsx
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
```

to:

```tsx
                  className="w-full h-10 px-3 rounded-lg"
                  style={{
                    backgroundColor: "var(--home-bg)",
                    borderColor: "var(--home-border)",
                    color: "var(--home-text)",
                    borderWidth: 1,
                  }}
```

Change the price-range display text (around line 215-221):

```tsx
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>{formatPrice(tempPriceRange[0])}</span>
                    <span>{formatPrice(tempPriceRange[1])}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 text-center">
                    Range: {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                  </div>
```

to:

```tsx
                  <div className="flex justify-between mt-2 text-sm" style={{ color: "var(--home-muted)" }}>
                    <span>{formatPrice(tempPriceRange[0])}</span>
                    <span>{formatPrice(tempPriceRange[1])}</span>
                  </div>
                  <div className="mt-1 text-xs text-center" style={{ color: "var(--home-muted)" }}>
                    Range: {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                  </div>
```

Change the filter action buttons (around line 248-267):

```tsx
              <div className="md:col-span-3 flex gap-3 pt-2">
                <Button
                  onClick={onApplyFilters}
                  className="flex-1 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-xl h-10 font-medium transition-colors"
                >
                  <SlidersHorizontal
                    className="w-4 h-4 mr-2"
                    aria-hidden="true"
                  />
                  Apply Filters
                </Button>
                <Button
                  onClick={onClearFilters}
                  variant="outline"
                  className="px-6 border-gray-200 hover:bg-gray-50 rounded-xl h-10"
                >
                  Clear All
                </Button>
              </div>
```

to:

```tsx
              <div className="md:col-span-3 flex gap-3 pt-2">
                <Button
                  onClick={onApplyFilters}
                  variant="homeAccent"
                  className="flex-1 h-10"
                >
                  <SlidersHorizontal
                    className="w-4 h-4 mr-2"
                    aria-hidden="true"
                  />
                  Apply Filters
                </Button>
                <Button
                  onClick={onClearFilters}
                  variant="homeOutline"
                  className="px-6 h-10"
                >
                  Clear All
                </Button>
              </div>
```

The `Slider` component (`components/ui/slider.tsx`) is left as-is — it's a Radix-based range slider used only here in this round's scope; visually it will render with its default (light-ish neutral) track/thumb colors, which is an acceptable minor inconsistency for this round rather than modifying a shared primitive used elsewhere. Flag as a follow-up if it reads poorly in the visual check.

- [ ] **Step 3: `app/explore/pagination-controls.tsx` — dark text/buttons**

Change both `Button` elements (Previous/Next) from:

```tsx
        className="flex items-center gap-2 rounded-full border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
```

to:

```tsx
        variant="homeOutline"
        className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
```

(remove the now-redundant `variant="outline"` prop that was previously set alongside the manual classes — replace it with `variant="homeOutline"`)

Change the page-count text block:

```tsx
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Page {meta.currentPage} of {meta.lastPage}
        </span>
        <span className="text-sm text-gray-400" aria-hidden="true">
          |
        </span>
        <span className="text-sm text-gray-600">{meta.total} total events</span>
      </div>
```

to:

```tsx
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: "var(--home-muted)" }}>
          Page {meta.currentPage} of {meta.lastPage}
        </span>
        <span className="text-sm" style={{ color: "var(--home-border-strong)" }} aria-hidden="true">
          |
        </span>
        <span className="text-sm" style={{ color: "var(--home-muted)" }}>{meta.total} total events</span>
      </div>
```

- [ ] **Step 4: `app/explore/empty-state.tsx` — dark text/button**

Replace the full return block:

```tsx
  return (
    <div className="text-center py-16">
      {/* Emoji instead of animated icon - no JS execution needed */}
      <div className="text-6xl mb-4" aria-hidden="true">
        🎭
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        No events found
      </h3>
      <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
      <Button
        onClick={onClearFilters}
        variant="outline"
        className="border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white rounded-full bg-transparent"
      >
        Clear Filters
      </Button>
    </div>
  );
```

with:

```tsx
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4" aria-hidden="true">
        🎭
      </div>
      <h3 className="text-2xl font-semibold mb-2" style={{ color: "var(--home-text)" }}>
        No events found
      </h3>
      <p className="mb-6" style={{ color: "var(--home-muted)" }}>Try adjusting your search or filters</p>
      <Button onClick={onClearFilters} variant="homeOutline">
        Clear Filters
      </Button>
    </div>
  );
```

- [ ] **Step 5: `app/explore/skeletons.tsx` — dark shimmer surfaces**

Change `EventCardSkeleton`'s outer wrapper:

```tsx
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col"
      aria-hidden="true"
    >
```

to:

```tsx
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ backgroundColor: "var(--home-card)" }}
      aria-hidden="true"
    >
```

Change `FiltersSkeleton`'s wrapper:

```tsx
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
```

to:

```tsx
    <div
      className="rounded-2xl p-6 mb-6 border"
      style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}
    >
```

The `Skeleton` component itself (`components/ui/skeleton.tsx`, shimmer-bar primitive) is not modified — it's used by pages outside this round's scope too. Its default gray shimmer will read as a slightly lighter rectangle against the new dark card background, which is a visually acceptable "loading" look (not jarring) — verify this in the visual check and only escalate if it looks broken rather than just a bit muted.

- [ ] **Step 6: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: same 9 pre-existing baseline errors, none new.

- [ ] **Step 7: Visual check**

Open `/explore`. Confirm: dark page background, dark heading text, dark filter panel with visible search input and Filters/Search buttons, dark pagination text (if more than 1 page of results), dark empty-state text if you clear results down to zero (e.g. search for nonsense text), and — if you can catch it — a dark-toned skeleton on first load (hard refresh with network throttling, or just confirm visually the color values in the file are correct if the skeleton flashes too fast to see).

- [ ] **Step 8: Commit**

```bash
git add app/explore/page.tsx app/explore/filter-section.tsx app/explore/pagination-controls.tsx app/explore/empty-state.tsx app/explore/skeletons.tsx
git commit -m "Dark-theme explore page shell, filters, pagination, empty state, skeletons"
```

---

## Task 9: Explore event card → `HomeCard` with thumbnail

**Files:**
- Modify: `app/explore/explore-event-card.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HomeCard } from "@/components/home/home-card";
import { formatPrice, formatDate, formatTime } from "@/lib/helpers";
import { EventV2 } from "@/types/events-v2.type";
import { getTicketStats } from "./utils";
import { EVENT_IMAGE_WIDTH, EVENT_IMAGE_HEIGHT } from "./constants";

interface ExploreEventCardProps {
  event: EventV2;
  isPriority?: boolean;
}

function ExploreEventCardComponent({
  event,
  isPriority = false,
}: ExploreEventCardProps) {
  const { ticketCategories, maxTickets, mintedTickets, ticketsAvailable } =
    getTicketStats(event);

  const lowestPrice = ticketCategories.length
    ? Math.min(...ticketCategories.map((t) => t.displayPrice))
    : 0;
  const priceDisplay =
    lowestPrice > 0 ? `From ${formatPrice(lowestPrice)}` : "Free";

  const isAlmostSoldOut =
    ticketsAvailable > 0 && mintedTickets / maxTickets > 0.8;

  return (
    <article className="explore-card group home-theme">
      <Link href={`/events/${event.slug}`} className="block h-full">
        <HomeCard
          tone="card"
          className="overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-2"
        >
          <div
            className="relative flex-shrink-0 overflow-hidden"
            style={{
              height: `${EVENT_IMAGE_HEIGHT}px`,
              minHeight: `${EVENT_IMAGE_HEIGHT}px`,
            }}
          >
            <Image
              src={event.bannerUrl || "/placeholder.svg"}
              alt={event.name}
              width={EVENT_IMAGE_WIDTH}
              height={EVENT_IMAGE_HEIGHT}
              priority={isPriority}
              loading={isPriority ? undefined : "lazy"}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />

            <div
              className="absolute top-4 left-4 capitalize backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold"
              style={{
                backgroundColor: "var(--home-badge-bg)",
                color: "var(--home-text-highlight)",
              }}
            >
              {event.category}
            </div>

            {isAlmostSoldOut && (
              <div className="absolute top-12 left-4">
                <Badge variant="destructive" className="bg-red-500">
                  Almost Sold Out
                </Badge>
              </div>
            )}
          </div>

          <div className="flex justify-end px-4 -mt-4 mb-2 flex-shrink-0 relative z-10">
            <div
              className="backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold shadow-sm"
              style={{
                backgroundColor: "var(--home-accent)",
                color: "var(--home-accent-fg)",
              }}
            >
              {priceDisplay}
            </div>
          </div>

          <div className="p-4 px-6 flex flex-col flex-grow">
            <h3
              className="text-xl font-semibold transition-colors line-clamp-2 min-h-[2.5rem]"
              style={{ color: "var(--home-text)" }}
            >
              {event.name}
            </h3>

            <div
              className="space-y-1 text-sm min-h-[60px]"
              style={{ color: "var(--home-muted)" }}
            >
              <div className="flex items-center">
                <Calendar
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {formatDate(event.date)} at {formatTime(event.date)}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            </div>

            <div className="pb-2" style={{ color: "var(--home-muted)" }}>
              <div className="flex items-center mb-1">
                <Ticket
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">Ticket Options</span>
              </div>
              <div className="space-y-2">
                {ticketCategories.slice(0, 1).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="line-clamp-1">
                      {ticket.name} (
                      {ticket.displayPrice === 0 ? "Free" : formatPrice(ticket.displayPrice)})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="homeAccent" size="lg" className="w-full mt-auto">
              View Details
            </Button>
          </div>
        </HomeCard>
      </Link>
    </article>
  );
}

export const ExploreEventCard = memo(ExploreEventCardComponent);
```

Notes:
- `home-theme` class added to the `<article>` root since `HomeCard` and all its `var(--home-*)` children need that scope, and this component can render inside `EventsGrid` without an ancestor already carrying it (the page wrapper does carry it after Task 8, but keeping it here too is defensive — consistent with the "redundant but harmless" pattern already used across round 1 sections).
- Category badge background uses `--home-badge-bg` (translucent) instead of `bg-white/90` for the same "frosted pill over image" effect in dark tones.
- Kept `Badge variant="destructive"` with its existing `bg-red-500` for "Almost Sold Out" — this is a genuine warning/urgency state, not a themed brand element, so it stays on the existing red regardless of light/dark context (same reasoning as auth-page validation errors).

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: same 9 pre-existing baseline errors, none new.

- [ ] **Step 3: Visual check**

Open `/explore` with at least one event loaded. Confirm: dark card with rounded thumbnail image, category badge in coral-tinted pill, coral price badge, dark title/date/location/ticket-option text, coral "View Details" button, hover lift animation still works.

- [ ] **Step 4: Commit**

```bash
git add app/explore/explore-event-card.tsx
git commit -m "Convert explore event card to HomeCard with thumbnail layout"
```

---

## Task 10: Event Details page dark theme

**Files:**
- Modify: `app/events/[slug]/_components/event-header.tsx`
- Modify: `app/events/[slug]/_components/ticket-category-card.tsx`
- Modify: `app/events/[slug]/page.tsx`

- [ ] **Step 1: `event-header.tsx` — full replacement**

```tsx
import { Calendar, MapPin } from "lucide-react";
import { EventV2 } from "@/types/events-v2.type";

type Props = { event: EventV2 };

export function EventHeaderV2({ event }: Props) {
  const date = new Date(event.date);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className="rounded-2xl border p-5 sm:p-6"
      style={{
        backgroundColor: "var(--home-card)",
        borderColor: "var(--home-border)",
      }}
    >
      <h1
        className="line-clamp-2 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight mb-4"
        style={{ color: "var(--home-text)" }}
      >
        {event.name}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Meta
          icon={<Calendar className="h-5 w-5" style={{ color: "var(--home-accent)" }} />}
          label="Date & Time"
          value={`${dateStr} • ${timeStr}`}
        />
        <Meta
          icon={<MapPin className="h-5 w-5" style={{ color: "var(--home-accent)" }} />}
          label="Location"
          value={event.location}
        />
      </div>
    </div>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--home-muted)" }}
        >
          {label}
        </div>
        <div className="mt-0.5 text-sm font-medium" style={{ color: "var(--home-text)" }}>
          {value}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `ticket-category-card.tsx` — full replacement**

```tsx
// _components/ticket-category-card-v3.tsx
import { TicketCategoryV2 } from "@/types/events-v2.type";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  category: TicketCategoryV2;
  isSelected: boolean;
  quantity: number;
  onToggle: () => void;
  onQuantityChange: (delta: number) => void;
  feeMode: "ORGANIZER" | "ATTENDEE";
  primaryFeeBps: number;
};

export function TicketCategoryCardV2({
  category,
  isSelected,
  quantity,
  onToggle,
  onQuantityChange,
  feeMode,
  primaryFeeBps,
}: Props) {
  const available = category.maxTickets - (category.minted ?? 0);
  const outOfStock = available <= 0;
  const fee =
    feeMode === "ATTENDEE"
      ? Math.floor((category.displayPrice * primaryFeeBps) / 10000)
      : 0;

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all duration-200",
        outOfStock && "opacity-50 pointer-events-none",
      )}
      style={{
        borderColor: isSelected ? "var(--home-accent)" : "var(--home-border)",
        backgroundColor: isSelected ? "var(--home-card-highlight)" : "var(--home-card)",
      }}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-lg" style={{ color: "var(--home-text)" }}>
            {category.name}
          </h3>
          <p className="text-sm mt-1" style={{ color: "var(--home-muted)" }}>
            Admits {category.maxAdmissions}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-bold tracking-tight" style={{ color: "var(--home-text)" }}>
            ₦{category.displayPrice.toLocaleString()}
          </div>
          {fee > 0 && (
            <div className="text-xs mt-0.5" style={{ color: "var(--home-muted)" }}>
              incl. ₦{fee.toLocaleString()} fee
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {isSelected && quantity > 0 ? (
          <div
            className="flex items-center gap-2 border rounded-lg px-1.5 py-1"
            style={{ backgroundColor: "var(--home-bg)", borderColor: "var(--home-border)" }}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              style={{ color: "var(--home-text)" }}
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center font-medium" style={{ color: "var(--home-text)" }}>
              {quantity}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              style={{ color: "var(--home-text)" }}
              onClick={() => onQuantityChange(1)}
              disabled={quantity >= available || quantity >= 10}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div />
        )}

        <Button
          variant={isSelected ? "homeAccent" : "homeOutline"}
          size="sm"
          className="min-w-[100px]"
          onClick={onToggle}
          disabled={outOfStock}
        >
          {isSelected ? "Selected" : outOfStock ? "Sold Out" : "Select"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `page.tsx` — wrapper, organizer avatar gradient, occurrence selector, order summary**

Change the mobile sticky bar's background (around line 132-137) — no change needed here, `bg-background/95` already resolves against whatever the page's dark background is via backdrop-blur transparency, and this bar is intentionally a system-level overlay, not a themed surface. Skip this element.

Change the main page wrapper (around line 160):

```tsx
      <div className="min-h-screen bg-background pb-32 md:pb-0">
```

to:

```tsx
      <div
        className="home-theme min-h-screen pb-32 md:pb-0"
        style={{ backgroundColor: "var(--home-bg)" }}
      >
```

Change the "About the Event" and "Organizer" section headings (around line 182 and 195) — both instances of:

```tsx
                  <h2 className="text-2xl font-bold tracking-tight mb-5">
```

to:

```tsx
                  <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: "var(--home-text)" }}>
```

Change the description prose block (around line 185-191):

```tsx
                  <div className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed">
```

to:

```tsx
                  <div
                    className="prose prose-invert max-w-none leading-relaxed"
                    style={{ color: "var(--home-muted)" }}
                  >
```

Change the organizer card (around line 198-222):

```tsx
                  <div className="flex items-center gap-4 p-6 rounded-2xl border bg-card">
                    <div className="shrink-0">
                      <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-background shadow-sm">
                        {event.organizer.profileImage ? (
                          <img
                            src={event.organizer.profileImage}
                            alt={event.organizer.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xl">
                            {event.organizer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {event.organizer.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Event Organizer
                      </p>
                    </div>
                  </div>
```

to:

```tsx
                  <div
                    className="flex items-center gap-4 p-6 rounded-2xl border"
                    style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}
                  >
                    <div className="shrink-0">
                      <div
                        className="h-14 w-14 rounded-full overflow-hidden border-2 shadow-sm"
                        style={{ borderColor: "var(--home-bg)" }}
                      >
                        {event.organizer.profileImage ? (
                          <img
                            src={event.organizer.profileImage}
                            alt={event.organizer.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="h-full w-full flex items-center justify-center font-semibold text-xl"
                            style={{
                              background: "linear-gradient(to bottom right, var(--home-accent), var(--home-accent-fg))",
                              color: "var(--home-accent-fg)",
                            }}
                          >
                            {event.organizer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-lg" style={{ color: "var(--home-text)" }}>
                        {event.organizer.name}
                      </p>
                      <p className="text-sm" style={{ color: "var(--home-muted)" }}>
                        Event Organizer
                      </p>
                    </div>
                  </div>
```

Change the poster + ticket-list card wrappers (around line 229-253) — both occurrences of:

```tsx
                <div className="rounded-2xl border bg-card overflow-hidden">
```

to:

```tsx
                <div
                  className="rounded-2xl border overflow-hidden"
                  style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}
                >
```

Change the poster's empty-state text (around line 240-244):

```tsx
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                        Event poster
                      </div>
```

to:

```tsx
                      <div className="h-full w-full flex items-center justify-center text-sm" style={{ color: "var(--home-muted)" }}>
                        Event poster
                      </div>
```

Change the "Tickets" header bar (around line 248-253):

```tsx
                  <div className="px-6 py-5 border-b bg-muted/30">
                    <h2 className="text-xl font-bold tracking-tight">
                      Tickets
                    </h2>
                  </div>
```

to:

```tsx
                  <div className="px-6 py-5 border-b" style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card-elevated)" }}>
                    <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--home-text)" }}>
                      Tickets
                    </h2>
                  </div>
```

Change the "No tickets available" fallback (around line 290-292):

```tsx
                        <div className="py-10 text-center text-muted-foreground">
                          No tickets available yet
                        </div>
```

to:

```tsx
                        <div className="py-10 text-center" style={{ color: "var(--home-muted)" }}>
                          No tickets available yet
                        </div>
```

Change the desktop order summary block (around line 298-343):

```tsx
                  {hasSelection && (
                    <div className="p-6 border-t bg-muted/20">
                      <h3 className="font-semibold mb-4">Order Summary</h3>

                      <div className="space-y-3 mb-6 text-sm">
                        {Array.from(selected).map((id) => {
                          const cat = event.ticketCategories.find(
                            (c) => c.id === id,
                          )!;
                          const qty = quantities[id] ?? 1;
                          return (
                            <div key={id} className="flex justify-between">
                              <span className="text-muted-foreground">
                                {cat.name} × {qty}
                              </span>
                              <span className="font-medium">
                                ₦{(cat.displayPrice * qty).toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center py-4 border-t font-bold text-lg">
                        <span>Total</span>
                        <span>₦{totalAmount.toLocaleString()}</span>
                      </div>

                      {/* Disclaimer */}
                      <div className="bg-muted/40 border border-border rounded-lg p-3 mt-4">
                        <p className="text-xs text-muted-foreground">
                          <strong>Note:</strong> Maximum of 10 tickets per
                          purchase. Tickets are non-refundable once purchased.
                        </p>
                      </div>

                      <Button
                        size="lg"
                        variant="primary"
                        className="w-full mt-5"
                        onClick={handleCheckout}
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  )}
```

to:

```tsx
                  {hasSelection && (
                    <div className="p-6 border-t" style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card-elevated)" }}>
                      <h3 className="font-semibold mb-4" style={{ color: "var(--home-text)" }}>Order Summary</h3>

                      <div className="space-y-3 mb-6 text-sm">
                        {Array.from(selected).map((id) => {
                          const cat = event.ticketCategories.find(
                            (c) => c.id === id,
                          )!;
                          const qty = quantities[id] ?? 1;
                          return (
                            <div key={id} className="flex justify-between">
                              <span style={{ color: "var(--home-muted)" }}>
                                {cat.name} × {qty}
                              </span>
                              <span className="font-medium" style={{ color: "var(--home-text)" }}>
                                ₦{(cat.displayPrice * qty).toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        className="flex justify-between items-center py-4 border-t font-bold text-lg"
                        style={{ borderColor: "var(--home-border)", color: "var(--home-text)" }}
                      >
                        <span>Total</span>
                        <span>₦{totalAmount.toLocaleString()}</span>
                      </div>

                      <div
                        className="border rounded-lg p-3 mt-4"
                        style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}
                      >
                        <p className="text-xs" style={{ color: "var(--home-muted)" }}>
                          <strong>Note:</strong> Maximum of 10 tickets per
                          purchase. Tickets are non-refundable once purchased.
                        </p>
                      </div>

                      <Button
                        size="lg"
                        variant="homeAccent"
                        className="w-full mt-5"
                        onClick={handleCheckout}
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  )}
```

Change the `OccurrenceSelector` helper component (around line 372-401):

```tsx
    <div className="rounded-xl border bg-amber-50 border-amber-200 p-4">
      <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-3">
        Pick a date to unlock tickets
      </p>
      <div className="flex flex-wrap gap-2">
        {active.map((o) => {
          const date = new Date(o.startsAt);
          const label = date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
          const sublabel = date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
          const isSelected = o.id === selectedId;
          return (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              className={cn(
                "flex flex-col items-center px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors",
                isSelected
                  ? "border-2 border-[#1E88E5] bg-blue-50 text-[#1E88E5]"
                  : "border border-border bg-background text-foreground hover:border-[#1E88E5]",
              )}
              title={`${sublabel}${o.locationOverride ? " · " + o.locationOverride : ""}`}
            >
              {label}
              <span className="text-[10px] font-normal opacity-70">{sublabel}</span>
            </button>
          );
        })}
      </div>
    </div>
```

to:

```tsx
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: "rgba(244,208,63,0.1)", borderColor: "var(--home-highlight-yellow)" }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide mb-3"
        style={{ color: "var(--home-highlight-yellow)" }}
      >
        Pick a date to unlock tickets
      </p>
      <div className="flex flex-wrap gap-2">
        {active.map((o) => {
          const date = new Date(o.startsAt);
          const label = date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
          const sublabel = date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
          const isSelected = o.id === selectedId;
          return (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              className="flex flex-col items-center px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors"
              style={
                isSelected
                  ? { borderWidth: 2, borderColor: "var(--home-accent)", backgroundColor: "var(--home-card-highlight)", color: "var(--home-accent)" }
                  : { borderColor: "var(--home-border)", backgroundColor: "var(--home-card)", color: "var(--home-text)" }
              }
              title={`${sublabel}${o.locationOverride ? " · " + o.locationOverride : ""}`}
            >
              {label}
              <span className="text-[10px] font-normal opacity-70">{sublabel}</span>
            </button>
          );
        })}
      </div>
    </div>
```

Change `LoadingSkeleton` and `NotFound` wrappers (around line 404-437) — both occurrences of `bg-background`:

```tsx
    <div className="min-h-screen bg-background">
```

to:

```tsx
    <div className="home-theme min-h-screen" style={{ backgroundColor: "var(--home-bg)" }}>
```

and:

```tsx
    <div className="min-h-screen flex items-center justify-center p-4">
```

to:

```tsx
    <div className="home-theme min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--home-bg)" }}>
```

`NotFound`'s text/button (around line 425-434):

```tsx
        <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-6 text-2xl font-bold">Event not found</h2>
        <p className="mt-3 text-muted-foreground">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-8 w-full" onClick={() => router.push("/explore")}>
          Discover Events
        </Button>
```

to:

```tsx
        <AlertCircle className="mx-auto h-16 w-16" style={{ color: "var(--home-muted)" }} />
        <h2 className="mt-6 text-2xl font-bold" style={{ color: "var(--home-text)" }}>Event not found</h2>
        <p className="mt-3" style={{ color: "var(--home-muted)" }}>
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Button variant="homeAccent" className="mt-8 w-full" onClick={() => router.push("/explore")}>
          Discover Events
        </Button>
```

No other lines in `page.tsx` change — all state, handlers, and the `Skeleton` component usages inside `LoadingSkeleton` stay as-is (the `Skeleton` primitive's own colors are out of scope, same reasoning as Task 8).

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: same 9 pre-existing baseline errors, none new.

- [ ] **Step 5: Visual check**

Open `/events/<any-slug>`. Confirm: dark page background, dark event-header card with coral calendar/pin icons, dark "About"/"Organizer" sections with coral-gradient avatar fallback (if organizer has no photo), dark poster/tickets card, ticket category cards highlighting in coral when selected, dark order summary appearing when a ticket is selected, and — if the event `isRecurring` with active occurrences — the date-picker pills in a yellow-tinted card instead of amber.

- [ ] **Step 6: Commit**

```bash
git add "app/events/[slug]/page.tsx" "app/events/[slug]/_components/event-header.tsx" "app/events/[slug]/_components/ticket-category-card.tsx"
git commit -m "Dark-theme the event details page"
```

---

## Task 11: Checkout page dark theme

**Files:**
- Modify: `app/checkout/page.tsx`

- [ ] **Step 1: Loading, empty-cart, and success states (lines 253-304)**

Change:

```tsx
  if (!dataChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#1E88E5]" />
          <p className="text-muted-foreground text-sm">Loading checkout…</p>
        </div>
      </div>
    );
  }

  // ── Empty cart state ───────────────────────────────────────────
  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-[#1E88E5]" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">No event selected for checkout</h1>
          <p className="text-muted-foreground mb-8">
            Browse our events and select tickets to get started.
          </p>
          <Button variant="primary" size="lg" className="w-full" onClick={() => router.push("/explore")}>
            Explore Events
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────
  if (purchaseSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Tickets Claimed!</h1>
          <p className="text-muted-foreground mb-8">
            Your free tickets have been added to your account. Redirecting you now…
          </p>
          <Button variant="primary" size="lg" className="w-full" onClick={() => router.push("/explore")}>
            Explore More Events
          </Button>
        </div>
      </div>
    );
  }
```

to:

```tsx
  if (!dataChecked) {
    return (
      <div className="home-theme min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--home-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--home-accent)" }} />
          <p className="text-sm" style={{ color: "var(--home-muted)" }}>Loading checkout…</p>
        </div>
      </div>
    );
  }

  // ── Empty cart state ───────────────────────────────────────────
  if (!checkoutData) {
    return (
      <div className="home-theme min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--home-bg)" }}>
        <div className="w-full max-w-md text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "var(--home-card)" }}
          >
            <ShoppingCart className="w-10 h-10" style={{ color: "var(--home-accent)" }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--home-text)" }}>No event selected for checkout</h1>
          <p className="mb-8" style={{ color: "var(--home-muted)" }}>
            Browse our events and select tickets to get started.
          </p>
          <Button variant="homeAccent" size="lg" className="w-full" onClick={() => router.push("/explore")}>
            Explore Events
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────
  if (purchaseSuccess) {
    return (
      <div className="home-theme min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--home-bg)" }}>
        <div className="w-full max-w-md text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "rgba(66,167,59,0.1)" }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: "var(--home-success)" }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--home-text)" }}>Tickets Claimed!</h1>
          <p className="mb-8" style={{ color: "var(--home-muted)" }}>
            Your free tickets have been added to your account. Redirecting you now…
          </p>
          <Button variant="homeAccent" size="lg" className="w-full" onClick={() => router.push("/explore")}>
            Explore More Events
          </Button>
        </div>
      </div>
    );
  }
```

- [ ] **Step 2: Main wrapper and top bar (lines 312-332)**

Change:

```tsx
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-background to-background">
      {/* Top bar */}
      <div className="border-b border-border bg-background/80 backdrop-blur sticky top-[60px] z-40">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingCart className="h-4 w-4 text-[#1E88E5] shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">{checkoutData.eventName}</span>
          </div>
          <div className="ml-auto">
            <Badge variant="secondary" className="text-xs">
              {totalQuantity} ticket{totalQuantity !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </div>
```

to:

```tsx
  return (
    <div className="home-theme min-h-screen" style={{ backgroundColor: "var(--home-bg)" }}>
      {/* Top bar */}
      <div
        className="border-b backdrop-blur sticky top-[60px] z-40"
        style={{ borderColor: "var(--home-border)", backgroundColor: "rgba(11,14,20,0.8)" }}
      >
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 -ml-2" style={{ color: "var(--home-text)" }}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-4 w-px" style={{ backgroundColor: "var(--home-border-strong)" }} />
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingCart className="h-4 w-4 shrink-0" style={{ color: "var(--home-accent)" }} />
            <span className="text-sm font-medium truncate" style={{ color: "var(--home-text)" }}>{checkoutData.eventName}</span>
          </div>
          <div className="ml-auto">
            <Badge variant="secondary" className="text-xs" style={{ backgroundColor: "var(--home-card)", color: "var(--home-muted)" }}>
              {totalQuantity} ticket{totalQuantity !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </div>
```

- [ ] **Step 3: Section heading and Card 1 "Your Details" (lines 340-413)**

Change:

```tsx
            {/* Section heading */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Complete your order</h1>
              <p className="text-muted-foreground mt-1 text-sm">Fill in the details below to confirm your tickets</p>
            </div>

            {/* ── 1. Your Details ─────────────────────────── */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border bg-secondary/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    1
                  </div>
                  <CardTitle className="text-base">Your Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {user ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="w-9 h-9 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#1E88E5] ml-auto shrink-0" />
                  </div>
                ) : (
```

to:

```tsx
            {/* Section heading */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--home-text)" }}>Complete your order</h1>
              <p className="mt-1 text-sm" style={{ color: "var(--home-muted)" }}>Fill in the details below to confirm your tickets</p>
            </div>

            {/* ── 1. Your Details ─────────────────────────── */}
            <Card className="overflow-hidden" style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}>
              <CardHeader className="border-b pb-4" style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card-elevated)" }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                    style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
                  >
                    1
                  </div>
                  <CardTitle className="text-base" style={{ color: "var(--home-text)" }}>Your Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {user ? (
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ backgroundColor: "var(--home-card-highlight)", borderColor: "var(--home-border)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                      style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--home-text)" }}>{user.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--home-muted)" }}>{user.email}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: "var(--home-accent)" }} />
                  </div>
                ) : (
```

Change the guest buyer-info form (lines 369-410):

```tsx
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="buyer-name" className="text-sm font-medium flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          Your Name
                          <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                        </Label>
                        <Input
                          id="buyer-name"
                          placeholder="Full name"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="buyer-email" className="text-sm font-medium flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          Email Address
                          <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        <Input
                          id="buyer-email"
                          type="email"
                          placeholder="you@example.com"
                          value={buyerEmail}
                          onChange={(e) => { setBuyerEmail(e.target.value); clearError("buyerEmail"); }}
                          className={`rounded-xl ${validationErrors["buyerEmail"] ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {validationErrors["buyerEmail"] && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {validationErrors["buyerEmail"]}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your tickets and confirmation will be sent to this email address.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
```

to:

```tsx
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="buyer-name" className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--home-muted)" }}>
                          <User className="w-3.5 h-3.5" />
                          Your Name
                          <span className="text-xs font-normal">(optional)</span>
                        </Label>
                        <Input
                          id="buyer-name"
                          placeholder="Full name"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          className="rounded-xl"
                          style={{ backgroundColor: "var(--home-bg)", borderColor: "var(--home-border)", color: "var(--home-text)" }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="buyer-email" className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--home-muted)" }}>
                          <Mail className="w-3.5 h-3.5" />
                          Email Address
                          <span className="text-red-400 ml-0.5">*</span>
                        </Label>
                        <Input
                          id="buyer-email"
                          type="email"
                          placeholder="you@example.com"
                          value={buyerEmail}
                          onChange={(e) => { setBuyerEmail(e.target.value); clearError("buyerEmail"); }}
                          className="rounded-xl"
                          style={{
                            backgroundColor: "var(--home-bg)",
                            borderColor: validationErrors["buyerEmail"] ? "#f87171" : "var(--home-border)",
                            color: "var(--home-text)",
                          }}
                        />
                        {validationErrors["buyerEmail"] && (
                          <p className="text-xs text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {validationErrors["buyerEmail"]}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs" style={{ color: "var(--home-muted)" }}>
                      Your tickets and confirmation will be sent to this email address.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
```

- [ ] **Step 4: Card 2 "Ticket Recipients" (lines 415-516)**

Change the Card header (same pattern as Step 3's Card 1 header — apply identically, with `2` instead of `1` and `Ticket Recipients` instead of `Your Details`):

```tsx
              <Card className="overflow-hidden">
                <CardHeader className="border-b border-border bg-secondary/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      2
                    </div>
                    <CardTitle className="text-base">Ticket Recipients</CardTitle>
                  </div>
                </CardHeader>
```

to:

```tsx
              <Card className="overflow-hidden" style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}>
                <CardHeader className="border-b pb-4" style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card-elevated)" }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                      style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
                    >
                      2
                    </div>
                    <CardTitle className="text-base" style={{ color: "var(--home-text)" }}>Ticket Recipients</CardTitle>
                  </div>
                </CardHeader>
```

Change the checkbox label and its checked-state box (lines 427-449):

```tsx
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={useMultipleRecipients}
                        onChange={(e) => setUseMultipleRecipients(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${useMultipleRecipients ? "bg-[#1E88E5] border-[#1E88E5]" : "border-input group-hover:border-[#1E88E5]"}`}>
                        {useMultipleRecipients && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Send tickets to different recipients</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Assign each ticket to a specific person's name and email
                      </p>
                    </div>
                  </label>
```

to:

```tsx
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={useMultipleRecipients}
                        onChange={(e) => setUseMultipleRecipients(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: useMultipleRecipients ? "var(--home-accent)" : "transparent",
                          borderColor: useMultipleRecipients ? "var(--home-accent)" : "var(--home-border-strong)",
                        }}
                      >
                        {useMultipleRecipients && (
                          <svg className="w-3 h-3" style={{ color: "var(--home-accent-fg)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--home-text)" }}>Send tickets to different recipients</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--home-muted)" }}>
                        Assign each ticket to a specific person's name and email
                      </p>
                    </div>
                  </label>
```

Change the "multiple recipients" info banner (lines 453-458):

```tsx
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <Users className="w-4 h-4 text-[#1E88E5] mt-0.5 shrink-0" />
                        <p className="text-xs text-[#1E88E5]">
                          Each ticket will be sent to the recipient's email address after purchase.
                        </p>
                      </div>
```

to:

```tsx
                      <div
                        className="flex items-start gap-2 p-3 rounded-xl border"
                        style={{ backgroundColor: "var(--home-card-highlight)", borderColor: "var(--home-border)" }}
                      >
                        <Users className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--home-accent)" }} />
                        <p className="text-xs" style={{ color: "var(--home-text-highlight)" }}>
                          Each ticket will be sent to the recipient's email address after purchase.
                        </p>
                      </div>
```

Change the per-ticket recipient sub-form (lines 460-511):

```tsx
                      {checkoutData.tickets.map((ticket) => (
                        <div key={ticket.ticketCategoryId}>
                          <div className="flex items-center gap-2 mb-3">
                            <Ticket className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground">{ticket.ticketCategoryName}</span>
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {ticket.quantity} ticket{ticket.quantity !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            {Array(ticket.quantity).fill(null).map((_, i) => {
                              const key = `${ticket.ticketCategoryId}-${i}`;
                              const hasError = !!validationErrors[key];
                              const recipient = recipients[ticket.ticketCategoryId]?.[i] ?? { recipientName: "", recipientEmail: "" };
                              return (
                                <div key={i} className={`p-4 rounded-xl border ${hasError ? "border-destructive bg-destructive/5" : "border-border bg-secondary/30"}`}>
                                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                                    Ticket {i + 1}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs">Full Name</Label>
                                      <Input
                                        placeholder="Recipient name"
                                        value={recipient.recipientName}
                                        onChange={(e) => handleRecipientChange(ticket.ticketCategoryId, i, "recipientName", e.target.value)}
                                        className={`rounded-lg text-sm ${hasError ? "border-destructive" : ""}`}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Email Address</Label>
                                      <Input
                                        type="email"
                                        placeholder="Recipient email"
                                        value={recipient.recipientEmail}
                                        onChange={(e) => handleRecipientChange(ticket.ticketCategoryId, i, "recipientEmail", e.target.value)}
                                        className={`rounded-lg text-sm ${hasError ? "border-destructive" : ""}`}
                                      />
                                    </div>
                                  </div>
                                  {hasError && (
                                    <p className="mt-2 text-xs text-destructive flex items-center gap-1">
                                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                      {validationErrors[key]}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
```

to:

```tsx
                      {checkoutData.tickets.map((ticket) => (
                        <div key={ticket.ticketCategoryId}>
                          <div className="flex items-center gap-2 mb-3">
                            <Ticket className="w-4 h-4" style={{ color: "var(--home-muted)" }} />
                            <span className="text-sm font-semibold" style={{ color: "var(--home-text)" }}>{ticket.ticketCategoryName}</span>
                            <Badge variant="secondary" className="text-xs ml-auto" style={{ backgroundColor: "var(--home-card)", color: "var(--home-muted)" }}>
                              {ticket.quantity} ticket{ticket.quantity !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            {Array(ticket.quantity).fill(null).map((_, i) => {
                              const key = `${ticket.ticketCategoryId}-${i}`;
                              const hasError = !!validationErrors[key];
                              const recipient = recipients[ticket.ticketCategoryId]?.[i] ?? { recipientName: "", recipientEmail: "" };
                              return (
                                <div
                                  key={i}
                                  className="p-4 rounded-xl border"
                                  style={{
                                    borderColor: hasError ? "#f87171" : "var(--home-border)",
                                    backgroundColor: hasError ? "rgba(248,113,113,0.05)" : "var(--home-card-elevated)",
                                  }}
                                >
                                  <p className="text-xs font-medium mb-3 uppercase tracking-wide" style={{ color: "var(--home-muted)" }}>
                                    Ticket {i + 1}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs" style={{ color: "var(--home-muted)" }}>Full Name</Label>
                                      <Input
                                        placeholder="Recipient name"
                                        value={recipient.recipientName}
                                        onChange={(e) => handleRecipientChange(ticket.ticketCategoryId, i, "recipientName", e.target.value)}
                                        className="rounded-lg text-sm"
                                        style={{
                                          backgroundColor: "var(--home-bg)",
                                          borderColor: hasError ? "#f87171" : "var(--home-border)",
                                          color: "var(--home-text)",
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs" style={{ color: "var(--home-muted)" }}>Email Address</Label>
                                      <Input
                                        type="email"
                                        placeholder="Recipient email"
                                        value={recipient.recipientEmail}
                                        onChange={(e) => handleRecipientChange(ticket.ticketCategoryId, i, "recipientEmail", e.target.value)}
                                        className="rounded-lg text-sm"
                                        style={{
                                          backgroundColor: "var(--home-bg)",
                                          borderColor: hasError ? "#f87171" : "var(--home-border)",
                                          color: "var(--home-text)",
                                        }}
                                      />
                                    </div>
                                  </div>
                                  {hasError && (
                                    <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                      {validationErrors[key]}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
```

- [ ] **Step 5: Card 3 "Custom Fields" (lines 518-586)**

Change the Card wrapper/header (same header pattern, `3`/`2` conditional and "Additional Information" title):

```tsx
              <Card className="overflow-hidden">
                <CardHeader className="border-b border-border bg-secondary/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      {totalQuantity > 1 ? 3 : 2}
                    </div>
                    <CardTitle className="text-base">Additional Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
```

to:

```tsx
              <Card className="overflow-hidden" style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}>
                <CardHeader className="border-b pb-4" style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card-elevated)" }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                      style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
                    >
                      {totalQuantity > 1 ? 3 : 2}
                    </div>
                    <CardTitle className="text-base" style={{ color: "var(--home-text)" }}>Additional Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
```

Change each custom-field row's label and the three field-type branches (Textarea/Select/Input) (lines 536-582):

```tsx
                        <div key={field.id} className="space-y-1.5">
                          <Label htmlFor={`cf-${field.id}`} className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </Label>
                          {field.fieldType === "TEXTAREA" ? (
                            <Textarea
                              id={`cf-${field.id}`}
                              value={customFieldValues[field.id] ?? ""}
                              onChange={(e) => {
                                setCustomFieldValues((p) => ({ ...p, [field.id]: e.target.value }));
                                clearError(errKey);
                              }}
                              className={`rounded-xl ${hasError ? "border-destructive" : ""}`}
                              rows={3}
                            />
                          ) : field.fieldType === "SELECT" ? (
                            <Select
                              value={customFieldValues[field.id] ?? ""}
                              onValueChange={(v) => { setCustomFieldValues((p) => ({ ...p, [field.id]: v })); clearError(errKey); }}
                            >
                              <SelectTrigger className={`rounded-xl ${hasError ? "border-destructive" : ""}`}>
                                <SelectValue placeholder="Select an option…" />
                              </SelectTrigger>
                              <SelectContent>
                                {(field.options ?? []).map((opt) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={`cf-${field.id}`}
                              type={field.fieldType === "EMAIL" ? "email" : field.fieldType === "NUMBER" ? "number" : "text"}
                              value={customFieldValues[field.id] ?? ""}
                              onChange={(e) => { setCustomFieldValues((p) => ({ ...p, [field.id]: e.target.value })); clearError(errKey); }}
                              className={`rounded-xl ${hasError ? "border-destructive" : ""}`}
                            />
                          )}
                          {hasError && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {validationErrors[errKey]}
                            </p>
                          )}
                        </div>
```

to:

```tsx
                        <div key={field.id} className="space-y-1.5">
                          <Label htmlFor={`cf-${field.id}`} className="text-sm font-medium" style={{ color: "var(--home-muted)" }}>
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </Label>
                          {field.fieldType === "TEXTAREA" ? (
                            <Textarea
                              id={`cf-${field.id}`}
                              value={customFieldValues[field.id] ?? ""}
                              onChange={(e) => {
                                setCustomFieldValues((p) => ({ ...p, [field.id]: e.target.value }));
                                clearError(errKey);
                              }}
                              className="rounded-xl"
                              style={{ backgroundColor: "var(--home-bg)", borderColor: hasError ? "#f87171" : "var(--home-border)", color: "var(--home-text)" }}
                              rows={3}
                            />
                          ) : field.fieldType === "SELECT" ? (
                            <Select
                              value={customFieldValues[field.id] ?? ""}
                              onValueChange={(v) => { setCustomFieldValues((p) => ({ ...p, [field.id]: v })); clearError(errKey); }}
                            >
                              <SelectTrigger
                                className="rounded-xl"
                                style={{ backgroundColor: "var(--home-bg)", borderColor: hasError ? "#f87171" : "var(--home-border)", color: "var(--home-text)" }}
                              >
                                <SelectValue placeholder="Select an option…" />
                              </SelectTrigger>
                              <SelectContent>
                                {(field.options ?? []).map((opt) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={`cf-${field.id}`}
                              type={field.fieldType === "EMAIL" ? "email" : field.fieldType === "NUMBER" ? "number" : "text"}
                              value={customFieldValues[field.id] ?? ""}
                              onChange={(e) => { setCustomFieldValues((p) => ({ ...p, [field.id]: e.target.value })); clearError(errKey); }}
                              className="rounded-xl"
                              style={{ backgroundColor: "var(--home-bg)", borderColor: hasError ? "#f87171" : "var(--home-border)", color: "var(--home-text)" }}
                            />
                          )}
                          {hasError && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {validationErrors[errKey]}
                            </p>
                          )}
                        </div>
```

Note: `SelectContent`/`SelectItem` (the dropdown popover) is left using its own component defaults — it renders in a portal with its own light-styled popover surface; restyling the shared `Select` primitive's dropdown chrome is out of scope for this per-page override pattern (same reasoning as the `Slider` in Task 8). Flag if it looks jarring in the visual check.

- [ ] **Step 6: Order Summary card (lines 590-714)**

Change the Card header:

```tsx
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border bg-secondary/30 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#1E88E5]" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Event name */}
                <div className="pb-3 border-b border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Event</p>
                  <p className="text-sm font-semibold text-foreground leading-snug">{checkoutData.eventName}</p>
                </div>

                {/* Ticket line items */}
                <div className="space-y-2">
                  {checkoutData.tickets.map((ticket, i) => (
                    <div key={i} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-foreground font-medium truncate">{ticket.ticketCategoryName}</p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.quantity} × ₦{ticket.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground shrink-0">
                        ₦{(ticket.price * ticket.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                  </div>
                  {discountState.appliedDiscount && discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({discountState.appliedDiscount.code})</span>
                      <span>−₦{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-1 border-t border-border">
                    <span>Total</span>
                    <span className="text-[#1E88E5]">₦{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Discount code */}
                <div className="border-t border-border pt-4">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Tag className="w-3.5 h-3.5" />
                    Discount Code
                  </Label>
                  {discountState.appliedDiscount ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-green-700">{discountState.appliedDiscount.code}</p>
                        <p className="text-xs text-green-600">
                          {discountState.appliedDiscount.type === "PERCENT"
                            ? `${discountState.appliedDiscount.value}% off`
                            : `₦${(discountState.appliedDiscount.value / 100).toLocaleString()} off`}
                        </p>
                      </div>
                      <button
                        onClick={() => { setDiscountState({ appliedDiscount: null, isValidating: false }); setDiscountCode(""); }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        className="rounded-xl text-sm flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyDiscount}
                        disabled={isValidatingDiscount || !discountCode.trim()}
                        className="shrink-0 px-4"
                      >
                        {isValidatingDiscount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  onClick={handlePurchase}
                  disabled={isSubmitting || isProcessing}
                >
                  {isSubmitting || isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Complete Purchase
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By completing your purchase you agree to our terms of service.
                </p>
              </CardContent>
            </Card>
```

to:

```tsx
            <Card className="overflow-hidden" style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}>
              <CardHeader className="border-b pb-4" style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card-elevated)" }}>
                <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--home-text)" }}>
                  <ShoppingCart className="w-4 h-4" style={{ color: "var(--home-accent)" }} />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Event name */}
                <div className="pb-3 border-b" style={{ borderColor: "var(--home-border)" }}>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--home-muted)" }}>Event</p>
                  <p className="text-sm font-semibold leading-snug" style={{ color: "var(--home-text)" }}>{checkoutData.eventName}</p>
                </div>

                {/* Ticket line items */}
                <div className="space-y-2">
                  {checkoutData.tickets.map((ticket, i) => (
                    <div key={i} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--home-text)" }}>{ticket.ticketCategoryName}</p>
                        <p className="text-xs" style={{ color: "var(--home-muted)" }}>
                          {ticket.quantity} × ₦{ticket.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold shrink-0" style={{ color: "var(--home-text)" }}>
                        ₦{(ticket.price * ticket.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-3 space-y-2" style={{ borderColor: "var(--home-border)" }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--home-muted)" }}>Subtotal</span>
                    <span className="font-medium" style={{ color: "var(--home-text)" }}>₦{subtotal.toLocaleString()}</span>
                  </div>
                  {discountState.appliedDiscount && discountAmount > 0 && (
                    <div className="flex justify-between text-sm" style={{ color: "var(--home-success-text)" }}>
                      <span>Discount ({discountState.appliedDiscount.code})</span>
                      <span>−₦{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-1 border-t" style={{ borderColor: "var(--home-border)", color: "var(--home-text)" }}>
                    <span>Total</span>
                    <span style={{ color: "var(--home-accent)" }}>₦{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Discount code */}
                <div className="border-t pt-4" style={{ borderColor: "var(--home-border)" }}>
                  <Label className="text-xs font-medium flex items-center gap-1.5 mb-2" style={{ color: "var(--home-muted)" }}>
                    <Tag className="w-3.5 h-3.5" />
                    Discount Code
                  </Label>
                  {discountState.appliedDiscount ? (
                    <div
                      className="flex items-center gap-2 p-3 rounded-xl border"
                      style={{ backgroundColor: "rgba(66,167,59,0.1)", borderColor: "var(--home-success)" }}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--home-success)" }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold" style={{ color: "var(--home-success-text)" }}>{discountState.appliedDiscount.code}</p>
                        <p className="text-xs" style={{ color: "var(--home-success-text)" }}>
                          {discountState.appliedDiscount.type === "PERCENT"
                            ? `${discountState.appliedDiscount.value}% off`
                            : `₦${(discountState.appliedDiscount.value / 100).toLocaleString()} off`}
                        </p>
                      </div>
                      <button
                        onClick={() => { setDiscountState({ appliedDiscount: null, isValidating: false }); setDiscountCode(""); }}
                        className="transition-colors"
                        style={{ color: "var(--home-muted)" }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        className="rounded-xl text-sm flex-1"
                        style={{ backgroundColor: "var(--home-bg)", borderColor: "var(--home-border)", color: "var(--home-text)" }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                      />
                      <Button
                        variant="homeOutline"
                        size="sm"
                        onClick={handleApplyDiscount}
                        disabled={isValidatingDiscount || !discountCode.trim()}
                        className="shrink-0 px-4"
                      >
                        {isValidatingDiscount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Button
                  variant="homeAccent"
                  size="lg"
                  className="w-full mt-2"
                  onClick={handlePurchase}
                  disabled={isSubmitting || isProcessing}
                >
                  {isSubmitting || isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Complete Purchase
                    </>
                  )}
                </Button>

                <p className="text-center text-xs" style={{ color: "var(--home-muted)" }}>
                  By completing your purchase you agree to our terms of service.
                </p>
              </CardContent>
            </Card>
```

- [ ] **Step 7: "What happens next" card (lines 717-735)**

Change:

```tsx
            <Card>
              <CardContent className="p-5 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What happens next?</p>
                {[
                  { icon: Ticket, title: "Instant ticket delivery", desc: "Tickets sent to your email immediately" },
                  { icon: CheckCircle2, title: "QR code included", desc: "Scan at the venue for entry" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[#1E88E5]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
```

to:

```tsx
            <Card style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}>
              <CardContent className="p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--home-muted)" }}>What happens next?</p>
                {[
                  { icon: Ticket, title: "Instant ticket delivery", desc: "Tickets sent to your email immediately" },
                  { icon: CheckCircle2, title: "QR code included", desc: "Scan at the venue for entry" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--home-card-highlight)" }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: "var(--home-accent)" }} />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--home-text)" }}>{title}</p>
                      <p className="text-xs" style={{ color: "var(--home-muted)" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
```

- [ ] **Step 8: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: same 9 pre-existing baseline errors (including the pre-existing `app/checkout/page.tsx(214,13)` type error, which is unrelated to styling and not touched by this task), none new.

- [ ] **Step 9: Visual check**

Trigger checkout by selecting a ticket on an event detail page and clicking through, or navigate directly and check each state:
- With no `checkoutData` in `sessionStorage`: dark empty-cart state with coral cart icon and "Explore Events" button.
- With valid checkout data: dark top bar, dark "Your Details"/"Ticket Recipients"/"Additional Information" cards (numbered badges in coral), dark order summary with coral total, dark discount-code input, coral "Complete Purchase" button.
- If reachable, the success state: dark background, green success icon/heading.

- [ ] **Step 10: Commit**

```bash
git add app/checkout/page.tsx
git commit -m "Dark-theme the checkout page"
```

---

## Task 12: Full round-2 verification

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck**

Run: `npx tsc --noEmit`
Expected: exactly the same 9 pre-existing baseline errors as Task 1, none new, across the whole round.

- [ ] **Step 2: Visual pass on all 7 dark pages**

With the dev server running, open each of: `/`, `/explore`, `/events/<slug>`, `/checkout` (with test data), `/login`, `/register`, `/forgot-password`, `/reset-password`. Confirm every page uses the dark palette consistently — no leftover `bg-white`/`bg-gray-*`/light gradients anywhere, headings in `--home-text`, secondary text in `--home-muted`, primary actions in coral.

- [ ] **Step 3: Regression pass on untouched routes**

Open `/my-tickets`, `/organizer`, `/wallet`, `/settings`, `/terms`, `/service-agreement`, `/admin/dashboard` (if accessible). Confirm all still render the original light theme with the light sticky header — zero visual change from before this round.

- [ ] **Step 4: Interaction pass**

- `/explore`: type a search query, toggle filters, apply/clear filters, paginate if more than one page exists.
- `/events/<slug>`: select a ticket category, confirm order summary appears, click through to checkout.
- `/checkout`: fill in guest buyer info (if not logged in) or confirm logged-in user info displays, apply a discount code if one exists, submit.
- `/login`, `/register`, `/forgot-password`, `/reset-password`: submit each form with invalid input and confirm validation error text is legible (red-on-dark), submit with valid input and confirm the mutation fires (network tab or toast).

- [ ] **Step 5: Mobile check**

Resize to a mobile viewport (375×812) and check `/explore` (filter panel, card grid), `/events/<slug>` (sticky mobile checkout bar), and one auth page (`/login`) for layout integrity.

- [ ] **Step 6: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "Fix visual regressions found in round 2 verification pass"
```

(Skip this commit if steps 1–5 found nothing to fix.)
