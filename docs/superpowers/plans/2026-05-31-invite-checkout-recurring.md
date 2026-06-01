# Invite Flows, Custom Fields & Recurring Occurrences — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add shareable invite OTP flow, personal invite token resolution, custom field responses at checkout, and recurring occurrence selector on the event page.

**Architecture:** Types are updated first so all downstream tasks compile. Each feature is self-contained: new pages use direct axios calls following existing patterns; existing pages are extended with new UI sections and sessionStorage fields. The `checkoutData` sessionStorage object is the data bus between the event page and checkout.

**Tech Stack:** Next.js App Router, React, TypeScript, shadcn/ui, Tailwind CSS, axios, React Query (existing), Framer Motion (not needed here), sonner (toasts).

**Spec:** `docs/superpowers/specs/2026-05-31-invite-checkout-recurring-design.md`

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Modify | `types/tickets-v2.type.ts` | Add `inviteToken`, `occurrenceId`, `customFieldResponses`, `CustomFieldResponse` |
| Create | `app/invite/shareable/page.tsx` | 3-step OTP flow for shareable invite links |
| Modify | `app/invite/page.tsx` | Add `?i=` personal invite token branch |
| Modify | `app/events/[slug]/page.tsx` | Occurrence pill-chip selector, pass `occurrenceId` + `customFields` to sessionStorage |
| Modify | `app/checkout/page.tsx` | Custom fields card, inviteToken pre-fill, occurrenceId in payload |

---

## Task 1: Update shared types

**Files:**
- Modify: `types/tickets-v2.type.ts`

- [ ] **Step 1: Add `CustomFieldResponse` interface and extend `BuyTicketsV2Payload`**

Open `types/tickets-v2.type.ts` and replace the existing content with:

```ts
export interface RecipientV2 {
  recipientName: string;
  recipientEmail: string;
}

export interface TicketPurchaseItemV2 {
  ticketCategoryId: string;
  quantity: number;
  recipients?: RecipientV2[];
}

export interface CustomFieldResponse {
  customFieldId: string;
  value: string;
}

export interface BuyTicketsV2Payload {
  eventId: string;
  ticketCategories: TicketPurchaseItemV2[];
  discountCode?: string;
  inviteToken?: string;
  occurrenceId?: string;
  customFieldResponses?: CustomFieldResponse[];
}

export interface BuyTicketsV2Response {
  success: boolean;
  message: string;
  transactionId?: string;
  checkoutUrl?: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only pre-existing errors unrelated to tickets-v2.type.ts).

- [ ] **Step 3: Commit**

```bash
git add types/tickets-v2.type.ts
git commit -m "feat: extend BuyTicketsV2Payload with inviteToken, occurrenceId, customFieldResponses"
```

---

## Task 2: Shareable invite OTP page

**Files:**
- Create: `app/invite/shareable/page.tsx`

- [ ] **Step 1: Create the file with imports and types**

Create `app/invite/shareable/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "@/services/axios";
import { buildEndpoint } from "@/services/api-config";
import { useEventBySlugV2 } from "@/services/events/events-v2.queries";

type Step = "email" | "otp";

const API_VERSION = "v2";
```

- [ ] **Step 2: Add the component with param validation and event fetch**

Append to `app/invite/shareable/page.tsx`:

```tsx
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
```

- [ ] **Step 3: Add the requestAccess handler**

Append to the component (before the closing brace):

```tsx
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
```

- [ ] **Step 4: Add the verifyOtp handler**

Append to the component (before the closing brace):

```tsx
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
```

- [ ] **Step 5: Add the render — hero card wrapper**

Append to the component (before the final closing brace):

```tsx
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
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add app/invite/shareable/page.tsx
git commit -m "feat: add shareable invite OTP flow page"
```

---

## Task 3: Personal invite token resolution

**Files:**
- Modify: `app/invite/page.tsx`

- [ ] **Step 1: Read the current file**

Read `app/invite/page.tsx` to understand the current structure before editing.

- [ ] **Step 2: Add the `?i=` branch**

At the top of `InviteAcceptancePage`, extend the existing state and `useEffect` to detect `?i=` and call the resolve endpoint. Replace the existing `useEffect` and top of component with:

```tsx
  const inviteToken = searchParams.get("i");
  const inviteId = searchParams.get("inviteId");
  const email = searchParams.get("email");

  useEffect(() => {
    if (inviteToken) {
      resolvePersonalInvite(inviteToken);
      return;
    }
    if (!inviteId || !email) {
      setStatus("invalid");
      setMessage("Invalid invitation link. Missing required parameters.");
      return;
    }
    acceptInvite(inviteId, decodeURIComponent(email));
  }, [inviteToken, inviteId, email]);
