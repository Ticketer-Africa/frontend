"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useBuyTicketsV2 } from "@/services/tickets/tickets-v2.queries";
import { useApplyDiscountCode } from "@/services/discounts/discounts.queries";
import { BuyTicketsV2Payload, RecipientV2 } from "@/types/tickets-v2.type";
import { DiscountDetailsResponse } from "@/services/discounts/discounts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventCustomField } from "@/types/events-v2.type";
import { toast } from "sonner";
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  Users,
  CheckCircle2,
  Ticket,
  ShoppingCart,
  Tag,
  X,
  ChevronRight,
  User,
  Mail,
  Sparkles,
} from "lucide-react";

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
  customFields?: EventCustomField[];
}

interface RecipientForm {
  [categoryId: string]: RecipientV2[];
}

interface DiscountState {
  appliedDiscount: DiscountDetailsResponse | null;
  isValidating: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { mutateAsync: buyTickets, isPending: isProcessing } = useBuyTicketsV2();
  const { mutateAsync: applyDiscount, isPending: isValidatingDiscount } = useApplyDiscountCode();

  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [dataChecked, setDataChecked] = useState(false);
  const [useMultipleRecipients, setUseMultipleRecipients] = useState(false);
  const [discountState, setDiscountState] = useState<DiscountState>({ appliedDiscount: null, isValidating: false });
  const [recipients, setRecipients] = useState<RecipientForm>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [discountCode, setDiscountCode] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [inviteSession, setInviteSession] = useState<{
    inviteToken?: string;
    guestName?: string;
    guestEmail?: string;
  } | null>(null);

  useEffect(() => {
    if (purchaseSuccess) {
      const timer = setTimeout(() => router.push("/explore"), 2500);
      return () => clearTimeout(timer);
    }
  }, [purchaseSuccess, router]);

