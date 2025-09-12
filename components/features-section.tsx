"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  RefreshCw,
  BarChart3,
  CreditCard,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Ticket,
    title: "Buy Tickets Easily",
    description:
      "Browse and purchase tickets for your favorite events with just a few clicks. Smart recommendations powered by AI.",
    color: "from-blue-500 to-blue-600",
    iconColor: "text-blue-600",
    bgColor: "from-blue-50 to-blue-100/50",
  },
  {
    icon: RefreshCw,
    title: "Resell Tickets Securely",
    description:
      "Can't make it? Safely resell your tickets through our verified marketplace with fraud protection.",
    color: "from-emerald-500 to-green-600",
    iconColor: "text-emerald-600",
    bgColor: "from-emerald-50 to-green-100/50",
    isNew: true,
  },
  {
    icon: BarChart3,
    title: "Organizer Dashboard & Wallet",
    description:
      "Comprehensive analytics, real-time insights, and instant payouts with detailed reporting.",
    color: "from-purple-500 to-indigo-600",
    iconColor: "text-purple-600",
    bgColor: "from-purple-50 to-indigo-100/50",
  },
  {
    icon: CreditCard,
    title: "Fast Checkout & Secure Payments",
    description:
      "Lightning-fast one-click checkout with bank-level security and multiple payment options.",
    color: "from-orange-500 to-red-600",
    iconColor: "text-orange-600",
    bgColor: "from-orange-50 to-red-100/50",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Light Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-100/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-2 border border-blue-100">
            <Sparkles className="w-4 h-4" />
            Powerful Features
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-4 p-4">
            Everything you need for events
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From buying tickets to organizing world-class events, we provide
            cutting-edge tools that make every step seamless and secure.
          </p>
        </motion.div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {features.map((feature) => (
    <motion.div
      key={feature.title}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100/50 h-full overflow-hidden">
        {/* New Badge */}
        {feature.isNew && (
          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 text-xs font-semibold shadow-lg z-10">
            <Zap className="w-3 h-3 mr-1" />
            New
          </Badge>
        )}

        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.bgColor} flex items-center justify-center mb-6 shadow-md`}
        >
          <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed">
          {feature.description}
        </p>

        {/* ✅ Removed the gradient bottom bar */}
      </div>
    </motion.div>
  ))}
</div>


        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="flex items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">AI Powered</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
