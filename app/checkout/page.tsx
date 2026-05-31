/**
 * Checkout Page - Redesigned
 * Full-page checkout with recipient toggle and validation
 */

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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Loader,
  ArrowLeft,
  Users,
  CheckCircle,
  Ticket,
  ShoppingCart,
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
  [key: string]: RecipientV2[];
}

interface DiscountState {
  appliedDiscount: DiscountDetailsResponse | null;
  isValidating: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { mutateAsync: buyTickets, isPending: isProcessing } =
    useBuyTicketsV2();
  const { mutateAsync: applyDiscount, isPending: isValidatingDiscount } =
    useApplyDiscountCode();

  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [useMultipleRecipients, setUseMultipleRecipients] = useState(false);
  const [discountState, setDiscountState] = useState<DiscountState>({
    appliedDiscount: null,
    isValidating: false,
  });
  const [recipients, setRecipients] = useState<RecipientForm>({});
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [inviteSession, setInviteSession] = useState<{
    inviteToken?: string;
    guestName?: string;
    guestEmail?: string;
  } | null>(null);

  // Redirect to my-tickets after successful free ticket purchase
  useEffect(() => {
    if (purchaseSuccess) {
      const timer = setTimeout(() => {
        router.push("/my-tickets");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [purchaseSuccess, router]);
  const [discountCode, setDiscountCode] = useState("");

  // Load checkout data from session
  useEffect(() => {
    const data = sessionStorage.getItem("checkoutData");
    if (!data) {
      router.push("/explore");
      return;
    }

    const parsed = JSON.parse(data) as CheckoutData;
    setCheckoutData(parsed);

    // Load invite session if present
    const inviteRaw = sessionStorage.getItem("inviteSession");
    if (inviteRaw) {
      try {
        const inv = JSON.parse(inviteRaw);
        setInviteSession(inv);
      } catch {}
    }

    // Initialize recipients if multiple recipients is toggled
    if (useMultipleRecipients) {
      const recipientsByCategory: RecipientForm = {};
      // Parse invite pre-fill if available
      let invitePreFill: { recipientName: string; recipientEmail: string } | null = null;
      if (inviteRaw) {
        try {
          const inv = JSON.parse(inviteRaw);
          if (inv.guestName || inv.guestEmail) {
            invitePreFill = { recipientName: inv.guestName ?? "", recipientEmail: inv.guestEmail ?? "" };
          }
        } catch {}
      }
      parsed.tickets.forEach((ticket, idx) => {
        recipientsByCategory[ticket.ticketCategoryId] = Array(ticket.quantity)
          .fill(null)
          .map((_, i) =>
            idx === 0 && i === 0 && invitePreFill
              ? invitePreFill
              : { recipientName: "", recipientEmail: "" }
          );
      });
      setRecipients(recipientsByCategory);
    }
  }, [router, useMultipleRecipients]);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateRecipients = useCallback((): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (useMultipleRecipients) {
      Object.entries(recipients).forEach(([categoryId, recipientList]) => {
        recipientList.forEach((recipient, index) => {
          const fieldKey = `${categoryId}-${index}`;

          if (!recipient.recipientName.trim()) {
            errors[fieldKey] = "Name is required";
            isValid = false;
          }

          if (!recipient.recipientEmail.trim()) {
            errors[fieldKey] = "Email is required";
            isValid = false;
          } else if (!validateEmail(recipient.recipientEmail)) {
            errors[fieldKey] = "Invalid email format";
            isValid = false;
          }
        });
      });
    }

    setValidationErrors(errors);
    return isValid;
  }, [useMultipleRecipients, recipients, validateEmail]);

  const validateCustomFields = useCallback((): boolean => {
    if (!checkoutData?.customFields?.length) return true;
    const errors: { [key: string]: string } = {};
    let isValid = true;
    for (const field of checkoutData.customFields) {
      const value = customFieldValues[field.id]?.trim() ?? "";
      if (field.required && !value) {
        errors[`cf-${field.id}`] = `${field.label} is required`;
        isValid = false;
      } else if (field.fieldType === "EMAIL" && value && !validateEmail(value)) {
        errors[`cf-${field.id}`] = `${field.label} must be a valid email address`;
        isValid = false;
      }
    }
    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return isValid;
  }, [checkoutData, customFieldValues, validateEmail]);

  const handleRecipientChange = useCallback(
    (
      categoryId: string,
      index: number,
      field: "recipientName" | "recipientEmail",
      value: string,
    ) => {
      setRecipients((prev) => {
        const updated = { ...prev };
        if (!updated[categoryId]) {
          updated[categoryId] = [];
        }
        if (!updated[categoryId][index]) {
          updated[categoryId][index] = {
            recipientName: "",
            recipientEmail: "",
          };
        }
        updated[categoryId][index][field] = value;

        // Clear validation error on change
        const fieldKey = `${categoryId}-${index}`;
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldKey];
          return newErrors;
        });

        return updated;
      });
    },
    [],
  );