  useEffect(() => {
    const data = sessionStorage.getItem("checkoutData");
    setDataChecked(true);
    if (!data) return;

    const parsed = JSON.parse(data) as CheckoutData;
    setCheckoutData(parsed);

    const inviteRaw = sessionStorage.getItem("inviteSession");
    let inv: { guestName?: string; guestEmail?: string; inviteToken?: string } | null = null;
    if (inviteRaw) {
      try {
        inv = JSON.parse(inviteRaw);
        setInviteSession(inv);
        if (inv?.guestEmail) setBuyerEmail(inv.guestEmail);
        if (inv?.guestName) setBuyerName(inv.guestName);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!checkoutData || !useMultipleRecipients) return;
    const recipientsByCategory: RecipientForm = {};
    checkoutData.tickets.forEach((ticket, idx) => {
      recipientsByCategory[ticket.ticketCategoryId] = Array(ticket.quantity)
        .fill(null)
        .map((_, i) =>
          idx === 0 && i === 0 && inviteSession?.guestName
            ? { recipientName: inviteSession.guestName ?? "", recipientEmail: inviteSession.guestEmail ?? "" }
            : { recipientName: "", recipientEmail: "" }
        );
    });
    setRecipients(recipientsByCategory);
  }, [useMultipleRecipients, checkoutData, inviteSession]);

  const validateEmail = useCallback((email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), []);

  const clearError = useCallback((key: string) => {
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleRecipientChange = useCallback(
    (categoryId: string, index: number, field: "recipientName" | "recipientEmail", value: string) => {
      setRecipients((prev) => {
        const updated = { ...prev };
        if (!updated[categoryId]) updated[categoryId] = [];
        if (!updated[categoryId][index]) updated[categoryId][index] = { recipientName: "", recipientEmail: "" };
        updated[categoryId][index] = { ...updated[categoryId][index], [field]: value };
        return updated;
      });
      clearError(`${categoryId}-${index}`);
    },
    [clearError]
  );

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!user && !buyerEmail.trim()) {
      errors["buyerEmail"] = "Email is required to complete your purchase";
    } else if (!user && buyerEmail.trim() && !validateEmail(buyerEmail)) {
      errors["buyerEmail"] = "Please enter a valid email address";
    }

    if (useMultipleRecipients) {
      Object.entries(recipients).forEach(([categoryId, list]) => {
        list.forEach((r, i) => {
          const key = `${categoryId}-${i}`;
          if (!r.recipientName.trim()) errors[key] = "Name is required";
          else if (!r.recipientEmail.trim()) errors[key] = "Email is required";
          else if (!validateEmail(r.recipientEmail)) errors[key] = "Invalid email address";
        });
      });
    }

    if (checkoutData?.customFields) {
      for (const field of checkoutData.customFields) {
        const val = customFieldValues[field.id]?.trim() ?? "";
        if (field.required && !val) errors[`cf-${field.id}`] = `${field.label} is required`;
        else if (field.fieldType === "EMAIL" && val && !validateEmail(val))
          errors[`cf-${field.id}`] = `${field.label} must be a valid email`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [user, buyerEmail, validateEmail, useMultipleRecipients, recipients, checkoutData, customFieldValues]);

  const handleApplyDiscount = useCallback(async () => {
    if (!discountCode.trim()) { toast.error("Please enter a discount code"); return; }
    if (!checkoutData) return;

    try {
      const totalAmount = checkoutData.tickets.reduce((s, t) => s + t.price * t.quantity, 0);
      const discount = await applyDiscount({
        code: discountCode,
        eventId: checkoutData.eventId,
        amount: totalAmount > 0 ? totalAmount : undefined,
      });
      setDiscountState({ appliedDiscount: discount, isValidating: false });
      toast.success(`Discount applied!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply discount code");
    }
  }, [discountCode, checkoutData, applyDiscount]);

  const handlePurchase = useCallback(async () => {
    if (!checkoutData) return;
    if (!validate()) {
      toast.error("Please fix the errors below before continuing");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BuyTicketsV2Payload = {
        eventId: checkoutData.eventId,
        ticketCategories: checkoutData.tickets.map((t) => ({
          ticketCategoryId: t.ticketCategoryId,
          quantity: t.quantity,
          ...(useMultipleRecipients && recipients[t.ticketCategoryId] && {
            recipients: recipients[t.ticketCategoryId],
          }),
        })),
        ...(!user && buyerEmail.trim() && { buyerEmail: buyerEmail.trim().toLowerCase() }),
        ...(!user && buyerName.trim() && { buyerName: buyerName.trim() }),
        ...(discountState.appliedDiscount && { discountCode: discountState.appliedDiscount.code }),
        ...(checkoutData.occurrenceId && { occurrenceId: checkoutData.occurrenceId }),
        ...(inviteSession?.inviteToken && { inviteToken: inviteSession.inviteToken }),
        ...(checkoutData.customFields?.length && {
          customFieldResponses: checkoutData.customFields.map((f) => ({
            fieldId: f.id,
            value: customFieldValues[f.id] ?? "",
          })),
        }),
      };

      const response = await buyTickets(payload);
      sessionStorage.removeItem("checkoutData");
      sessionStorage.removeItem("inviteSession");

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        setPurchaseSuccess(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Purchase failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    checkoutData, validate, useMultipleRecipients, recipients, user,
    buyerEmail, buyerName, discountState, inviteSession, customFieldValues, buyTickets,
  ]);

  // ── Loading state ──────────────────────────────────────────────
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

  // ── Computed values ────────────────────────────────────────────
  const totalQuantity = checkoutData.tickets.reduce((s, t) => s + t.quantity, 0);
  const subtotal = checkoutData.tickets.reduce((s, t) => s + t.price * t.quantity, 0);
  const discountAmount = discountState.appliedDiscount?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount);

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

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── LEFT: Main form ─────────────────────────────── */}
          <div className="space-y-6">

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

            {/* ── 2. Ticket Recipients (only for multi-ticket orders) ── */}
            {totalQuantity > 1 && (
              <Card className="overflow-hidden">
                <CardHeader className="border-b border-border bg-secondary/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      2
                    </div>
                    <CardTitle className="text-base">Ticket Recipients</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
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

                  {useMultipleRecipients && (
                    <div className="mt-6 space-y-6">
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <Users className="w-4 h-4 text-[#1E88E5] mt-0.5 shrink-0" />
                        <p className="text-xs text-[#1E88E5]">
                          Each ticket will be sent to the recipient's email address after purchase.
                        </p>
                      </div>

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
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── 3. Custom Fields ─────────────────────────── */}
            {checkoutData.customFields && checkoutData.customFields.length > 0 && (
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
                  {[...checkoutData.customFields]
                    .sort((a, b) => a.position - b.position)
                    .map((field) => {
                      const errKey = `cf-${field.id}`;
                      const hasError = !!validationErrors[errKey];
                      return (
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
                      );
                    })}
                </CardContent>
              </Card>
            )}

          </div>

          {/* ── RIGHT: Order Summary ─────────────────────────────── */}
          <div className="space-y-4 lg:sticky lg:top-[112px]">

            {/* Order summary card */}
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

            {/* What's next */}
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

          </div>
        </div>
      </div>
    </div>
  );
}
