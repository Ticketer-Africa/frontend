"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo } from "./layout/logo";
import { HeroSearchBar } from "./hero-search-bar";

/**
 * HeroSection - Optimized for LCP and above-the-fold performance
 *
 * Performance optimizations:
 * 1. Removed framer-motion animations that blocked initial render
 * 2. Using CSS animations instead (GPU-accelerated, non-blocking)
 * 3. Background animations use CSS @keyframes (no JS execution)
 * 4. Content renders immediately without waiting for animation library
 * 5. Text is the LCP element - renders instantly
 */
export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative flex mt-12 items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-16">
      {/*
       * CSS-only animated background elements
       * Performance: CSS animations are GPU-accelerated and don't block main thread
       * Using will-change sparingly to hint browser about animations
       */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hero-bg-circle hero-bg-circle-1" />
        <div className="hero-bg-circle hero-bg-circle-2" />
        <div className="hero-bg-circle hero-bg-circle-3" />
      </div>

      <div className="relative z-0 text-center max-w-5xl mx-auto w-full">
        {/* Logo - uses CSS fade-in animation */}
        <div className="hero-fade-in flex items-center justify-center mb-6">
          <Logo size="sm" />
        </div>

        {/*
         * Main heading - LCP candidate
         * No animation delay - renders immediately for best LCP score
         */}
        <h1 className="hero-fade-in hero-delay-1 text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight px-2 sm:px-4 max-w-4xl mx-auto">
          Buy. Sell. Enjoy Events{" "}
          <span className="text-transparent bg-clip-text bg-[#1E88E5]">
            Effortlessly.
          </span>
        </h1>

        <p className="hero-fade-in hero-delay-2 text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed px-3 sm:px-4">
          Discover events, buy or resell tickets, and never miss out again.
        </p>
        <div className="hero-fade-in hero-delay-3 flex flex-col sm:flex-row gap-4 justify-center items-center px-2">
          {/* <Button
            size="lg"
            onClick={() => router.push("/explore")}
            className="bg-[#1E88E5] hover:bg-blue-500 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
          >
            Explore Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button> */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/register")}
            className="bg-[#1E88E5] hover:bg-blue-500 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hoveR:text-white transition-all duration-300 w-full sm:w-auto"
          >
            Become an Organizer
          </Button>
        </div>

        <div className="hero-fade-in hero-delay-3 px-2 sm:px-4 md:mt-16">
          <HeroSearchBar />
        </div>
      </div>
    </section>
  );
}
