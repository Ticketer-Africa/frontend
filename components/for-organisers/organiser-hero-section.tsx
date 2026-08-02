"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, ChartUpIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { EmberParticles } from "@/components/ember-particles";
import { HomeCard } from "@/components/home/home-card";
import { useUser } from "@/lib/auth-context";

const CTA_BY_ROLE = {
  guest: { href: "/register?intent=organizer" },
  ORGANIZER: { href: "/organizer/create-event" },
  USER: { href: "/register?intent=organizer" },
} as const;

export function OrganiserHeroSection() {
  const router = useRouter();
  const { user } = useUser();
  const cta = CTA_BY_ROLE[user?.role ?? "guest"];

  return (
    <section
      className="home-theme relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-32 pb-24"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(226,114,91,0.16), transparent 60%), var(--home-bg)",
      }}
    >
      <EmberParticles className="z-0" count={18} />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-16 items-center">
        <div>
          <span
            className="inline-block mb-6 px-4 py-1 rounded-full border text-sm tracking-[0.5px] font-['Hanken_Grotesk'] font-semibold backdrop-blur-[2px]"
            style={{
              color: "var(--home-text-highlight)",
              borderColor: "var(--home-border-strong)",
              backgroundColor: "var(--home-badge-bg)",
            }}
          >
            For Organisers
          </span>

          <h1
            className="font-['Syne'] font-extrabold text-4xl sm:text-5xl lg:text-[64px] mb-6 leading-tight lg:leading-[68px] tracking-[-1.2px]"
            style={{ color: "var(--home-text)" }}
          >
            From <span style={{ color: "var(--home-accent)" }}>Setup</span> to
            <br />
            Sold Out
          </h1>

          <p
            className="font-['Hanken_Grotesk'] text-lg mb-10 max-w-xl leading-normal tracking-[0.5px]"
            style={{ color: "var(--home-muted)" }}
          >
            Create your event, sell tickets, manage attendees and check
            guests in, all from one simple platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="homeAccent"
              className="drop-shadow-[0px_0px_7.5px_rgba(226,114,91,0.2)] h-auto rounded-[30px] px-8 py-[18px] text-base font-bold gap-[10px]"
              onClick={() => router.push(cta.href)}
            >
              Create an Event
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
              variant="homeOutline"
              className="h-auto rounded-[30px] px-8 py-[18px] text-base font-bold"
              onClick={() => router.push("/explore")}
            >
              Explore Events
            </Button>
          </div>
        </div>

        <div className="relative">
          <HomeCard
            tone="elevated"
            radius="card-lg"
            className="relative overflow-hidden p-2 sm:p-3 shadow-2xl"
            style={{ borderColor: "var(--home-border-strong)" }}
          >
            <div className="rounded-[16px] overflow-hidden border" style={{ borderColor: "var(--home-border)" }}>
              <Image
                src="/for-organisers/organiser-dashboard.png"
                alt="Ticketer Africa organiser dashboard showing total events, tickets sold and net earnings"
                width={1600}
                height={884}
                className="w-full h-auto"
                priority
                sizes="(min-width: 1024px) 640px, 100vw"
              />
            </div>
          </HomeCard>

          <HomeCard
            tone="highlight"
            className="hidden sm:flex absolute -bottom-6 -left-6 items-center gap-3 pl-4 pr-5 py-3 shadow-xl"
            style={{ borderColor: "var(--home-border-strong)" }}
          >
            <HugeiconsIcon
              icon={ChartUpIcon}
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "var(--home-success)" }}
              aria-hidden="true"
            />
            <p className="font-['Hanken_Grotesk'] text-sm font-semibold" style={{ color: "var(--home-text)" }}>
              Sales updating live, no refresh needed
            </p>
          </HomeCard>
        </div>
      </div>
    </section>
  );
}
