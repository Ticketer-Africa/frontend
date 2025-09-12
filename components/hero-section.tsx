"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo } from "./layout/logo";

export function HeroSection() {
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-16">
      {/* Animated background elements */}
      {/* Softer, slower animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50"
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-40"
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{
            duration: 35,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-40 left-40 w-56 h-56 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-0 text-center max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center mb-6"
        >
          <Logo size="sm" />
        </motion.div>

        {/* Heading with padding and responsive max-width */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight px-2 sm:px-4 max-w-4xl mx-auto"
        >
          Buy. Sell. Enjoy Events{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600">
            Effortlessly.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed px-3 sm:px-4"
        >
          Discover events, buy or resell tickets, and never miss out again.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center px-2"
        >
          <Button
            size="lg"
            onClick={() => router.push("/explore")}
            className="bg-[#1E88E5] hover:bg-blue-500 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
          >
            Explore Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/register")}
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent w-full sm:w-auto"
          >
            Become an Organizer
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 px-3"
        >
          <p className="text-sm text-gray-500 mb-4">
            Trusted by event organizers
          </p>
        </motion.div>
      </div>
    </section>
  );
}
