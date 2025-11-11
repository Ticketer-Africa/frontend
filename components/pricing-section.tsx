"use client";

import { motion } from "framer-motion";

export function PricingSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            No subscriptions. No setup fees. You only pay when you sell.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Event Ticket Sales
            </h3>
            <p className="text-gray-700 text-lg">
              Just <span className="font-bold text-[#1E88E5]">5%</span> per paid
              ticket. Free tickets?{" "}
              <span className="text-green-600 font-medium">Totally free</span>.
            </p>
            <p className="text-gray-500 mt-2">
              Keep 95% of every sale, no hidden charges or processing surprises.
            </p>
          </div>

          <div className="border-t border-gray-200 w-24 mx-auto"></div>

          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Ticket Resales
            </h3>
            <p className="text-gray-700 text-lg">
              Each resale has a flat{" "}
              <span className="font-bold text-[#1E88E5]">15%</span> fee.
            </p>
            <p className="text-gray-600 mt-3">
              <span className="font-medium">10%</span> goes to the original
              event organizer, <span className="font-medium">5%</span> supports
              platform operations.
            </p>
            <p className="text-gray-500 mt-2">
              Fair, simple, and built to keep everyone rewarded.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <a
            href="organizer/create-event"
            className="inline-block bg-[#1E88E5] hover:bg-blue-700 text-white px-10 py-4 rounded-full font-medium text-lg transition-all duration-300"
          >
            Start Selling Tickets
          </a>
        </motion.div>
      </div>
    </section>
  );
}
