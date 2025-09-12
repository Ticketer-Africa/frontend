"use client";

import { motion } from "framer-motion";
import { CreditCard, PieChart, DollarSign, TrendingUp, Shield, CheckCircle } from "lucide-react";

const fees = [
  {
    icon: CreditCard,
    title: "Platform Fee",
    percentage: "5%",
    description: "3.5% goes to Ticketer, 1.5% to the payment gateway. Transparent, no hidden costs.",
    color: "from-blue-500 to-blue-600",
    iconColor: "text-blue-600",
    bgColor: "from-blue-50 to-blue-100/50",
    features: ["Instant processing", "Global coverage", "24/7 support"]
  },
  {
    icon: PieChart,
    title: "Resale Fee",
    percentage: "10% + 5%",
    description: "Organizers collect 10% on resold tickets, Ticketer takes 5%. Fair revenue sharing.",
    color: "from-emerald-500 to-green-600",
    iconColor: "text-emerald-600",
    bgColor: "from-emerald-50 to-green-100/50",
    features: ["Fraud protection", "Verified transfers", "Price controls"]
  },
  {
    icon: DollarSign,
    title: "Secure Payments",
    percentage: "0% Extra",
    description: "All transactions processed with bank-level security and instant payouts included.",
    color: "from-purple-500 to-indigo-600",
    iconColor: "text-purple-600",
    bgColor: "from-purple-50 to-indigo-100/50",
    features: ["Instant payouts", "Multiple currencies", "Chargeback protection"]
  },
];

export function PricingSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 overflow-hidden">
      {/* Light Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 -right-20 w-80 h-80 bg-blue-200/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-100/20 rounded-full blur-2xl"></div>
        <div className="absolute top-20 left-1/2 w-64 h-64 bg-purple-100/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 text-green-700 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-green-100">
            <TrendingUp className="w-4 h-4" />
            Transparent Pricing
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-6">
            Simple, Fair Fees
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We believe in clear, honest pricing with no surprises. Focus on creating amazing events while we handle the rest.
          </p>
        </motion.div>

        {/* Fees Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {fees.map((fee, index) => (
            <motion.div
              key={fee.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="relative group"
            >
              <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 h-full overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${fee.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${fee.bgColor} flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300 shadow-md`}>
                    <fee.icon className={`w-10 h-10 ${fee.iconColor}`} />
                  </div>

                  {/* Percentage Badge */}
                  <div className={`inline-flex items-center justify-center bg-gradient-to-r ${fee.color} text-white px-6 py-2 rounded-full text-lg font-bold mb-6 shadow-md`}>
                    {fee.percentage}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                    {fee.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors">
                    {fee.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2">
                    {fee.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white shadow-xl"
        >
          <div className="max-w-2xl mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 text-blue-200" />
            <h3 className="text-3xl font-bold mb-4">
              Protected by Industry-Leading Security
            </h3>
            <p className="text-blue-100 text-lg leading-relaxed">
              Your payments and data are secured with the same technology trusted by the world's largest financial institutions.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
