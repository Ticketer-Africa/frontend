"use client";

import { Button } from "@/components/ui/button";
import { EmberParticles } from "@/components/ember-particles";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth-context";

const CTA_BY_ROLE = {
  guest: { label: "Become an Organizer", href: "/register?intent=organizer" },
  ORGANIZER: { label: "Create an Event", href: "/organizer/create-event" },
  USER: { label: "Explore Events", href: "/explore" },
} as const;

export function HeroSection() {
  const router = useRouter();
  const { user } = useUser();
  const cta = CTA_BY_ROLE[user?.role ?? "guest"];

  return (
    <section
      className="home-theme relative flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-32 pb-24 min-h-[720px]"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(226,114,91,0.16), transparent 60%), var(--home-bg)",
      }}
    >
      <EmberParticles className="z-0" />

      <div className="relative z-10 text-center max-w-5xl mx-auto w-full">
        <span
          className="inline-block mb-4 px-4 py-1 rounded-full border text-sm tracking-[0.5px] font-['Hanken_Grotesk'] font-semibold backdrop-blur-[2px]"
          style={{
            color: "var(--home-text-highlight)",
            borderColor: "var(--home-border-strong)",
            backgroundColor: "var(--home-badge-bg)",
          }}
        >
          Experience the Rhythm
        </span>

        <h1
          className="font-['Syne'] font-extrabold text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight tracking-[-1.2px]"
          style={{ color: "var(--home-text)" }}
        >
          Buy. Sell. Enjoy
          <br />
          Events
          <br />
          <span style={{ color: "var(--home-accent)" }}>Effortlessly.</span>
        </h1>

        <p
          className="font-['Hanken_Grotesk'] text-lg sm:text-xl mb-10 max-w-3xl mx-auto leading-relaxed tracking-[0.5px]"
          style={{ color: "var(--home-muted)" }}
        >
          Discover the continent&apos;s most exclusive curated experiences, buy
          tickets securely, and never miss a heartbeat of African culture.
        </p>

        <div className="flex justify-center items-center px-2">
          <Button
            variant="homeAccent"
            size="lg"
            className="drop-shadow-[0px_0px_7.5px_rgba(226,114,91,0.2)]"
            onClick={() => router.push(cta.href)}
          >
            {cta.label}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
