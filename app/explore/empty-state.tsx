"use client";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onClearFilters: () => void;
}

/**
 * EmptyState - Shown when no events match filters
 *
 * Performance: Minimal component with no animations or heavy dependencies
 */
export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      {/* Emoji instead of animated icon - no JS execution needed */}
      <div className="text-6xl mb-4" aria-hidden="true">
        🎭
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        No events found
      </h3>
      <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
      <Button
        onClick={onClearFilters}
        variant="outline"
        className="border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white rounded-full bg-transparent"
      >
        Clear Filters
      </Button>
    </div>
  );
}
