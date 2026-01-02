"use client";

/**
 * RouteLoader - Optimized for performance
 *
 * Performance optimizations:
 * 1. Removed framer-motion - CSS animation instead
 * 2. Uses section-animate class from globals.css
 */
export default function RouteLoader() {
  return (
    <div className="section-animate fixed inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      </div>
    </div>
  );
}
