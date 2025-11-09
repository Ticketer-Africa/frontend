"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function RouteLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-50"
    >
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      </div>
    </motion.div>
  );
}
