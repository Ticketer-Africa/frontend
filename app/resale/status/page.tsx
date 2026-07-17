"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HomeCard } from "@/components/home/home-card";
import { formatDate, formatPrice } from "@/lib/helpers";
import { useGuestResaleStatus } from "@/services/tickets/tickets.queries";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function GuestResaleStatusPage() {
  return (
    <Suspense
      fallback={
        <main
          className="home-theme min-h-screen px-4 py-10 pt-24"
          style={{ backgroundColor: "var(--home-bg)" }}
        >
          <p className="mx-auto max-w-xl text-sm" style={{ color: "var(--home-muted)" }}>
            Loading resale status...
          </p>
        </main>
      }
    >
      <GuestResaleStatusContent />
    </Suspense>
  );
}

function GuestResaleStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketCode = searchParams.get("ticketCode")?.trim() ?? "";
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const hasRequiredParams = ticketCode.length > 0 && isValidEmail(email);
  const [formTicketCode, setFormTicketCode] = useState(ticketCode);
  const [formEmail, setFormEmail] = useState(email);
  const { data, isLoading, error } = useGuestResaleStatus(
    { ticketCode, email },
    hasRequiredParams
  );

  useEffect(() => {
    setFormTicketCode(ticketCode);
    setFormEmail(email);
  }, [ticketCode, email]);

  const checkStatus = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTicketCode = formTicketCode.trim();
    const nextEmail = formEmail.trim().toLowerCase();
    if (!nextTicketCode || !isValidEmail(nextEmail)) return;
    router.push(
      `/resale/status?ticketCode=${encodeURIComponent(nextTicketCode)}&email=${encodeURIComponent(nextEmail)}`
    );
  };

  const eventName = data?.eventName ?? data?.event?.name ?? "Event";
  const eventDate = data?.eventDate ?? data?.event?.date;
  const category = data?.ticketCategory ?? data?.ticket?.ticketCategory?.name ?? "Ticket";
  const isListed = data?.isListed ?? data?.ticket?.isListed ?? false;
  const resalePrice = data?.resalePrice ?? data?.ticket?.resalePrice;
  const listedAt = data?.listedAt ?? data?.ticket?.listedAt;
  const isSold = data?.isSold ?? data?.ticket?.status === "RESOLD";

  return (
    <main
      className="home-theme min-h-screen px-4 py-10 pt-24"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <section className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold" style={{ color: "var(--home-text)" }}>
          Resale status
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--home-muted)" }}>
          Check the resale status of a ticket using the details from your order.
        </p>

        <HomeCard tone="card" className="mt-6 p-5">
          <form onSubmit={checkStatus} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--home-text)" }}>
                Ticket code
              </label>
              <Input
                value={formTicketCode}
                onChange={(event) => setFormTicketCode(event.target.value)}
                placeholder="TCK-ABC123"
                style={{
                  backgroundColor: "var(--home-bg)",
                  borderColor: "var(--home-border-strong)",
                  color: "var(--home-text)",
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--home-text)" }}>
                Purchase email
              </label>
              <Input
                type="email"
                value={formEmail}
                onChange={(event) => setFormEmail(event.target.value)}
                placeholder="owner@example.com"
                style={{
                  backgroundColor: "var(--home-bg)",
                  borderColor: "var(--home-border-strong)",
                  color: "var(--home-text)",
                }}
              />
            </div>
            <Button
              type="submit"
              variant="homeAccent"
              disabled={!formTicketCode.trim() || !isValidEmail(formEmail.trim())}
            >
              Check status
            </Button>
          </form>
        </HomeCard>

        {!hasRequiredParams && (
          <p className="mt-6 text-sm" style={{ color: "var(--home-muted)" }}>
            Enter a ticket code and purchase email to check resale status.
          </p>
        )}
        {isLoading && (
          <p className="mt-6 text-sm" style={{ color: "var(--home-muted)" }}>
            Loading resale status...
          </p>
        )}
        {error && (
          <p className="mt-6 text-sm text-red-400">
            Ticket not found or email does not match.
          </p>
        )}

        {data && !isLoading && !error && (
          <HomeCard tone="card" className="mt-6">
            <StatusRow label="Event" value={eventName} />
            {eventDate && <StatusRow label="Event date" value={formatDate(eventDate)} />}
            <StatusRow label="Ticket category" value={category} />
            <StatusRow label="Listing status" value={isListed ? "Listed" : "Not listed"} />
            {typeof resalePrice === "number" && <StatusRow label="Resale price" value={formatPrice(resalePrice)} />}
            {listedAt && <StatusRow label="Listed date" value={formatDate(listedAt)} />}
            <StatusRow label="Sold status" value={isSold ? "Sold" : "Not sold"} />
            {data.payoutStatus && <StatusRow label="Payout status" value={data.payoutStatus} />}
            {data.commissionStatus && <StatusRow label="Commission status" value={data.commissionStatus} />}
          </HomeCard>
        )}
      </section>
    </main>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between gap-6 px-5 py-4 border-t first:border-t-0"
      style={{ borderColor: "var(--home-border)" }}
    >
      <span className="text-sm" style={{ color: "var(--home-muted)" }}>{label}</span>
      <span className="text-right text-sm font-medium" style={{ color: "var(--home-text)" }}>{value}</span>
    </div>
  );
}