```

- [ ] **Step 3: Add `resolvePersonalInvite` function**

Add this function inside the component, before `acceptInvite`:

```tsx
  const resolvePersonalInvite = async (token: string) => {
    try {
      setStatus("loading");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://api.ticketer.africa"}/api/v2/events/invite/resolve?i=${encodeURIComponent(token)}`,
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to resolve invite");
      }
      const data = await response.json();
      // Store invite context for checkout to pick up
      sessionStorage.setItem(
        "inviteSession",
        JSON.stringify({
          inviteToken: token,
          guestName: data.invitee?.name ?? "",
          guestEmail: data.invitee?.email ?? "",
        }),
      );
      // Navigate to the event page so user can select tickets
      const slug = data.event?.slug;
      if (slug) {
        window.location.href = `/events/${slug}`;
      } else {
        setStatus("error");
        setMessage("Could not determine event from this invite link.");
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to resolve invite.",
      );
    }
  };
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add app/invite/page.tsx
git commit -m "feat: resolve personal invite token and store inviteSession in sessionStorage"
```

---

## Task 4: Occurrence selector on event page

**Files:**
- Modify: `app/events/[slug]/page.tsx`

- [ ] **Step 1: Add `selectedOccurrenceId` state**

In the `EventPage` component, add alongside the existing state declarations:

```tsx
const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string | null>(null);
```

- [ ] **Step 2: Gate checkout on occurrence selection**

In `handleCheckout`, add a guard after the `selected.size === 0` check:

```tsx
    const isRecurring = event.isRecurring && (event.occurrences?.length ?? 0) > 0;
    if (isRecurring && !selectedOccurrenceId) {
      toast.error("Please select a date to continue");
      return;
    }
```

- [ ] **Step 3: Pass `occurrenceId` and `customFields` into sessionStorage**

Still in `handleCheckout`, update the `sessionStorage.setItem` call:

```tsx
    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify({
        eventId: event!.id,
        eventName: event!.name,
        tickets: checkoutItems,
        occurrenceId: selectedOccurrenceId ?? undefined,
        customFields: event!.customFields ?? [],
      }),
    );