  const handleApplyDiscount = useCallback(async () => {
    if (!discountCode.trim()) {
      toast.error("Please enter a discount code");
      return;
    }

    if (!checkoutData) {
      toast.error("Checkout data is missing");
      return;
    }

    try {
      setDiscountState((prev) => ({ ...prev, isValidating: true }));

      // Calculate total amount from tickets
      const totalAmount = checkoutData.tickets.reduce((sum, ticket) => {
        return sum + ticket.price * ticket.quantity;
      }, 0);

      const discount = await applyDiscount({
        code: discountCode,
        eventId: checkoutData.eventId,
        amount: totalAmount > 0 ? totalAmount : undefined,
      });

      setDiscountState({
        appliedDiscount: discount,
        isValidating: false,
      });

      toast.success(
        `Discount applied! You save ${discount.discountAmount ? `₦${(discount.discountAmount / 100).toLocaleString()}` : `${discount.value}${discount.type === "PERCENT" ? "%" : " cents"}`}`,
      );
    } catch (error) {
      setDiscountState((prev) => ({ ...prev, isValidating: false }));
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to apply discount code",
      );
    }
  }, [discountCode, checkoutData, applyDiscount]);

  const handlePurchase = useCallback(async () => {
    if (!checkoutData) {
      toast.error("Checkout data is missing");
      return;
    }

    if (!validateCustomFields()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!validateRecipients()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
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

      const response = await buyTickets(payload);

      // Clear session data
      sessionStorage.removeItem("checkoutData");
      sessionStorage.removeItem("inviteSession");

      // Redirect to payment URL if available
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        // Fallback if no checkout URL
        setPurchaseSuccess(true);
      }
    } catch (error: any) {
      console.error("Purchase failed:", error);
      toast.error(error.message || "Purchase failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    checkoutData,
    validateRecipients,
    validateCustomFields,
    useMultipleRecipients,
    recipients,
    buyTickets,
    router,
    inviteSession,
    customFieldValues,
    discountState,
  ]);

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Loader className="w-8 h-8 animate-spin mx-auto text-[#1E88E5]" />
            <p className="text-center text-gray-600 mt-4">
              Loading checkout...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (purchaseSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">
              Tickets Claimed!
            </h2>
            <p className="text-center text-gray-600 mb-4">
              Your free tickets have been added to your account.
            </p>
            <Button
              onClick={() => router.push("/my-tickets")}
              className="w-full bg-[#1E88E5] hover:bg-blue-600"
            >
              View My Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuantity = checkoutData.tickets.reduce(
    (sum, t) => sum + t.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8 event-card-animate">
            <div className="flex items-center space-x-3 mb-2">
              <ShoppingCart className="h-8 w-8 text-[#1E88E5]" />
              <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
            </div>
            <p className="text-gray-600">{checkoutData.eventName}</p>
          </div>

          <div
            className={`grid ${totalQuantity > 1 ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"} gap-8`}
          >
            {/* Main Content */}
            <div
              className={`${totalQuantity > 1 ? "lg:col-span-2" : ""} space-y-8`}
            >
              {/* Recipients Toggle */}
              {totalQuantity > 1 && (
                <div className="event-card-animate">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ticket Recipients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        Send tickets to recipient(s) or keep them for yourself
                      </CardDescription>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useMultipleRecipients}
                          onChange={(e) =>
                            setUseMultipleRecipients(e.target.checked)
                          }
                          className="w-4 h-4 text-[#1E88E5] rounded"
                        />
                        <span className="text-foreground">
                          Send tickets to multiple recipients
                        </span>
                      </label>

                      {useMultipleRecipients && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex gap-2">
                            <Users className="w-5 h-5 text-[#1E88E5] flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-[#1E88E5]">
                              Enter the name and email for each ticket recipient
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Recipients Forms */}
              {useMultipleRecipients && (
                <div className="space-y-6">
                  {checkoutData.tickets.map((ticket, ticketIndex) => (
                    <div
                      key={ticket.ticketCategoryId}
                      className={`event-card-animate ${
                        ticketIndex === 0
                          ? "event-card-delay-1"
                          : "event-card-delay-2"
                      }`}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base font-normal">
                            <span className="font-semibold text-foreground">
                              {ticket.ticketCategoryName}
                            </span>
                          </CardTitle>
                          <CardDescription>
                            {ticket.quantity} ticket
                            {ticket.quantity > 1 ? "s" : ""}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {Array(ticket.quantity)
                            .fill(null)
                            .map((_, index) => {
                              const fieldKey = `${ticket.ticketCategoryId}-${index}`;
                              const error = validationErrors[fieldKey];
                              const recipient = recipients[
                                ticket.ticketCategoryId
                              ]?.[index] || {
                                name: "",
                                email: "",
                              };

                              return (
                                <div
                                  key={index}
                                  className={`p-4 border rounded-lg ${
                                    error
                                      ? "border-destructive bg-destructive/10"
                                      : "bg-secondary"
                                  }`}
                                >
                                  <p className="text-sm font-medium text-foreground mb-3">
                                    Ticket {index + 1}
                                  </p>

                                  <div className="space-y-3">
                                    <div>
                                      <Label htmlFor={`name-${fieldKey}`}>
                                        Recipient Name
                                      </Label>
                                      <Input
                                        id={`name-${fieldKey}`}
                                        placeholder="Full name"
                                        value={recipient.recipientName}
                                        onChange={(e) =>
                                          handleRecipientChange(
                                            ticket.ticketCategoryId,
                                            index,
                                            "recipientName",
                                            e.target.value,
                                          )
                                        }
                                        className={
                                          error
                                            ? "border-destructive focus:border-destructive"
                                            : ""
                                        }
                                      />
                                    </div>

                                    <div>
                                      <Label htmlFor={`email-${fieldKey}`}>
                                        Email Address
                                      </Label>
                                      <Input
                                        id={`email-${fieldKey}`}
                                        type="email"
                                        placeholder="Email address"
                                        value={recipient.recipientEmail}
                                        onChange={(e) =>
                                          handleRecipientChange(
                                            ticket.ticketCategoryId,
                                            index,
                                            "recipientEmail",
                                            e.target.value,
                                          )
                                        }
                                        className={
                                          error
                                            ? "border-destructive focus:border-destructive"
                                            : ""
                                        }
                                      />
                                    </div>

                                    {error && (
                                      <div className="flex gap-2 text-destructive text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{error}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="event-sidebar-animate">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">
                        {checkoutData.eventName}
                      </h3>

                      {checkoutData.tickets.map((ticket, idx) => {
                        const subtotal = ticket.price * ticket.quantity;
                        return (
                          <div
                            key={idx}
                            className="space-y-1 py-2 border-b border-border"
                          >
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {ticket.ticketCategoryName}
                              </span>
                              <span className="font-medium">
                                ₦{ticket.price.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Qty: {ticket.quantity}</span>
                              <span>₦{subtotal.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex justify-between text-base font-bold pt-4 mt-4 border-t border-border">
                        <span>Subtotal</span>
                        <span>
                          ₦
                          {checkoutData.tickets
                            .reduce(
                              (sum, ticket) =>
                                sum + ticket.price * ticket.quantity,
                              0,
                            )
                            .toLocaleString()}
                        </span>
                      </div>

                      {discountState.appliedDiscount &&
                        discountState.appliedDiscount.discountAmount && (
                          <div className="flex justify-between text-sm pt-2 text-green-600">
                            <span>Discount</span>
                            <span>
                              -₦
                              {discountState.appliedDiscount.discountAmount.toLocaleString()}
                            </span>
                          </div>
                        )}

                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-border mt-2">
                        <span>Total</span>
                        <span>
                          ₦
                          {(
                            checkoutData.tickets.reduce(
                              (sum, ticket) =>
                                sum + ticket.price * ticket.quantity,
                              0,
                            ) -
                            (discountState.appliedDiscount?.discountAmount || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Discount Code */}
                    <div>
                      <Label
                        htmlFor="discount-code"
                        className="text-sm font-medium text-foreground mb-2"
                      >
                        Discount Code (Optional)
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="discount-code"
                          type="text"
                          placeholder="Enter discount code"
                          value={discountCode}
                          onChange={(e) =>
                            setDiscountCode(e.target.value.toUpperCase())
                          }
                          disabled={!!discountState.appliedDiscount}
                          className="flex-1 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent disabled:opacity-50"
                        />
                        {!discountState.appliedDiscount && (
                          <Button
                            variant="outline"
                            onClick={handleApplyDiscount}
                            disabled={isValidatingDiscount}
                            className="px-4 border-gray-200 hover:bg-gray-50 rounded-lg hover:border-[#1E88E5] transition-colors"
                          >
                            {isValidatingDiscount ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              "Apply"
                            )}
                          </Button>
                        )}
                        {discountState.appliedDiscount && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDiscountState({
                                appliedDiscount: null,
                                isValidating: false,
                              });
                              setDiscountCode("");
                            }}
                            className="px-4 border-gray-200 hover:bg-gray-50 rounded-lg transition-colors text-red-500"
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      {/* Applied Discount Info */}
                      {discountState.appliedDiscount && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-medium text-green-700">
                            ✓ {discountState.appliedDiscount.code} applied
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {discountState.appliedDiscount.type === "PERCENT"
                              ? `${discountState.appliedDiscount.value}% discount`
                              : `₦${(discountState.appliedDiscount.value / 100).toLocaleString()} off`}
                          </p>
                          {discountState.appliedDiscount.discountAmount && (
                            <p className="text-xs text-green-600 font-semibold mt-1">
                              You save: ₦
                              {discountState.appliedDiscount.discountAmount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Purchase Button */}
                    <Button
                      onClick={handlePurchase}
                      disabled={isSubmitting || isProcessing}
                      size="lg"
                      className="w-full"
                    >
                      {isSubmitting || isProcessing ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Complete Purchase</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Purchase Info */}
              <div className="event-sidebar-animate event-sidebar-delay-1">
                <Card>
                  <CardHeader>
                    <CardTitle>What's Next?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Ticket className="h-4 w-4 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Instant Access</p>
                        <p className="text-xs text-gray-600">
                          Your tickets will be available immediately after
                          purchase
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          Email Confirmation
                        </p>
                        <p className="text-xs text-gray-600">
                          Confirmation sent to your registered email
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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
