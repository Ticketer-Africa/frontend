"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { PaymentStatusResponse } from "@/types/payment-status.type";

type Ticket = PaymentStatusResponse["tickets"][number];

/** One ticket with its scannable QR code. */
export function TicketPass({ ticket, index }: { ticket: Ticket; index: number }) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(ticket.qrValue, {
      width: 360,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
    })
      .then((url) => !cancelled && setQr(url))
      .catch(() => !cancelled && setQr(null));
    return () => {
      cancelled = true;
    };
  }, [ticket.qrValue]);

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col items-center gap-4"
      style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}
    >
      <div className="w-full flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--home-muted)" }}>
            Ticket {index + 1}
          </p>
          <p className="font-semibold truncate" style={{ color: "var(--home-text)" }}>
            {ticket.categoryName}
          </p>
          {ticket.recipientName && (
            <p className="text-sm truncate" style={{ color: "var(--home-muted)" }}>
              For {ticket.recipientName}
            </p>
          )}
        </div>
        <span
          className="shrink-0 rounded-md px-2 py-1 font-mono text-xs"
          style={{ backgroundColor: "var(--home-bg)", color: "var(--home-text)" }}
        >
          {ticket.code}
        </span>
      </div>

      <div className="bg-white rounded-xl p-2 w-full max-w-[240px] aspect-square flex items-center justify-center">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt={`QR code for ticket ${ticket.code}`} className="w-full h-full" />
        ) : (
          <div className="w-full h-full animate-pulse rounded-lg bg-neutral-200" />
        )}
      </div>

      <p className="text-xs text-center" style={{ color: "var(--home-muted)" }}>
        Show this QR code at the entrance.
      </p>
    </div>
  );
}
