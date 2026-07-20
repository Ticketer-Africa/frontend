"use client";

import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeCard } from "@/components/home/home-card";

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="home-theme py-24 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-5xl mx-auto text-center">
        <div className="section-animate mb-12">
          <h2
            className="font-['Syne'] font-bold text-3xl sm:text-4xl lg:text-5xl mb-4"
            style={{ color: "var(--home-text)" }}
          >
            Simple, Transparent Pricing
          </h2>
          <p
            className="font-['Hanken_Grotesk'] text-lg"
            style={{ color: "var(--home-muted)" }}
          >
            No subscriptions. No setup fees. You only pay when you sell.
          </p>
        </div>

        <div className="section-animate section-delay-1 grid grid-cols-1 md:grid-cols-2 gap-8">
          <HomeCard
            tone="highlight"
            radius="card-lg"
            className="relative p-10"
            style={{ borderWidth: 2, borderColor: "var(--home-accent)" }}
          >
            <span
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-['Hanken_Grotesk'] font-bold whitespace-nowrap"
              style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
            >
              FOR ORGANIZERS
            </span>

            <h3
              className="font-['Syne'] text-2xl tracking-[0.5px] mb-2"
              style={{ color: "var(--home-text)" }}
            >
              Event Ticket Sales
            </h3>
            <p className="mb-4">
              <span
                className="font-['Syne'] font-medium text-4xl"
                style={{ color: "var(--home-accent)" }}
              >
                5%
              </span>{" "}
              <span
                className="font-['Hanken_Grotesk'] text-lg"
                style={{ color: "var(--home-muted)" }}
              >
                per paid ticket
              </span>
            </p>
            <p
              className="font-['Hanken_Grotesk'] font-bold text-base mb-4"
              style={{ color: "var(--home-success-text)" }}
            >
              Free tickets? Totally free.
            </p>
            <p
              className="font-['Hanken_Grotesk'] text-sm"
              style={{ color: "var(--home-muted)" }}
            >
              Keep 95% of every sale, no hidden charges or surprises.
            </p>
          </HomeCard>

          <HomeCard tone="card" radius="card-lg" className="p-10">
            <h3
              className="font-['Syne'] text-2xl tracking-[0.5px] mb-2"
              style={{ color: "var(--home-text)" }}
            >
              Event Ticket Sales
            </h3>
            <p className="mb-4">
              <span
                className="font-['Syne'] font-medium text-4xl"
                style={{ color: "var(--home-highlight-yellow)" }}
              >
                15%
              </span>{" "}
              <span
                className="font-['Hanken_Grotesk'] text-lg"
                style={{ color: "var(--home-muted)" }}
              >
                flat fee
              </span>
            </p>
            <div
              className="space-y-2 mb-4 font-['Hanken_Grotesk'] text-sm text-left inline-block"
              style={{ color: "var(--home-muted)" }}
            >
              <p>• 10% goes to the original organizer</p>
              <p>• 5% supports platform operations</p>
            </div>
            <p
              className="font-['Hanken_Grotesk'] text-sm"
              style={{ color: "var(--home-muted)" }}
            >
              Fair, simple, and built to reward creators.
            </p>
          </HomeCard>
        </div>

        <div className="section-animate section-delay-2 mt-16">
          <Button
            variant="homeAccent"
            size="lg"
            asChild
            className="drop-shadow-[0px_0px_7.5px_rgba(226,114,91,0.2)]"
          >
            <a href="/register?intent=organizer">
              <Ticket className="mr-2 w-4 h-4" />
              Start Selling Tickets
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
