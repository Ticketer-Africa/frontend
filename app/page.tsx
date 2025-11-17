"use client";

import type React from "react";

import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { EventsSection } from "@/components/events-section";
import { WhyChooseSection } from "@/components/why-choose-section";
import { FAQSection } from "@/components/faq-section";
import { PricingSection } from "@/components/pricing-section";

export const metadata = {
  title: "Ticketer Africa - Buy and Sell Event Tickets Effortlessly",
  description:
    "Discover events, buy tickets, resell securely, and explore amazing moments across Africa — all on Ticketer Africa.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: "https://ticketer.africa",
  },
  openGraph: {
    title: "Ticketer Africa - Event Ticketing Platform",
    description:
      "Buy. Sell. Enjoy events effortlessly. Explore events and resell tickets with ease.",
    url: "https://ticketer.africa",
    siteName: "Ticketer Africa",
    type: "website",
    images: [
      {
        url: "https://ticketer.africa/logo.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ticketer Africa - Event Ticketing Platform",
    description: "Discover and buy tickets for events across Africa.",
    images: ["https://ticketer.africa/logo.png"],
  },
};

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
