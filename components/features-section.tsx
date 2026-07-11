"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Ticket, RefreshCw, BarChart3, CreditCard } from "lucide-react";

/**
 * Static features data - defined outside component to prevent recreation
 * Performance: This data never changes, so it's hoisted out of render
 */
const FEATURES = [
  {
    icon: Ticket,
    title: "Buy Tickets Easily",
    description:
      "Browse and purchase tickets for your favorite events with just a few clicks.",
    color: "text-[#1E88E5]",
  },
  {
    icon: RefreshCw,
    title: "Resell Tickets Securely",
    description:
      "Can't make it? Safely resell your tickets through our verified marketplace.",
    color: "text-green-600",
    isNew: true,
  },
  {
    icon: BarChart3,
    title: "Organizer Dashboard & Wallet",
    description:
      "Comprehensive tools for event management and instant payouts.",
    color: "text-[#1E88E5]",
  },
  {
    icon: CreditCard,
    title: "Fast Checkout & Secure Payments",
    description:
      "Lightning-fast checkout with bank-level security for all transactions.",
    color: "text-orange-600",
  },
] as const;

/**
 * FeatureCard - Memoized to prevent re-renders
 */
interface FeatureCardProps {
  feature: (typeof FEATURES)[number];
}

const FeatureCard = memo(function FeatureCard({
  feature,
}: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <div className="relative group feature-card">
      <div className="bg-white rounded-2xl p-8 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150 border border-gray-100 hover:border-blue-200 h-full">
        {"isNew" in feature && feature.isNew && (
          <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            New ✅
          </Badge>
        )}

        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-6 group-hover:scale-[1.02] transition-transform duration-150">
          <Icon className={`w-6 h-6 ${feature.color}`} aria-hidden="true" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {feature.title}
        </h3>

        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
      </div>
    </div>
  );
});

/**
 * FeaturesSection - Optimized for performance
 *
 * Performance optimizations:
 * 1. Removed framer-motion and decorative entrance animations
 * 2. Static data hoisted out of component
 * 3. Memoized FeatureCard component
 */
export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="section-animate text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything you need for events
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From buying tickets to organizing events, we've got you covered with
            powerful features.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
