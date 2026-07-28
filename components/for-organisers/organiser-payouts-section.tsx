"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarCheckIcon, Wallet01Icon, BankIcon } from "@hugeicons/core-free-icons";

const STEPS = [
  {
    icon: CalendarCheckIcon,
    title: "Event ends",
    description: "Ticket sales close and your earnings sit in your wallet.",
  },
  {
    icon: Wallet01Icon,
    title: "Funds released as soon as needed",
    description: "No fixed schedule. Request a payout from your wallet whenever you need it.",
  },
  {
    icon: BankIcon,
    title: "Bank transfer",
    description: "Funds are sent straight to the bank account on file.",
  },
] as const;

/**
 * Static explainer only — no payout logic or live wallet data here.
 * Mirrors the copy already in the FAQ ("Payouts aren't on a fixed schedule...").
 */
export function OrganiserPayoutsSection() {
  return (
    <section
      className="home-theme py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <h2
            className="font-['Syne'] font-bold text-3xl sm:text-[40px] tracking-[-1.2px] mb-4"
            style={{ color: "var(--home-text-highlight)" }}
          >
            How payouts work
          </h2>
          <p
            className="font-['Hanken_Grotesk'] text-base leading-relaxed"
            style={{ color: "var(--home-muted)" }}
          >
            No fixed schedule, no waiting on a countdown. Your money moves
            when you ask for it.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
          <span
            className="hidden sm:block absolute top-6 left-[16.67%] right-[16.67%] h-px"
            style={{ backgroundColor: "var(--home-border-strong)" }}
            aria-hidden="true"
          />

          {STEPS.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-start sm:items-center sm:text-center">
              <div
                className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full border shrink-0"
                style={{ backgroundColor: "var(--home-bg)", borderColor: "var(--home-border-strong)" }}
              >
                <HugeiconsIcon
                  icon={step.icon}
                  className="w-5 h-5"
                  style={{ color: "var(--home-accent)" }}
                  aria-hidden="true"
                />
              </div>
              <p
                className="font-['Syne'] text-xs font-bold tracking-[2px] mt-4 mb-2"
                style={{ color: "var(--home-muted-dim)" }}
                aria-hidden="true"
              >
                STEP {index + 1}
              </p>
              <h3
                className="font-['Syne'] font-semibold text-xl mb-2"
                style={{ color: "var(--home-text)" }}
              >
                {step.title}
              </h3>
              <p
                className="font-['Hanken_Grotesk'] text-sm leading-relaxed max-w-xs"
                style={{ color: "var(--home-muted)" }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
