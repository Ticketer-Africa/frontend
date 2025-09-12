"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Heart, Award } from "lucide-react";
import { useRouter } from "next/navigation";

const benefits = [
  {
    icon: Shield,
    title: "Verified & Secure",
    description:
      "All tickets are verified and transactions are protected with bank-level security.",
    color: "text-green-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Get your tickets instantly with our optimized checkout process.",
    color: "text-yellow-600",
  },
  {
    icon: Heart,
    title: "Customer First",
    description:
      "24/7 support and hassle-free refunds ensure your satisfaction.",
    color: "text-red-600",
  },
  {
    icon: Award,
    title: "Best Prices",
    description:
      "Compare prices and find the best deals with our price guarantee.",
    color: "text-blue-600",
  },
];

export function WhyChooseSection() {
  const router = useRouter();
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-4 p-2">
            Why Choose Ticketer?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're not just another ticketing platform. We're your trusted
            partner for unforgettable experiences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="relative mb-6">
                <div
                  className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {benefit.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-gradient-to-r from-blue-600 to-blue-600 rounded-3xl p-12 text-white"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to get started?
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of happy customers who trust Ticketer for their
            events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/events")}
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Exploring
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

