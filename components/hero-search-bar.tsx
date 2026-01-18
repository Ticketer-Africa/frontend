"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * HeroSearchBar - Simple search bar for homepage
 * Navigates to explore page with search query on Enter
 */
export function HeroSearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      // Navigate to explore page with search query
      router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="w-full max-w-2xl md:max-w-full mx-auto mb-8">
      <div className="relative">
        <Search
          className="absolute left-4 md:left-10 top-1/2 transform -translate-y-1/2 h-5 w-5 md:w-7 md:h-7 text-[#1E88E5]"
          aria-hidden="true"
        />
        <Input
          type="text"
          placeholder="Search events, locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="px-12 md:px-20 py-6 md:py-10 bg-white outline-none focus:outline-none border-[#1E88E5] rounded-full focus:ring-2 focus-visible:ring-[#1E88E5] focus:ring-[#1E88E5] focus:border-[#1E88E5] md:text-xl"
          aria-label="Search events"
        />
      </div>
    </div>
  );
}