```

- [ ] **Step 4: Add the `OccurrenceSelector` component at the bottom of the file**

Append before the `LoadingSkeleton` function:

```tsx
function OccurrenceSelector({
  occurrences,
  selectedId,
  onSelect,
}: {
  occurrences: import("@/types/events-v2.type").EventOccurrence[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const active = occurrences.filter((o) => o.isActive);
  if (!active.length) return null;

  return (
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
  );
}
```

- [ ] **Step 5: Render `OccurrenceSelector` and gate ticket cards**

Inside the JSX where ticket cards are rendered (the `<div className="p-5 space-y-4">` section), add the occurrence selector above the ticket list and conditional gating:

```tsx
                  <div className="p-5 space-y-4">
                    {event.isRecurring && (event.occurrences?.length ?? 0) > 0 && (
                      <OccurrenceSelector
                        occurrences={event.occurrences!}
                        selectedId={selectedOccurrenceId}
                        onSelect={setSelectedOccurrenceId}
                      />
                    )}

                    <div
                      className={cn(
                        "space-y-4 transition-all duration-200",
                        event.isRecurring && !selectedOccurrenceId
                          ? "opacity-40 blur-[1px] pointer-events-none"
                          : "",
                      )}
                    >
                      {event.ticketCategories?.length ? (
                        event.ticketCategories.map((cat) => (
                          <TicketCategoryCardV2
                            key={cat.id}
                            category={cat}
                            isSelected={selected.has(cat.id)}
                            quantity={quantities[cat.id] ?? 0}
                            onToggle={() => toggleCategory(cat)}
                            onQuantityChange={(delta: number) =>
                              updateQuantity(cat.id, (q) => q + delta)
                            }
                            feeMode={event.feeMode}
                            primaryFeeBps={event.primaryFeeBps}
                          />
                        ))
                      ) : (
                        <div className="py-10 text-center text-muted-foreground">
                          No tickets available yet
                        </div>
                      )}
                    </div>
                  </div>
```

Note: this replaces the existing `<div className="p-5 space-y-4">` block — make sure to remove the old one.

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 7: Commit**

```bash
git add app/events/\[slug\]/page.tsx
git commit -m "feat: add occurrence pill-chip selector with ticket gating on event page"
```

---

## Task 5: Custom fields + invite pre-fill at checkout

**Files:**
- Modify: `app/checkout/page.tsx`

- [ ] **Step 1: Extend `CheckoutData` interface**

In `app/checkout/page.tsx`, update the `CheckoutData` interface:

```tsx
interface CheckoutData {
  eventId: string;
  eventName: string;
  tickets: Array<{
    ticketCategoryId: string;
    ticketCategoryName: string;
    quantity: number;
    price: number;
  }>;
  occurrenceId?: string;
  customFields?: import("@/types/events-v2.type").EventCustomField[];
}
```

- [ ] **Step 2: Add custom field state and invite session state**

Add alongside existing state declarations:

```tsx
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [inviteSession, setInviteSession] = useState<{
    inviteToken?: string;
    guestName?: string;
    guestEmail?: string;
  } | null>(null);
```

- [ ] **Step 3: Load inviteSession in the existing `useEffect`**

Inside the existing `useEffect` that loads checkout data, after `setCheckoutData(parsed)`:

```tsx
    // Load invite session if present
    const inviteRaw = sessionStorage.getItem("inviteSession");
    if (inviteRaw) {
      try {
        setInviteSession(JSON.parse(inviteRaw));
      } catch {}
    }
```

- [ ] **Step 4: Pre-fill first recipient from inviteSession**

Still in the same `useEffect`, after setting `inviteSession`, add:

```tsx
    // Pre-fill first recipient from personal invite
    if (inviteRaw) {
      const inv = JSON.parse(inviteRaw);
      if (inv.guestName || inv.guestEmail) {
        const firstCategoryId = parsed.tickets[0]?.ticketCategoryId;
        if (firstCategoryId) {
          setRecipients((prev) => ({
            ...prev,
            [firstCategoryId]: [
              {
                recipientName: inv.guestName ?? "",
                recipientEmail: inv.guestEmail ?? "",
              },
            ],
          }));
        }
      }
    }
```

- [ ] **Step 5: Add `validateCustomFields` function**

Add this callback alongside `validateRecipients`:

```tsx
  const validateCustomFields = useCallback((): boolean => {
    if (!checkoutData?.customFields?.length) return true;
    const errors: { [key: string]: string } = {};
    let isValid = true;
    for (const field of checkoutData.customFields) {
      if (field.required && !customFieldValues[field.id]?.trim()) {
        errors[`cf-${field.id}`] = `${field.label} is required`;
        isValid = false;
      }
    }
    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return isValid;
  }, [checkoutData, customFieldValues]);
```

- [ ] **Step 6: Call `validateCustomFields` in `handlePurchase`**

In `handlePurchase`, add before `validateRecipients()`:

```tsx
    if (!validateCustomFields()) {
      toast.error("Please fill in all required fields");
      return;
    }
```

- [ ] **Step 7: Add `customFieldResponses`, `inviteToken`, and `occurrenceId` to the payload**

In `handlePurchase`, extend the `BuyTicketsV2Payload` object:

```tsx
      const payload: BuyTicketsV2Payload = {
        eventId: checkoutData.eventId,
        ticketCategories: checkoutData.tickets.map((ticket) => ({
          ticketCategoryId: ticket.ticketCategoryId,
          quantity: ticket.quantity,
          ...(useMultipleRecipients &&
            recipients[ticket.ticketCategoryId] && {
              recipients: recipients[ticket.ticketCategoryId],
            }),
        })),
        ...(discountState.appliedDiscount && {
          discountCode: discountState.appliedDiscount.code,
        }),
        ...(checkoutData.occurrenceId && { occurrenceId: checkoutData.occurrenceId }),
        ...(inviteSession?.inviteToken && { inviteToken: inviteSession.inviteToken }),
        ...(checkoutData.customFields?.length && {
          customFieldResponses: checkoutData.customFields.map((f) => ({
            customFieldId: f.id,
            value: customFieldValues[f.id] ?? "",
          })),
        }),
      };
```

- [ ] **Step 8: Clear inviteSession on successful purchase**

After `sessionStorage.removeItem("checkoutData")` add:

```tsx
      sessionStorage.removeItem("inviteSession");
```

- [ ] **Step 9: Add the `CustomFieldsCard` component**

Add as a new component at the bottom of `app/checkout/page.tsx` (before the export):

```tsx
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventCustomField } from "@/types/events-v2.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CustomFieldsCard({
  fields,
  values,
  errors,
  onChange,
}: {
  fields: EventCustomField[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (id: string, value: string) => void;
}) {
  const sorted = [...fields].sort((a, b) => a.position - b.position);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.map((field) => {
          const errorKey = `cf-${field.id}`;
          const hasError = !!errors[errorKey];
          return (
            <div key={field.id}>
              <Label htmlFor={`cf-${field.id}`}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.fieldType === "TEXTAREA" ? (
                <Textarea
                  id={`cf-${field.id}`}
                  value={values[field.id] ?? ""}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className={`mt-1 ${hasError ? "border-destructive" : ""}`}
                />
              ) : field.fieldType === "SELECT" ? (
                <Select
                  value={values[field.id] ?? ""}
                  onValueChange={(v) => onChange(field.id, v)}
                >
                  <SelectTrigger className={`mt-1 ${hasError ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={`cf-${field.id}`}
                  type={
                    field.fieldType === "EMAIL"
                      ? "email"
                      : field.fieldType === "NUMBER"
                      ? "number"
                      : "text"
                  }
                  value={values[field.id] ?? ""}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className={`mt-1 ${hasError ? "border-destructive" : ""}`}
                />
              )}
              {hasError && (
                <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors[errorKey]}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

Note: move the `Textarea`, `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue`, and `EventCustomField` imports to the top of the file with the other imports.

- [ ] **Step 10: Render `CustomFieldsCard` in the checkout JSX**

In the main checkout JSX, after the recipients cards section and before the sidebar, add:

```tsx
              {/* Custom Fields */}
              {checkoutData.customFields && checkoutData.customFields.length > 0 && (
                <div className="event-card-animate">
                  <CustomFieldsCard
                    fields={checkoutData.customFields}
                    values={customFieldValues}
                    errors={validationErrors}
                    onChange={(id, value) => {
                      setCustomFieldValues((prev) => ({ ...prev, [id]: value }));
                      setValidationErrors((prev) => {
                        const next = { ...prev };
                        delete next[`cf-${id}`];
                        return next;
                      });
                    }}
                  />
                </div>
              )}
```

- [ ] **Step 11: Verify TypeScript compiles**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 12: Commit**

```bash
git add app/checkout/page.tsx
git commit -m "feat: add custom fields card, invite pre-fill, and occurrenceId at checkout"
```

---

## Task 6: Smoke-test the full flows

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend && npm run dev
```

- [ ] **Step 2: Test shareable invite flow**

Navigate to `http://localhost:3000/invite/shareable?s=TEST_TOKEN&eventSlug=test-event`. Verify:
- Hero card renders with event name (or "Loading…" then name)
- Submitting an email transitions to OTP step with email shown
- Entering wrong OTP shows inline error (no toast)
- "Change email" returns to step 1

- [ ] **Step 3: Test occurrence selector**

Navigate to any event page where `isRecurring: true` (or mock it by temporarily hardcoding). Verify:
- Pill chips render above tickets
- Tickets are blurred/disabled before a chip is selected
- Selecting a chip enables tickets
- Checking out without a chip shows toast error "Please select a date to continue"

- [ ] **Step 4: Test custom fields**

Add `customFields` to a `checkoutData` object in sessionStorage manually (via DevTools) and navigate to `/checkout`. Verify:
- "Additional Info" card renders
- Required fields show `*`
- Submitting without required fields shows inline errors
- Submitting with all fields filled proceeds normally

- [ ] **Step 5: Test personal invite `?i=` flow**

Navigate to `http://localhost:3000/invite?i=TEST_TOKEN`. Verify:
- Loading state shows
- On error, error state shows (since TEST_TOKEN is invalid)
- On success (real token), redirects to event page

- [ ] **Step 6: Final commit (if any fixups needed)**

```bash
git add -p
git commit -m "fix: smoke test fixups"
```
