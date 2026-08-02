"use client";

import { BuyResalePayload, TicketResale } from "@/types/tickets.type";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, formatPrice } from "@/lib/helpers";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Cancel01Icon, Location01Icon, Shield01Icon } from "@hugeicons/core-free-icons";

interface BuyResaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket: TicketResale | null;
  onConfirmBuy: (payload: BuyResalePayload) => void;
  isPending: boolean;
  isAuthenticated: boolean;
}

export function BuyResaleModal({
  isOpen,
  onClose,
  selectedTicket,
  onConfirmBuy,
  isPending,
  isAuthenticated,
}: BuyResaleModalProps) {
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmailError, setBuyerEmailError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setBuyerEmail("");
      setBuyerName("");
      setBuyerEmailError("");
    }
  }, [isOpen]);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSubmit = () => {
    if (!selectedTicket?.id) return;

    if (isAuthenticated) {
      onConfirmBuy({ ticketIds: [selectedTicket.id] });
      return;
    }

    if (!buyerEmail.trim()) {
      setBuyerEmailError("Email address is required");
      return;
    }

    if (!isValidEmail(buyerEmail)) {
      setBuyerEmailError("Enter a valid email address");
      return;
    }

    onConfirmBuy({
      ticketIds: [selectedTicket.id],
      buyerEmail: buyerEmail.trim().toLowerCase(),
      ...(buyerName.trim() ? { buyerName: buyerName.trim() } : {}),
    });
  };

  return (
    <div className="home-theme">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="max-w-lg shadow-lg rounded-xl bg-[var(--home-card)] border-[var(--home-border-strong)]"
      >
        {selectedTicket && (
          <div className="space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--home-text)" }}
              >
                Buy Resale Ticket
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{ color: "var(--home-muted)" }}
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
              </button>
            </div>

            {/* Event Details */}
            <div>
              <h3
                className="font-semibold text-lg"
                style={{ color: "var(--home-text)" }}
              >
                {selectedTicket.event.name}
              </h3>
              <div
                className="space-y-2 text-sm"
                style={{ color: "var(--home-muted)" }}
              >
                <div className="flex items-center space-x-2">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
                  <span>{formatDate(selectedTicket.event.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HugeiconsIcon icon={Location01Icon} className="h-4 w-4" />
                  <span>{selectedTicket.event.venueName}</span>
                </div>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label
                    htmlFor="resale-buyer-email"
                    className="text-sm font-medium"
                    style={{ color: "var(--home-text)" }}
                  >
                    Email address <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="resale-buyer-email"
                    type="email"
                    value={buyerEmail}
                    onChange={(event) => {
                      setBuyerEmail(event.target.value);
                      setBuyerEmailError("");
                    }}
                    placeholder="you@example.com"
                    disabled={isPending}
                    style={{
                      backgroundColor: "var(--home-bg)",
                      borderColor: "var(--home-border-strong)",
                      color: "var(--home-text)",
                    }}
                  />
                  {buyerEmailError && (
                    <p className="text-xs text-red-400">{buyerEmailError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--home-text)" }}
                  >
                    Name
                  </label>
                  <Input
                    value={buyerName}
                    onChange={(event) => setBuyerName(event.target.value)}
                    placeholder="Buyer name"
                    disabled={isPending}
                    style={{
                      backgroundColor: "var(--home-bg)",
                      borderColor: "var(--home-border-strong)",
                      color: "var(--home-text)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Seller Info */}
            <div
              className="flex items-center space-x-3 p-3 rounded-lg"
              style={{ backgroundColor: "var(--home-card-elevated)" }}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback
                  className="text-sm"
                  style={{
                    backgroundColor: "var(--home-card-highlight)",
                    color: "var(--home-text-highlight)",
                  }}
                >
                  {selectedTicket.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--home-text)" }}
                >
                  {selectedTicket.user.name}
                </div>
                <div className="text-xs" style={{ color: "var(--home-muted)" }}>
                  Verified seller
                </div>
              </div>
              <HugeiconsIcon icon={Shield01Icon}
                className="w-4 h-4"
                style={{ color: "var(--home-success)" }}
              />
            </div>

            {/* Price Details */}
            <div
              className="border rounded-lg p-4"
              style={{
                backgroundColor: "var(--home-card-elevated)",
                borderColor: "var(--home-border)",
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--home-muted)" }}>
                  Resale Price:
                </span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--home-text)" }}
                >
                  {formatPrice(selectedTicket.resalePrice ?? 0)}
                </span>
              </div>

              <div className="flex justify-between items-center mt-2 font-semibold">
                <span className="text-sm" style={{ color: "var(--home-text)" }}>
                  Total:
                </span>
                <span style={{ color: "var(--home-text)" }}>
                  {formatPrice(selectedTicket.resalePrice ?? 0)}
                </span>
              </div>
            </div>

            {/* Note */}
            <div
              className="border rounded-lg p-3"
              style={{
                backgroundColor: "var(--home-card-highlight)",
                borderColor: "var(--home-border)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--home-muted)" }}>
                <strong style={{ color: "var(--home-text)" }}>Note:</strong> By
                purchasing this ticket, you agree to the terms of service. Your
                ticket will be available after successful payment.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                variant="homeOutline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="homeAccent"
                className="flex-1"
                onClick={handleSubmit}
                disabled={isPending || !selectedTicket}
              >
                {isPending ? "Processing..." : "Buy Now"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
