"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Ticket, RefreshCw, BarChart3, CreditCard } from "lucide-react";

const features = [
  {
    icon: Ticket,
    title: "Buy Tickets Easily",
    description:
      "Browse and purchase tickets for your favorite events with just a few clicks.",
    color: "text-blue-600",
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
    color: "text-blue-600",
  },
  {
    icon: CreditCard,
    title: "Fast Checkout & Secure Payments",
    description:
      "Lightning-fast checkout with bank-level security for all transactions.",
    color: "text-orange-600",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything you need for events
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From buying tickets to organizing events, we've got you covered with
            powerful features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 h-full">
                {feature.isNew && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    New ✅
                  </Badge>
                )}

                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

