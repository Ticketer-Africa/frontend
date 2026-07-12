"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatPrice } from "@/lib/helpers";
import { useGuestResaleStatus } from "@/services/tickets/tickets.queries";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function GuestResaleStatusPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-4 py-10">
          <p className="mx-auto max-w-xl text-sm text-gray-600">
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
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-gray-900">Resale status</h1>
        <p className="mt-2 text-sm text-gray-600">
          Check the resale status of a ticket using the details from your order.
        </p>

        <form onSubmit={checkStatus} className="mt-6 grid gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Ticket code</label>
            <Input value={formTicketCode} onChange={(event) => setFormTicketCode(event.target.value)} placeholder="TCK-ABC123" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Purchase email</label>
            <Input type="email" value={formEmail} onChange={(event) => setFormEmail(event.target.value)} placeholder="owner@example.com" />
          </div>
          <Button type="submit" className="bg-[#1E88E5] text-white hover:bg-blue-600" disabled={!formTicketCode.trim() || !isValidEmail(formEmail.trim())}>
            Check status
          </Button>
        </form>

        {!hasRequiredParams && (
          <p className="mt-6 text-sm text-gray-600">
            Enter a ticket code and purchase email to check resale status.
          </p>
        )}
        {isLoading && <p className="mt-6 text-sm text-gray-600">Loading resale status...</p>}
        {error && <p className="mt-6 text-sm text-red-600">Ticket not found or email does not match.</p>}

        {data && !isLoading && !error && (
          <div className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            <StatusRow label="Event" value={eventName} />
            {eventDate && <StatusRow label="Event date" value={formatDate(eventDate)} />}
            <StatusRow label="Ticket category" value={category} />
            <StatusRow label="Listing status" value={isListed ? "Listed" : "Not listed"} />
            {typeof resalePrice === "number" && <StatusRow label="Resale price" value={formatPrice(resalePrice)} />}
            {listedAt && <StatusRow label="Listed date" value={formatDate(listedAt)} />}
            <StatusRow label="Sold status" value={isSold ? "Sold" : "Not sold"} />
            {data.payoutStatus && <StatusRow label="Payout status" value={data.payoutStatus} />}
            {data.commissionStatus && <StatusRow label="Commission status" value={data.commissionStatus} />}
          </div>
        )}
      </section>
    </main>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-right text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
