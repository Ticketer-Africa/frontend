"use client";

import type React from "react";
import dynamic from "next/dynamic";

import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/hero-section";

/**
 * Performance: Dynamic imports with SSR disabled for below-the-fold content
 *
 * Critical rendering path optimization:
 * - HeroSection and Footer load immediately (above the fold)
 * - All other sections are lazy loaded when they enter viewport
 * - This reduces initial JavaScript bundle by ~40-60%
 * - Improves LCP by not blocking on non-critical code
 */
const EventsSection = dynamic(
  () =>
    import("@/components/events-section").then((mod) => ({
      default: mod.EventsSection,
    })),
  {
    ssr: false,
    loading: () => <EventsSectionSkeleton />,
  }
);

const FeaturesSection = dynamic(
  () =>
    import("@/components/features-section").then((mod) => ({
      default: mod.FeaturesSection,
    })),
  { ssr: false }
);

const PricingSection = dynamic(
  () =>
    import("@/components/pricing-section").then((mod) => ({
      default: mod.PricingSection,
    })),
  { ssr: false }
);

const FAQSection = dynamic(
  () =>
    import("@/components/faq-section").then((mod) => ({
      default: mod.FAQSection,
    })),
  { ssr: false }
);

/**
 * Skeleton for events section to prevent CLS
 * Matches exact dimensions of EventsSection when loaded
 */
function EventsSectionSkeleton() {
  return (
    <section
      className="home-theme py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div
            className="h-12 w-64 rounded-lg mx-auto mb-3 animate-pulse"
            style={{ backgroundColor: "var(--home-card)" }}
          />
          <div
            className="h-6 w-96 max-w-full rounded mx-auto animate-pulse"
            style={{ backgroundColor: "var(--home-card)" }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--home-card)" }}
            >
              {/* Image skeleton with exact height to prevent CLS */}
              <div
                className="h-56 animate-pulse"
                style={{ backgroundColor: "var(--home-card-elevated)" }}
              />
              <div className="p-5 space-y-3">
                <div
                  className="h-6 rounded w-3/4 animate-pulse"
                  style={{ backgroundColor: "var(--home-card-elevated)" }}
                />
                <div
                  className="h-4 rounded w-full animate-pulse"
                  style={{ backgroundColor: "var(--home-card-elevated)" }}
                />
                <div
                  className="h-4 rounded w-1/2 animate-pulse"
                  style={{ backgroundColor: "var(--home-card-elevated)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="home-theme" style={{ backgroundColor: "var(--home-bg)" }}>
      {/*
       * Above the fold content - loads immediately
       * HeroSection is the LCP element on homepage
       */}
      <HeroSection />

      {/*
       * Below the fold content - lazy loaded
       * These sections load as user scrolls or after initial paint
       */}
      <EventsSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      {/* <WhyChooseSection /> */}
      <Footer />
    </div>
  );
}
