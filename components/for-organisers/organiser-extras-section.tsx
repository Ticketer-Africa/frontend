"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  CheckmarkCircle02Icon,
  CloudIcon,
  ScanIcon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import { HomeCard } from "@/components/home/home-card";

const EXTRAS = [
  {
    icon: ScanIcon,
    title: "On-site scanning",
    description: "Our team can handle ticket scanning and guest check-in at your venue.",
  },
  {
    icon: Tag01Icon,
    title: "Hand tags",
    description: "Need wristbands or hand tags for your guests? We can help arrange them.",
  },
  {
    icon: CloudIcon,
    title: "Canopies & event setup",
    description: "Ask us about canopies, event equipment and other practical venue support.",
  },
  {
    icon: CheckmarkCircle02Icon,
    title: "A tailored package",
    description: "From one extra to full event support, tell us what your event needs.",
  },
] as const;

export function OrganiserExtrasSection() {
  return (
    <section
      className="home-theme px-4 py-14 sm:py-20 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-card)" }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
        <div className="lg:sticky lg:top-24">
          <span
            className="mb-5 inline-block rounded-full border px-4 py-1 font-['Hanken_Grotesk'] text-sm font-semibold tracking-[0.5px]"
            style={{
              color: "var(--home-text-highlight)",
              borderColor: "var(--home-border-strong)",
              backgroundColor: "var(--home-badge-bg)",
            }}
          >
            Need a little more?
          </span>
          <h2
            className="mb-5 font-['Syne'] text-3xl font-bold tracking-[-1.2px] sm:text-[40px]"
            style={{ color: "var(--home-text-highlight)" }}
          >
            We can support the details too.
          </h2>
          <p
            className="mb-8 max-w-md font-['Hanken_Grotesk'] text-base leading-relaxed"
            style={{ color: "var(--home-muted)" }}
          >
            Ticketing is just one part of a great event. If you need help beyond
            the platform, reach out and we&apos;ll work out the right support for you.
          </p>
          <a
            href="mailto:ticketerafrica@gmail.com?subject=Extra%20event%20support"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-['Hanken_Grotesk'] text-base font-bold transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              backgroundColor: "var(--home-accent)",
              color: "var(--home-accent-fg)",
              boxShadow: "0 0 0 6px rgba(226,114,91,0.08)",
            }}
          >
            Talk to our team
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-4 w-4" aria-hidden="true" />
          </a>
          <p className="mt-4 font-['Hanken_Grotesk'] text-sm" style={{ color: "var(--home-muted-dim)" }}>
            ticketerafrica@gmail.com
          </p>
        </div>

        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
          {EXTRAS.map((extra, index) => (
            <div
              key={extra.title}
              className={`border-t py-7 sm:px-7 ${index % 2 === 1 ? "sm:border-l" : ""} ${index >= 2 ? "sm:border-t" : ""}`}
              style={{ borderColor: "var(--home-border-subtle)" }}
            >
              <HomeCard tone="highlight" className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl">
                <HugeiconsIcon icon={extra.icon} className="h-5 w-5" style={{ color: "var(--home-accent)" }} aria-hidden="true" />
              </HomeCard>
              <h3 className="mb-2 font-['Syne'] text-xl font-semibold" style={{ color: "var(--home-text)" }}>
                {extra.title}
              </h3>
              <p className="font-['Hanken_Grotesk'] text-sm leading-relaxed" style={{ color: "var(--home-muted)" }}>
                {extra.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
