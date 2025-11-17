"use client";

import type React from "react";

import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { EventsSection } from "@/components/events-section";
import { WhyChooseSection } from "@/components/why-choose-section";
import { FAQSection } from "@/components/faq-section";
import { PricingSection } from "@/components/pricing-section";

export default function HomePage() {
  return (
    <div className="bg-background">
      <HeroSection />
      <EventsSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      {/* <WhyChooseSection /> */}
      <Footer />
    </div>
  );
}
