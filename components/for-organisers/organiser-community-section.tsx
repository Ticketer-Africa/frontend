"use client";

import Image from "next/image";
import { HomeCard } from "@/components/home/home-card";

const CAPABILITIES = [
  {
    title: "Flexible ticket categories",
    description:
      "Free or paid, one category or ten. Set your own pricing and admission limits per ticket type.",
  },
  {
    title: "Custom attendee questions",
    description: "Collect exactly what you need from guests at checkout.",
  },
  {
    title: "Secure online checkout",
    description: "Encrypted payments, with no hidden processing fees.",
  },
  {
    title: "Verified ticket resale",
    description: "Attendees who can no longer attend can resell their ticket.",
  },
] as const;

export function OrganiserCommunitySection() {
  return (
    <section
      className="home-theme py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <div>
          <h2
            className="font-['Syne'] font-bold text-3xl sm:text-[36px] tracking-[-1.2px] mb-4"
            style={{ color: "var(--home-text-highlight)" }}
          >
            Built for how events run across Africa
          </h2>
          <p
            className="font-['Hanken_Grotesk'] text-base leading-relaxed mb-8"
            style={{ color: "var(--home-muted)" }}
          >
            We work alongside organisers from setup to the last guest through
            the door, not just at checkout.
          </p>

          <HomeCard tone="elevated" radius="card-lg" className="overflow-hidden p-2">
            <div className="rounded-[16px] overflow-hidden border" style={{ borderColor: "var(--home-border)" }}>
              <Image
                src="/for-organisers/team.jpg"
                alt="The Ticketer Africa team supporting organisers on the ground at a live event"
                width={1200}
                height={900}
                className="w-full h-auto object-cover"
                loading="lazy"
                sizes="(min-width: 1024px) 608px, 100vw"
              />
            </div>
          </HomeCard>
        </div>

        <div>
          {CAPABILITIES.map((item, index) => (
            <div
              key={item.title}
              className={`py-6 ${index > 0 ? "border-t" : ""}`}
              style={{ borderColor: "var(--home-border-subtle)" }}
            >
              <h3
                className="font-['Syne'] text-lg font-semibold mb-1.5"
                style={{ color: "var(--home-text)" }}
              >
                {item.title}
              </h3>
              <p
                className="font-['Hanken_Grotesk'] text-sm leading-relaxed"
                style={{ color: "var(--home-muted)" }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
