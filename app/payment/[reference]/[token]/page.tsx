"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  Location01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { getPaymentStatus } from "@/services/payments/payment-status";
import { derivePaymentView, isFinalView } from "@/lib/payment-view";
import { formatDate, formatTime } from "@/lib/helpers";
import { TicketPass } from "./ticket-pass";

const POLL_MS = 2000;
const SUPPORT_EMAIL = "team@ticketer.africa";

/**
 * Korapay sends the buyer here after checkout. The page polls the backend,
 * which asks Korapay about the payment, and shows the tickets as soon as it
 * confirms.
 */
export default function PaymentStatusPage({
  params,
}: {
  params: { reference: string; token: string };
}) {
  const reference = decodeURIComponent(params.reference);
  const token = decodeURIComponent(params.token);
  const startedAt = useRef(Date.now());
  const [notFound, setNotFound] = useState(false);

  const { data } = useQuery({
    queryKey: ["payment-status", reference, token],
    queryFn: async () => {
      try {
        return await getPaymentStatus(reference, token);
      } catch (err: any) {
        if (err?.response?.status === 404) setNotFound(true);
        throw err;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      const view = derivePaymentView({
        status: query.state.data?.status,
        notFound: query.state.error ? (query.state.error as any)?.response?.status === 404 : false,
        elapsedMs: Date.now() - startedAt.current,
      });
      return isFinalView(view) ? false : POLL_MS;
    },
    // A failed poll (network blip, 5xx) keeps the last answer and tries again.
    refetchIntervalInBackground: true,
  });

  const view = derivePaymentView({
    status: data?.status,
    notFound,
    elapsedMs: Date.now() - startedAt.current,
  });
  const event = data?.event ?? null;

  return (
    <div className="home-theme min-h-screen pt-16" style={{ backgroundColor: "var(--home-bg)" }}>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        {(view === "confirming" || view === "slow") && (
          <StatusPanel
            icon={<HugeiconsIcon icon={Loading03Icon} className="w-10 h-10 animate-spin" style={{ color: "var(--home-accent)" }} />}
            title="Confirming your payment…"
            body="This usually takes a few seconds after your transfer goes through. Keep this page open."
            eventName={event?.name}
          >
            {view === "slow" && (
              <p className="mt-4 text-sm rounded-xl border p-4" style={{ color: "var(--home-text)", borderColor: "var(--home-border)", backgroundColor: "var(--home-card)" }}>
                Your bank is taking longer than usual. You can leave this page — we&apos;ll email your
                tickets as soon as the payment lands.
              </p>
            )}
          </StatusPanel>
        )}

        {view === "confirmed" && data && (
          <div>
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(66,167,59,0.12)" }}
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-9 h-9" style={{ color: "var(--home-success)" }} />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--home-text)" }}>
                Payment confirmed
              </h1>
              <p className="mt-1" style={{ color: "var(--home-muted)" }}>
                {data.tickets.length === 1 ? "Here's your ticket." : `Here are your ${data.tickets.length} tickets.`}
              </p>
            </div>

            {event && (
              <div className="rounded-2xl border p-5 mb-6" style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}>
                <h2 className="text-lg font-semibold" style={{ color: "var(--home-text)" }}>{event.name}</h2>
                {event.date && (
                  <p className="mt-2 flex items-center gap-2 text-sm" style={{ color: "var(--home-muted)" }}>
                    <HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4 shrink-0" />
                    {formatDate(event.date)} · {formatTime(event.date)}
                  </p>
                )}
                <p className="mt-1 flex items-center gap-2 text-sm" style={{ color: "var(--home-muted)" }}>
                  <HugeiconsIcon icon={Location01Icon} className="w-4 h-4 shrink-0" />
                  {event.isVirtual ? "Online event" : event.venue || "Venue to be announced"}
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {data.tickets.map((ticket, i) => (
                <TicketPass key={ticket.id} ticket={ticket} index={i} />
              ))}
            </div>

            <p className="mt-6 flex items-center justify-center gap-2 text-sm" style={{ color: "var(--home-muted)" }}>
              <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4" />
              We&apos;ve also emailed your tickets.
            </p>

            {event && (
              <div className="mt-6 flex justify-center">
                <Button asChild variant="outline">
                  <Link href={`/events/${event.slug}`}>Back to event</Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {view === "failed" && (
          <ProblemPanel
            title="Payment didn't go through"
            body="We didn't receive this payment, so no tickets were issued. If money left your account, email us with your payment reference."
            reference={reference}
          />
        )}

        {view === "gave-up" && (
          <ProblemPanel
            title="Still waiting for your bank"
            body="We haven't received confirmation yet. If your transfer went through, your tickets will arrive by email as soon as it lands."
            reference={reference}
          />
        )}

        {view === "invalid" && (
          <ProblemPanel
            title="We couldn't find this payment"
            body="This link is incomplete or has expired. Check your email for your tickets."
          />
        )}
      </div>
    </div>
  );
}

function StatusPanel({
  icon,
  title,
  body,
  eventName,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  eventName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12" role="status" aria-live="polite">
      <div className="flex justify-center mb-6">{icon}</div>
      {eventName && (
        <p className="text-sm mb-2" style={{ color: "var(--home-muted)" }}>{eventName}</p>
      )}
      <h1 className="text-2xl font-bold" style={{ color: "var(--home-text)" }}>{title}</h1>
      <p className="mt-2 max-w-md mx-auto" style={{ color: "var(--home-muted)" }}>{body}</p>
      <div className="max-w-md mx-auto">{children}</div>
    </div>
  );
}

function ProblemPanel({
  title,
  body,
  reference,
}: {
  title: string;
  body: string;
  reference?: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-6">
        <HugeiconsIcon icon={Alert02Icon} className="w-10 h-10" style={{ color: "var(--home-accent)" }} />
      </div>
      <h1 className="text-2xl font-bold" style={{ color: "var(--home-text)" }}>{title}</h1>
      <p className="mt-2 max-w-md mx-auto" style={{ color: "var(--home-muted)" }}>{body}</p>
      {reference && (
        <p className="mt-4 text-xs font-mono break-all" style={{ color: "var(--home-muted)" }}>
          Reference: {reference}
        </p>
      )}
      <p className="mt-4 text-sm" style={{ color: "var(--home-muted)" }}>
        Need help? Email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline" style={{ color: "var(--home-accent)" }}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      <div className="mt-8">
        <Button asChild variant="homeAccent">
          <Link href="/explore">Explore events</Link>
        </Button>
      </div>
    </div>
  );
}
