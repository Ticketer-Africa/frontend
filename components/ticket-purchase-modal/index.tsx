"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useBuyTicket } from "@/services/tickets/tickets.queries";
import { toast } from "sonner";
import { BuyTicketPayload } from "@/types/tickets.type";

import { TicketPurchaseModalProps, ModalStep, calculateCosts } from "./types";
import { QuantityStep } from "./quantity-step";
import { AuthStep } from "./auth-step";
import { PaymentStep } from "./payment-step";
import { SuccessStep } from "./success-step";

export function TicketPurchaseModal({
  event,
  ticketCategories,
  resaleTicket,
  isOpen,
  onClose,
  quantities,
  setQuantities,
}: TicketPurchaseModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<ModalStep>("quantity");
  const { mutateAsync: buyTicket, isPending: isBuying } = useBuyTicket();

  const { baseAmount, platformFee, gatewayFee, totalAmount } = calculateCosts(
    resaleTicket,
    ticketCategories,
    quantities,
    event.primaryFee,
  );

  const handleQuantityChange = (categoryId: string, delta: number) => {
    setQuantities((prev) => {
      const currentTotal = Object.values(prev).reduce(
        (sum, qty) => sum + qty,
        0,
      );
      const currentQty = prev[categoryId] || 0;
      const newQty = currentQty + delta;

      // Can't go below 0 (or 1 for resale)
      if (newQty < 0) return prev;
      if (resaleTicket && newQty < 1) return prev;

      // Can't exceed 10 per category or 10 total
      if (newQty > 10) {
        toast.error("Maximum 10 tickets per category");
        return prev;
      }
      if (currentTotal - currentQty + newQty > 10) {
        toast.error("Maximum 10 tickets per purchase");
        return prev;
      }

      return { ...prev, [categoryId]: newQty };
    });
  };

  const handleContinue = () => {
    if (!user) {
      setStep("auth");
    } else {
      setStep("payment");
    }
  };

  const handlePurchase = async () => {
    if (!ticketCategories && !resaleTicket) {
      toast.error("Please select a ticket category or resale ticket.");
      return;
    }

    const payload: BuyTicketPayload = resaleTicket
      ? {
          resaleTicketId: resaleTicket.id,
        }
      : {
          eventId: event.id,
          ticketCategories: ticketCategories
            ?.map((category) => ({
              ticketCategoryId: category.id,
              quantity: quantities[category.id] || 0,
            }))
            .filter((q) => q.quantity > 0),
        };

    try {
      const data = await buyTicket(payload);
      if (data?.checkoutUrl) {
        // Paid ticket - redirect to payment
        window.location.href = data.checkoutUrl;
      } else {
        // Free ticket - show success step
        setStep("success");
      }
    } catch (err: any) {
      console.error("Purchase failed:", err);
      toast.error(err.message || "Purchase failed. Try again.");
    }
  };

  const resetModal = () => {
    setStep("quantity");
    setQuantities({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={resetModal}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm modal-backdrop-animate"
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-y-auto modal-content-animate">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {step === "quantity" && "Select Tickets"}
            {step === "auth" && "Sign In Required"}
            {step === "payment" && "Payment Details"}
            {step === "success" && "Purchase Complete!"}
          </h2>
          <button
            onClick={resetModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {step === "quantity" && (
            <QuantityStep
              event={event}
              ticketCategories={ticketCategories}
              resaleTicket={resaleTicket}
              quantities={quantities}
              baseAmount={baseAmount}
              platformFee={platformFee}
              gatewayFee={gatewayFee}
              totalAmount={totalAmount}
              onQuantityChange={handleQuantityChange}
              onContinue={handleContinue}
            />
          )}

          {step === "auth" && <AuthStep />}

          {step === "payment" && (
            <PaymentStep
              event={event}
              resaleTicket={resaleTicket}
              quantities={quantities}
              baseAmount={baseAmount}
              platformFee={platformFee}
              gatewayFee={gatewayFee}
              totalAmount={totalAmount}
              isBuying={isBuying}
              onPurchase={handlePurchase}
            />
          )}

          {step === "success" && (
            <SuccessStep
              onViewTickets={() => (window.location.href = "/my-tickets")}
              onContinue={resetModal}
            />
          )}
        </div>
      </div>
    </div>
  );
}
