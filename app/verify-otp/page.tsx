"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResendOtp, useVerifyOtp } from "@/services/auth/auth.queries";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendAfter, setResendAfter] = useState(0);
  const verify = useVerifyOtp();
  const resend = useResendOtp();

  useEffect(() => {
    if (!resendAfter) return;
    const timer = window.setTimeout(() => setResendAfter(0), Math.max(0, resendAfter - Date.now()));
    return () => window.clearTimeout(timer);
  }, [resendAfter]);

  const loginParams = new URLSearchParams();
  if (searchParams.get("intent") === "organizer") loginParams.set("intent", "organizer");
  const redirect = searchParams.get("redirect") ?? searchParams.get("returnUrl");
  if (redirect?.startsWith("/") && !redirect.startsWith("//")) loginParams.set("redirect", redirect);
  const loginHref = `/login${loginParams.size ? `?${loginParams}` : ""}`;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || !/^\d{6}$/.test(code)) {
      setError("Enter your email and the six-digit code we sent you.");
      return;
    }
    try {
      await verify.mutateAsync({ email: normalizedEmail, otp: code });
      router.push(`${loginHref}${loginHref.includes("?") ? "&" : "?"}verified=1`);
    } catch (cause: any) {
      setError(cause?.response?.data?.message ?? "That code could not be verified. Try again or request a new one.");
    }
  };

  const requestCode = async () => {
    setError("");
    setMessage("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter your email address first.");
      return;
    }
    if (Date.now() < resendAfter) return;
    try {
      await resend.mutateAsync({ email: normalizedEmail, context: "register" });
      setCode("");
      setMessage("A new code is on its way. Check your inbox and spam folder.");
      setResendAfter(Date.now() + 60_000);
    } catch (cause: any) {
      setError(cause?.response?.data?.message ?? "We couldn't send a new code. Please try again.");
    }
  };

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md min-w-0">
        <p className="mb-3 text-sm font-semibold tracking-wide text-[var(--home-accent)]">ONE LAST STEP</p>
        <h1 className="text-3xl font-bold leading-tight text-[var(--home-text)] sm:text-4xl">Verify your email</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--home-muted)] sm:text-base">Enter the six-digit code sent to your inbox. You can finish this later or on another device.</p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="verify-email" className="block text-sm font-medium text-[var(--home-text)]">Email address</label>
            <Input id="verify-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 w-full min-w-0 rounded-lg border-[var(--home-border-strong)] bg-[var(--home-bg)] px-4 text-base text-[var(--home-text)]" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="verification-code" className="block text-sm font-medium text-[var(--home-text)]">Verification code</label>
            <Input id="verification-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="h-14 w-full min-w-0 rounded-lg border-[var(--home-border-strong)] bg-[var(--home-bg)] px-4 text-center font-mono text-2xl tracking-[0.35em] text-[var(--home-text)]" required />
            <p className="text-xs text-[var(--home-muted)]">Codes expire after 10 minutes.</p>
          </div>

          {error && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          {message && <p role="status" className="rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300">{message}</p>}

          <Button type="submit" variant="homeAccent" disabled={verify.isPending || code.length !== 6} className="h-12 w-full rounded-lg">{verify.isPending ? "Verifying..." : "Verify email"}</Button>
        </form>

        <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={requestCode} disabled={resend.isPending || Date.now() < resendAfter} className="text-left font-semibold text-[var(--home-text-highlight)] underline disabled:opacity-50">{resend.isPending ? "Sending..." : "Send a new code"}</button>
          <Link href={loginHref} className="text-[var(--home-muted)] underline">Back to sign in</Link>
        </div>
      </div>
    </AuthShell>
  );
}
