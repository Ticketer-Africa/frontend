"use client";

import type React from "react";

import { motion } from "framer-motion";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { EventsSection } from "@/components/events-section";
import { WhyChooseSection } from "@/components/why-choose-section";
import { FAQSection } from "@/components/faq-section";
import { PricingSection } from "@/components/pricing-section";

const StaggerContainer = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    }}
  >
    {children}
  </motion.div>
);

const StaggerItem = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
  >
    {children}
  </motion.div>
);

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
