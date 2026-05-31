"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, AlertCircle } from "lucide-react";
import axios from "@/services/axios";
import { buildEndpoint } from "@/services/api-config";
import { useEventBySlugV2 } from "@/services/events/events-v2.queries";

type Step = "email" | "otp";

const API_VERSION = "v2";

export default function ShareableInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const shareableToken = searchParams.get("s") ?? "";
  const eventSlug = searchParams.get("eventSlug") ?? "";

  const { data: event, isLoading: eventLoading } = useEventBySlugV2(eventSlug);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!shareableToken || !eventSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm bg-card rounded-2xl overflow-hidden shadow-lg text-center p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Invalid invite link</h2>
          <p className="text-muted-foreground text-sm">
            This invite link is missing required parameters. Please ask the organizer for a new link.
          </p>
        </div>
      </div>
    );
  }

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(buildEndpoint(API_VERSION, "events/shareable/request-access"), {
        shareableToken,
        email: email.trim(),
      });
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to send access code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otp.trim()) {
      setError("Please enter the code from your email.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(buildEndpoint(API_VERSION, "events/shareable/verify-otp"), {
        shareableToken,
        email: email.trim(),
        otp: otp.trim(),
      });
      const { accessToken, eventSlug: returnedSlug } = res.data;
      router.push(`/events/${returnedSlug ?? eventSlug}?accessToken=${accessToken}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Invalid or expired code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const heroTitle = eventLoading ? "Loading…" : (event?.name ?? "Private Event");
  const heroSub = event
    ? [event.date ? new Date(event.date).toLocaleDateString("en-NG", { dateStyle: "medium" }) : null, event.location].filter(Boolean).join(" · ")
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card rounded-2xl overflow-hidden shadow-lg">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white px-6 py-8 text-center">
          <p className="text-xs uppercase tracking-widest opacity-75 mb-1">You&apos;re Invited</p>
          <h1 className="text-xl font-extrabold leading-tight">{heroTitle}</h1>
          {heroSub && <p className="text-xs opacity-75 mt-1">{heroSub}</p>}
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          {step === "email" ? (
            <form onSubmit={handleRequestAccess} className="space-y-4">
              <div>
                <Label htmlFor="email">Enter your email to claim your spot</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="mt-1"
                  autoFocus
                />
                {error && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {error}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full bg-[#1E88E5] hover:bg-[#1565C0]" disabled={isLoading}>
                {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                Request Access
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>.
              </p>
              <div className="flex justify-center">
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="· · · · · ·"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                  className="w-44 text-center text-2xl font-bold tracking-[0.5em] px-3"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-destructive flex items-center justify-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {error}
                </p>
              )}
              <Button type="submit" className="w-full bg-[#1E88E5] hover:bg-[#1565C0]" disabled={isLoading}>
                {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                Verify
              </Button>
              <div className="text-center text-xs text-muted-foreground space-x-2">
                <button
                  type="button"
                  className="text-[#1E88E5] hover:underline"
                  onClick={() => { setOtp(""); setError(""); handleRequestAccess({ preventDefault: () => {} } as any); }}
                >
                  Resend code
                </button>
                <span>·</span>
                <button
                  type="button"
                  className="hover:underline"
                  onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                >
                  Change email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
