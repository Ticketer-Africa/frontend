"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/auth-context";

const CTA_BY_ROLE = {
  guest: { href: "/register?intent=organizer" },
  ORGANIZER: { href: "/organizer/create-event" },
  USER: { href: "/register?intent=organizer" },
} as const;

export function OrganiserFinalCTASection() {
  const router = useRouter();
  const { user } = useUser();
  const cta = CTA_BY_ROLE[user?.role ?? "guest"];

  return (
    <section
      className="home-theme py-24 px-4 sm:px-6 lg:px-8"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(226,114,91,0.14), transparent 60%), var(--home-bg)",
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2
          className="font-['Syne'] font-bold text-3xl sm:text-[44px] tracking-[-1.2px] mb-5"
          style={{ color: "var(--home-text)" }}
        >
          Ready to bring your event to life?
        </h2>
        <p
          className="font-['Hanken_Grotesk'] text-lg mb-10"
          style={{ color: "var(--home-muted)" }}
        >
          Create your event, start selling tickets and manage everything
          from one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            asChild
          >
            <a href="mailto:ticketerafrica@gmail.com">Contact Us</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
