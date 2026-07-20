"use client";

import { memo, useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import { CATEGORIES, PRICE_SLIDER_STEP } from "./constants";

interface FilterSectionProps {
  // Search
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  canSubmitSearch: boolean;

  // Filter visibility
  showFilters: boolean;
  onToggleFilters: () => void;

  // Location filter
  tempLocation: string;
  onTempLocationChange: (value: string) => void;
  locations: string[];
  selectedLocation: string;

  // Price filter
  tempPriceRange: [number, number];
  onTempPriceRangeChange: (value: [number, number]) => void;
  minPrice: number;
  maxPrice: number;
  priceSliderRange: [number, number];

  // Category filter
  tempCategory: string;
  onTempCategoryChange: (value: string) => void;
  selectedCategory: string;

  // Actions
  onApplyFilters: () => void;
  onClearFilters: () => void;

  // Results count
  resultsCount: number;
}

/**
 * FilterSection - Search and filter controls
 *
 * Performance optimizations:
 * - memo() prevents re-renders when events grid updates
 * - CSS transitions instead of framer-motion for filter panel
 * - Callbacks are memoized at parent level
 */
function FilterSectionComponent({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  canSubmitSearch,
  showFilters,
  onToggleFilters,
  tempLocation,
  onTempLocationChange,
  locations,
  selectedLocation,
  tempPriceRange,
  onTempPriceRangeChange,
  minPrice,
  maxPrice,
  priceSliderRange,
  tempCategory,
  onTempCategoryChange,
  selectedCategory,
  onApplyFilters,
  onClearFilters,
  resultsCount,
}: FilterSectionProps) {
  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSearchSubmit();
    },
    [onSearchSubmit],
  );

  // Calculate active filter count for badge
  const activeFilterCount = [
    selectedLocation,
    priceSliderRange[0] > minPrice || priceSliderRange[1] < maxPrice
      ? "price"
      : null,
    selectedCategory,
  ].filter(Boolean).length;

  return (
    <div className="mb-8">
      <div
        className="rounded-2xl p-6 border"
        style={{
          backgroundColor: "var(--home-card)",
          borderColor: "var(--home-border)",
        }}
      >
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--home-text-highlight)" }}
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder="Search events, locations, artists..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 rounded-full"
              style={{
                backgroundColor: "var(--home-bg)",
                borderColor: "var(--home-border-strong)",
                color: "var(--home-text)",
              }}
              aria-label="Search events"
            />
          </div>
          <Button
            type="submit"
            variant="homeAccent"
            className="h-12 px-5"
            disabled={!canSubmitSearch}
          >
            Search
          </Button>
        </form>
        {!canSubmitSearch && (
          <p className="mt-1 text-xs" style={{ color: "var(--home-muted)" }}>
            Enter at least 3 letters to search.
          </p>
        )}

        {/* Filter toggle and results count */}
        <div className="flex items-center justify-between">
          <Button
            variant="homeOutline"
            onClick={onToggleFilters}
            className="flex items-center space-x-2"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2"
                style={{
                  backgroundColor: "var(--home-accent)",
                  color: "var(--home-accent-fg)",
                }}
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <p className="text-sm" style={{ color: "var(--home-muted)" }} aria-live="polite">
            {resultsCount} events found
          </p>
        </div>

        {/* Filter panel updates layout immediately and fades content feedback. */}
        <div
          id="filter-panel"
          className={`
            grid transition-opacity duration-150 [transition-timing-function:var(--motion-ease-out)]
            ${
              showFilters
                ? "grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t"
                : "grid-rows-[0fr] opacity-0 overflow-hidden"
            }
          `}
          style={showFilters ? { borderColor: "var(--home-border)" } : undefined}
          aria-hidden={!showFilters}
        >
          <div className="min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location filter */}
              <div>
                <label
                  htmlFor="location-filter"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--home-muted)" }}
                >
                  Location
                </label>
                <select
                  id="location-filter"
                  value={tempLocation}
                  onChange={(e) => onTempLocationChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg"
                  style={{
                    backgroundColor: "var(--home-bg)",
                    borderColor: "var(--home-border)",
                    color: "var(--home-text)",
                    borderWidth: 1,
                  }}
                >
                  <option value="">All locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range filter */}
              <div>
                <label
                  id="price-filter-label"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--home-muted)" }}
                >
                  Price Range
                </label>
                <div className="px-2">
                  <Slider
                    value={tempPriceRange}
                    onValueChange={(value) =>
                      onTempPriceRangeChange(value as [number, number])
                    }
                    min={minPrice}
                    max={maxPrice}
                    step={PRICE_SLIDER_STEP}
                    className="w-full"
                    aria-labelledby="price-filter-label"
                  />
                  <div className="flex justify-between mt-2 text-sm" style={{ color: "var(--home-muted)" }}>
                    <span>{formatPrice(tempPriceRange[0])}</span>
                    <span>{formatPrice(tempPriceRange[1])}</span>
                  </div>
                  <div className="mt-1 text-xs text-center" style={{ color: "var(--home-muted)" }}>
                    Range: {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                  </div>
                </div>
              </div>

              {/* Category filter */}
              <div>
                <label
                  htmlFor="category-filter"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--home-muted)" }}
                >
                  Category
                </label>
                <select
                  id="category-filter"
                  value={tempCategory}
                  onChange={(e) => onTempCategoryChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg"
                  style={{
                    backgroundColor: "var(--home-bg)",
                    borderColor: "var(--home-border)",
                    color: "var(--home-text)",
                    borderWidth: 1,
                  }}
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter action buttons */}
              <div className="md:col-span-3 flex gap-3 pt-2">
                <Button
                  onClick={onApplyFilters}
                  variant="homeAccent"
                  className="flex-1 h-10"
                >
                  <SlidersHorizontal
                    className="w-4 h-4 mr-2"
                    aria-hidden="true"
                  />
                  Apply Filters
                </Button>
                <Button
                  onClick={onClearFilters}
                  variant="homeOutline"
                  className="px-6 h-10"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const FilterSection = memo(FilterSectionComponent);
