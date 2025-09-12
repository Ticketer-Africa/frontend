"use client";

import type React from "react";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Star,
  Zap,
  Shield,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { EventsSection } from "@/components/events-section";
import { WhyChooseSection } from "@/components/why-choose-section";
import { PricingSection } from "@/components/pricing";


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
      <WhyChooseSection />
      <Footer />
    </div>
  );
}

