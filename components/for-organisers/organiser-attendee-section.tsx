"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Ticket01Icon,
  CreditCardIcon,
  QrCode01Icon,
  ScanIcon,
} from "@hugeicons/core-free-icons";
import { HomeCard } from "@/components/home/home-card";

const ATTENDEE_STEPS = [
  { icon: Search01Icon, label: "Discovers the event page" },
  { icon: Ticket01Icon, label: "Selects a ticket type" },
  { icon: CreditCardIcon, label: "Completes secure payment" },
  { icon: QrCode01Icon, label: "Receives their ticket & QR code" },
  { icon: ScanIcon, label: "Presents it at check-in" },
] as const;

export function OrganiserAttendeeSection() {
  return (
    <section
      className="home-theme py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <div>
            <h2
              className="font-['Syne'] font-bold text-3xl sm:text-[40px] tracking-[-1.2px] mb-4"
              style={{ color: "var(--home-text-highlight)" }}
            >
              One connected experience for your guests
            </h2>
            <p
              className="font-['Hanken_Grotesk'] text-base leading-relaxed max-w-lg"
              style={{ color: "var(--home-muted)" }}
            >
              A smooth guest experience means more completed checkouts and
              fewer support messages for you on event day.
            </p>
          </div>

          <HomeCard
            tone="elevated"
            radius="card-lg"
            className="overflow-hidden p-2 sm:p-3 shadow-2xl"
            style={{ borderColor: "var(--home-border-strong)" }}
          >
            <div
              className="rounded-[16px] overflow-hidden border"
              style={{ borderColor: "var(--home-border)" }}
            >
              <Image
                src="/for-organisers/event-crowd.jpg"
                alt="Attendees enjoying a live event ticketed through Ticketer Africa"
                width={1400}
                height={933}
                className="w-full h-auto"
                loading="lazy"
                sizes="(min-width: 1024px) 560px, 100vw"
              />
            </div>
          </HomeCard>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-5">
          {ATTENDEE_STEPS.map(({ icon, label }, index) => (
            <li
              key={label}
              className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3 py-5 sm:py-0 sm:px-5 border-t sm:border-t-0 sm:border-l first:border-t-0 first:sm:border-l-0"
              style={{ borderColor: "var(--home-border)" }}
            >
              <HugeiconsIcon
                icon={icon}
                className="w-5 h-5 flex-shrink-0"
                style={{ color: "var(--home-accent)" }}
                aria-hidden="true"
              />
              <span
                className="font-['Hanken_Grotesk'] text-sm leading-snug"
                style={{ color: "var(--home-text)" }}
              >
                <span className="sr-only">Step {index + 1}: </span>
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
