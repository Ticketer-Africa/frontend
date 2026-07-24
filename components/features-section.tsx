"use client";

import { memo } from "react";
import { Ticket, RefreshCw, BarChart3, CreditCard } from "lucide-react";
import { HomeCard } from "@/components/home/home-card";

const FEATURES = [
  {
    icon: Ticket,
    title: "Buy Tickets Easily",
    description:
      "Browse and purchase tickets for your favorite events with just a few clicks in a seamless journey.",
    iconBg: "rgba(226,114,91,0.1)",
    iconColor: "var(--home-accent)",
    isNew: false,
  },
  {
    icon: RefreshCw,
    title: "Resell Tickets Securely",
    description:
      "Can't make it? Safely resell your tickets through our verified peer-to-peer marketplace.",
    iconBg: "rgba(66,167,59,0.1)",
    iconColor: "var(--home-success)",
    isNew: true,
  },
  {
    icon: BarChart3,
    title: "Organizer Dashboard",
    description:
      "Comprehensive tools for event management and instant payouts, built for organizers of any size.",
    iconBg: "rgba(244,208,63,0.1)",
    iconColor: "var(--home-highlight-yellow)",
    isNew: false,
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Lightning-fast checkout with bank-level encryption for all your transactions across the continent.",
    iconBg: "rgba(255,180,165,0.1)",
    iconColor: "var(--home-text-highlight)",
    isNew: false,
  },
] as const;

interface FeatureCardProps {
  feature: (typeof FEATURES)[number];
  index: number;
}

const FeatureCard = memo(function FeatureCard({
  feature,
  index,
}: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <HomeCard
      className="relative p-8 feature-card lg:aspect-square lg:size-[292px]"
      style={{ animationDelay: `${index * 100}ms`, borderColor: "var(--home-border-strong)" }}
    >
      {feature.isNew && (
        <span
          className="absolute top-4 right-4 rounded-full px-3 py-1 text-[10px] font-['Hanken_Grotesk'] font-bold tracking-[0.5px]"
          style={{ backgroundColor: "var(--home-success)", color: "var(--home-success-fg)" }}
        >
          NEW
        </span>
      )}

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-10"
        style={{ backgroundColor: feature.iconBg }}
      >
        <Icon className="w-5 h-5" style={{ color: feature.iconColor }} aria-hidden="true" />
      </div>

      <h3
        className="font-['Syne'] font-medium text-xl mb-4 tracking-[-1.2px]"
        style={{ color: "var(--home-text)" }}
      >
        {feature.title}
      </h3>

      <p
        className="font-['Hanken_Grotesk'] text-sm leading-[22px]"
        style={{ color: "var(--home-muted)" }}
      >
        {feature.description}
      </p>
    </HomeCard>
  );
});

export function FeaturesSection() {
  return (
    <section
      className="home-theme py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="section-animate text-center mb-16">
          <h2
            className="font-['Syne'] font-bold text-3xl sm:text-[32px] tracking-[-1.2px] mb-4"
            style={{ color: "var(--home-text-highlight)" }}
          >
            Everything you need for events
          </h2>
          <p
            className="font-['Hanken_Grotesk'] text-base max-w-2xl mx-auto"
            style={{ color: "var(--home-muted)" }}
          >
            From buying tickets to organizing events, we&apos;ve got you
            covered with powerful tools designed for the modern scene.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:justify-items-center">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
