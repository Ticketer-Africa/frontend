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
      <div className="text-6xl mb-4" aria-hidden="true">
        🎭
      </div>
      <h3 className="text-2xl font-semibold mb-2" style={{ color: "var(--home-text)" }}>
        No events found
      </h3>
      <p className="mb-6" style={{ color: "var(--home-muted)" }}>Try adjusting your search or filters</p>
      <Button onClick={onClearFilters} variant="homeOutline">
        Clear Filters
      </Button>
    </div>
  );
}
