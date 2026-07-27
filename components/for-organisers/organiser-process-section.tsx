"use client";

import { memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { QrCode01Icon } from "@hugeicons/core-free-icons";
import { HomeCard } from "@/components/home/home-card";

const STEPS = [
  {
    step: "1",
    title: "Create your event",
    description:
      "Set up your event details, date, venue, ticket categories, pricing and attendee information.",
  },
  {
    step: "2",
    title: "Start selling",
    description:
      "Publish a beautiful event page and share the link with your audience. Guests can purchase tickets through a smooth checkout experience.",
  },
  {
    step: "3",
    title: "Manage your audience",
    description:
      "View orders, monitor ticket sales, communicate with attendees and keep track of the people coming to your event.",
  },
  {
    step: "4",
    title: "Check guests in",
    description:
      "Scan each attendee's QR code at the venue and validate tickets quickly without relying on printed guest lists.",
  },
] as const;

function StepVisualOne() {
  return (
    <HomeCard tone="elevated" radius="card-lg" className="p-6 w-full">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded-full" style={{ backgroundColor: "var(--home-border-strong)" }} />
        <div className="h-10 rounded-lg border" style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card)" }} />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 rounded-lg border" style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card)" }} />
          <div className="h-10 rounded-lg border" style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card)" }} />
        </div>
        <div className="flex gap-2 pt-1">
          {["Regular", "VIP", "+ Add"].map((label) => (
            <span
              key={label}
              className="px-3 py-1.5 rounded-full text-xs font-['Hanken_Grotesk'] font-semibold border"
              style={{
                borderColor: "var(--home-border-strong)",
                color: "var(--home-muted)",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </HomeCard>
  );
}

function StepVisualTwo() {
  return (
    <HomeCard tone="elevated" radius="card-lg" className="p-6 w-full">
      <div className="rounded-lg overflow-hidden border mb-3" style={{ borderColor: "var(--home-border)" }}>
        <div className="h-24" style={{ background: "linear-gradient(135deg, rgba(226,114,91,0.35), rgba(244,208,63,0.25))" }} />
      </div>
      <div className="h-3 w-32 rounded-full mb-2" style={{ backgroundColor: "var(--home-border-strong)" }} />
      <div className="h-3 w-20 rounded-full mb-4" style={{ backgroundColor: "var(--home-border)" }} />
      <div
        className="flex items-center justify-between rounded-full px-4 py-2 text-xs font-['Hanken_Grotesk'] font-semibold"
        style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
      >
        <span>Get Ticket</span>
        <span>₦5,000</span>
      </div>
    </HomeCard>
  );
}

function StepVisualThree() {
  const rows = [
    { name: "Ada O.", status: "Checked in" },
    { name: "Femi A.", status: "Paid" },
    { name: "Kemi T.", status: "Paid" },
  ];
  return (
    <HomeCard tone="elevated" radius="card-lg" className="p-6 w-full space-y-3">
      {rows.map((row) => (
        <div key={row.name} className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-['Hanken_Grotesk'] font-semibold"
            style={{ backgroundColor: "var(--home-card-highlight)", color: "var(--home-text)" }}
          >
            {row.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-['Hanken_Grotesk'] text-sm" style={{ color: "var(--home-text)" }}>
              {row.name}
            </p>
          </div>
          <span
            className="text-xs font-['Hanken_Grotesk'] font-semibold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: row.status === "Checked in" ? "var(--home-success)" : "var(--home-badge-bg)",
              color: row.status === "Checked in" ? "var(--home-success-fg)" : "var(--home-muted)",
            }}
          >
            {row.status}
          </span>
        </div>
      ))}
    </HomeCard>
  );
}

function StepVisualFour() {
  return (
    <HomeCard tone="elevated" radius="card-lg" className="p-8 w-full flex items-center justify-center">
      <div
        className="relative w-40 h-40 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: "var(--home-card)" }}
      >
        {(["tl", "tr", "bl", "br"] as const).map((corner) => (
          <span
            key={corner}
            className="absolute w-6 h-6 border-2 rounded-sm"
            style={{
              borderColor: "var(--home-success)",
              borderTopWidth: corner.includes("t") ? 2 : 0,
              borderBottomWidth: corner.includes("b") ? 2 : 0,
              borderLeftWidth: corner.includes("l") ? 2 : 0,
              borderRightWidth: corner.includes("r") ? 2 : 0,
              top: corner.includes("t") ? 8 : undefined,
              bottom: corner.includes("b") ? 8 : undefined,
              left: corner.includes("l") ? 8 : undefined,
              right: corner.includes("r") ? 8 : undefined,
            }}
          />
        ))}
        <HugeiconsIcon
          icon={QrCode01Icon}
          className="w-14 h-14"
          style={{ color: "var(--home-text)" }}
          aria-hidden="true"
        />
      </div>
    </HomeCard>
  );
}

const VISUALS = [StepVisualOne, StepVisualTwo, StepVisualThree, StepVisualFour];

interface StepRowProps {
  step: (typeof STEPS)[number];
  index: number;
}

const StepRow = memo(function StepRow({ step, index }: StepRowProps) {
  const Visual = VISUALS[index];
  const reverse = index % 2 === 1;

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div>
        <span
          className="block font-['Syne'] font-extrabold text-6xl sm:text-7xl leading-none mb-4 tracking-[-2px]"
          style={{ color: "var(--home-border-strong)" }}
          aria-hidden="true"
        >
          {step.step}
        </span>
        <h3
          className="font-['Syne'] font-bold text-2xl sm:text-[28px] mb-4 tracking-[-0.8px]"
          style={{ color: "var(--home-text)" }}
        >
          {step.title}
        </h3>
        <p
          className="font-['Hanken_Grotesk'] text-base leading-relaxed max-w-md"
          style={{ color: "var(--home-muted)" }}
        >
          {step.description}
        </p>
      </div>
      <Visual />
    </div>
  );
});

export function OrganiserProcessSection() {
  return (
    <section
      className="home-theme py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2
            className="font-['Syne'] font-bold text-3xl sm:text-[40px] tracking-[-1.2px] mb-4"
            style={{ color: "var(--home-text-highlight)" }}
          >
            From a blank page to a sold-out night
          </h2>
          <p
            className="font-['Hanken_Grotesk'] text-base max-w-2xl mx-auto"
            style={{ color: "var(--home-muted)" }}
          >
            Four stages, one platform. Set up your event, publish it, watch
            the orders come in, and check every guest through the door.
          </p>
        </div>

        <div className="space-y-20">
          {STEPS.map((step, index) => (
            <StepRow key={step.step} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
