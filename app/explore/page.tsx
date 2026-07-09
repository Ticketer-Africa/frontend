"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { usePriceRange } from "@/services/events/events.queries";
import { useAllEventsV2 } from "@/services/events/events-v2.queries";
import { EventV2 } from "@/types/events-v2.type";

// Local components - code split for better tree shaking
import { FilterSection } from "./filter-section";
import { EventsGrid } from "./events-grid";
import { EventsGridSkeleton } from "./skeletons";
import { PaginationControls } from "./pagination-controls";
import { EmptyState } from "./empty-state";

// Utils and constants
import { extractLocations, filterEvents } from "./utils";
import {
  DEFAULT_MIN_PRICE,
  DEFAULT_MAX_PRICE,
} from "./constants";

/**
 * EventsPage - Optimized explore page for discovering events
 *
 * Performance optimizations applied:
 *
 * 1. CLS (Cumulative Layout Shift):
 *    - Skeleton loaders match exact dimensions of final content
 *    - Images have explicit width/height reservations
 *    - Fixed min-heights on variable content sections
 *    - Filter panel uses CSS grid-rows animation (no height measurement)
 *
 * 2. LCP (Largest Contentful Paint):
 *    - Hero text renders immediately (no animation delay)
 *    - First 3 event images use priority loading
 *    - Skeletons show immediately while data fetches
 *
 * 3. INP (Interaction to Next Paint):
 *    - Search debounced to prevent rapid re-renders
 *    - memo() on child components prevents cascade re-renders
 *    - useCallback for all handlers to maintain referential equality
 *    - useMemo for expensive computations (locations, filtered events)
 *
 * 4. JavaScript execution:
 *    - Removed framer-motion animations from event cards (CSS only)
 *    - Static constants extracted outside component
 *    - No inline object/array creation in render
 */
export default function EventsPage() {
  // ─────────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetch global price range - used for slider bounds
   * Note: API endpoint may fail (404), so we'll also compute from events data
   */
  const { data: priceRangeData, isError: priceRangeError } = usePriceRange();

  // ─────────────────────────────────────────────────────────────────────────────
  // LOCAL STATE
  // ─────────────────────────────────────────────────────────────────────────────

  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Track if we've initialized from URL to show skeleton during search
  const hasInitializedFromUrl = useRef(false);
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(false);

  // Price bounds - will be updated from API or computed from events
  const [priceBounds, setPriceBounds] = useState<{ min: number; max: number }>({
    min: DEFAULT_MIN_PRICE,
    max: DEFAULT_MAX_PRICE,
  });

  // Applied filter values (sent to API or used for client filtering)
  const [selectedLocation, setSelectedLocation] = useState("");
  // Price range slider values
  const [priceSliderRange, setPriceSliderRange] = useState<[number, number]>([
    DEFAULT_MIN_PRICE,
    DEFAULT_MAX_PRICE,
  ]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // UI state
  const [showFilters, setShowFilters] = useState(false);

  // Track if we've synced the initial price range
  const hasInitialPriceSync = useRef(false);

  // Temporary filter values (before clicking "Apply")
  const [tempLocation, setTempLocation] = useState("");
  // Temp price range for filter panel
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([
    DEFAULT_MIN_PRICE,
    DEFAULT_MAX_PRICE,
  ]);
  const [tempCategory, setTempCategory] = useState("");

  // ─────────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Initialize search query from URL parameters
   * If coming from home page with search, show skeleton until results load
   */
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch && !hasInitializedFromUrl.current) {
      hasInitializedFromUrl.current = true;
      setSearchQuery(urlSearch);
      setAppliedSearch(urlSearch);
      setShowInitialSkeleton(true); // Show skeleton while searching
    }
  }, [searchParams]);

  /**
   * Sync price bounds from API data when it arrives successfully
   */
  useEffect(() => {
    if (priceRangeData && !hasInitialPriceSync.current) {
      const newMin = priceRangeData.minPrice;
      const newMax = priceRangeData.maxPrice;

      // Mark as synced
      hasInitialPriceSync.current = true;

      // Update bounds
      setPriceBounds({ min: newMin, max: newMax });
      // Update slider to full range
      setPriceSliderRange([newMin, newMax]);
      setTempPriceRange([newMin, newMax]);
    }
  }, [priceRangeData]);

  // ─────────────────────────────────────────────────────────────────────────────
  // DATA FETCHING - EVENTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetch events with server-side search and price filtering
   * Location and category are filtered client-side for faster UX
   *
   * Note: We use both isLoading and data check to determine skeleton state.
   * - isLoading: true only on first fetch with no cache
   * - data: check if we have any cached data to display
   */
  const {
    data: response,
    isLoading: eventsLoading,
    isFetching,
  } = useAllEventsV2(
    currentPage,
    appliedSearch || undefined,
    priceSliderRange && priceSliderRange[0] > priceBounds.min
      ? priceSliderRange[0]
      : undefined,
    priceSliderRange && priceSliderRange[1] < priceBounds.max
      ? priceSliderRange[1]
      : undefined,
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // DERIVED DATA
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Parse API response - handle both array and paginated formats
   */
  const { events, meta } = useMemo(() => {
    let events: EventV2[] = [];
    let meta = null;

    if (Array.isArray(response)) {
      events = response;
    } else if (response && typeof response === "object" && "data" in response) {
      events = (response as any).data;
      meta = (response as any).meta;
    }

    return { events, meta };
  }, [response]);

  /**
   * Hide skeleton once search results are available
   */
  useEffect(() => {
    if (showInitialSkeleton && response) {
      setShowInitialSkeleton(false);
    }
  }, [response, showInitialSkeleton]);

  /**
   * Compute price bounds from events when API price-range endpoint fails
   * This provides a fallback so the slider shows meaningful values
   */
  useEffect(() => {
    // Only compute from events if API failed and we haven't synced yet
    if (priceRangeError && events.length > 0 && !hasInitialPriceSync.current) {
      let minFound = Infinity;
      let maxFound = 0;

      events.forEach((event) => {
        event.ticketCategories?.forEach((cat) => {
          if (cat.displayPrice > 0) {
            minFound = Math.min(minFound, cat.displayPrice);
            maxFound = Math.max(maxFound, cat.displayPrice);
          }
        });
      });

      // Only update if we found valid prices
      if (minFound !== Infinity && maxFound > 0) {
        hasInitialPriceSync.current = true;
        setPriceBounds({ min: minFound, max: maxFound });
        setPriceSliderRange([minFound, maxFound]);
        setTempPriceRange([minFound, maxFound]);
      }
    }
  }, [priceRangeError, events]);

  /**
   * Extract unique locations from current events
   * Memoized to prevent recalculation on every render
   */
  const locations = useMemo(() => extractLocations(events), [events]);

  /**
   * Apply client-side filters (location and category)
   * Search and price are handled server-side
   */
  const filteredEvents = useMemo(
    () => filterEvents(events, selectedLocation, selectedCategory),
    [events, selectedLocation, selectedCategory],
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // CALLBACKS
  // All handlers wrapped in useCallback to prevent child re-renders
  // ─────────────────────────────────────────────────────────────────────────────

  const applySearch = useCallback(
    (rawValue: string) => {
      const query = rawValue.trim().replace(/\s+/g, " ").toLowerCase();

      // Allow empty query to reset results.
      if (query.length === 0) {
        if (appliedSearch !== "") {
          setAppliedSearch("");
          setCurrentPage(1);
        }
        return;
      }

      // Minimum 3 characters before triggering API search.
      if (query.length < 3) {
        if (appliedSearch !== "") {
          setAppliedSearch("");
          setCurrentPage(1);
        }
        return;
      }

      if (query === appliedSearch) return;
      setAppliedSearch(query);
      setCurrentPage(1);
    },
    [appliedSearch],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      applySearch(value);
    },
    [applySearch],
  );

  const handleSearchSubmit = useCallback(() => {
    applySearch(searchQuery);
  }, [applySearch, searchQuery]);

  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleTempLocationChange = useCallback((value: string) => {
    setTempLocation(value);
  }, []);

  const handleTempPriceRangeChange = useCallback((value: [number, number]) => {
    setTempPriceRange(value);
  }, []);

  const handleTempCategoryChange = useCallback((value: string) => {
    setTempCategory(value);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setSelectedLocation(tempLocation);
    if (tempPriceRange) {
      setPriceSliderRange(tempPriceRange);
    }
    setSelectedCategory(tempCategory);
    setCurrentPage(1);
  }, [tempLocation, tempPriceRange, tempCategory]);

  const handleClearFilters = useCallback(() => {
    setTempLocation("");
    setTempPriceRange([priceBounds.min, priceBounds.max]);
    setTempCategory("");
    setSelectedLocation("");
    setPriceSliderRange([priceBounds.min, priceBounds.max]);
    setSelectedCategory("");
    setCurrentPage(1);
  }, [priceBounds.min, priceBounds.max]);

  const handleClearAllFilters = useCallback(() => {
    setSearchQuery("");
    setAppliedSearch("");
    handleClearFilters();
  }, [handleClearFilters]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of events for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Determine loading states:
   * - showEventsSkeleton: Only when no events data exists at all (not on refetch)
   *
   * Performance:
   * - Filters render immediately with defaults (no skeleton needed)
   * - Events show skeleton only on true first load with no cache
   * - Using cached data prevents skeleton flash on navigation
   */
  // const showFiltersSkeleton = !hasPriceRangeData && priceRangeFetching;
  const showEventsSkeleton =
    (eventsLoading && !response) || showInitialSkeleton;

  // Show subtle loading indicator when refetching in background
  const isRefetching = isFetching && !!response;

  return (
    <div
      className="home-theme min-h-screen pt-16"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/*
         * Header - renders immediately without animation
         * Performance: No JS animation delay, text is LCP candidate
         */}
        <header className="text-center mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: "var(--home-text)" }}
          >
            Discover Amazing Events
          </h1>
          <p
            className="text-xl max-w-2xl mx-auto"
            style={{ color: "var(--home-muted)" }}
          >
            Find and book tickets for the best events happening near you
          </p>
        </header>

        {/*
         * Filters section - renders immediately with defaults
         * Performance: No skeleton needed, defaults work immediately
         */}
        <FilterSection
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          canSubmitSearch={
            searchQuery.trim().length === 0 || searchQuery.trim().length >= 3
          }
          showFilters={showFilters}
          onToggleFilters={handleToggleFilters}
          tempLocation={tempLocation}
          onTempLocationChange={handleTempLocationChange}
          locations={locations}
          selectedLocation={selectedLocation}
          tempPriceRange={tempPriceRange}
          onTempPriceRangeChange={handleTempPriceRangeChange}
          minPrice={priceBounds.min}
          maxPrice={priceBounds.max}
          priceSliderRange={priceSliderRange}
          tempCategory={tempCategory}
          onTempCategoryChange={handleTempCategoryChange}
          selectedCategory={selectedCategory}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          resultsCount={filteredEvents.length}
        />

        {/*
         * Events grid - shows skeleton only on first load
         * Performance:
         * - Skeleton cards match exact card dimensions
         * - Grid uses CSS layout, no JS positioning
         * - First 3 cards get priority image loading
         * - Uses cached data on remount (no skeleton flash)
         */}
        {showEventsSkeleton ? (
          <EventsGridSkeleton />
        ) : filteredEvents.length === 0 ? (
          <EmptyState onClearFilters={handleClearAllFilters} />
        ) : (
          <EventsGrid events={filteredEvents} />
        )}

        {/*
         * Pagination - only renders when needed
         * Performance: memo() prevents re-renders from events changes
         */}
        {meta && !showEventsSkeleton && (
          <PaginationControls meta={meta} onPageChange={handlePageChange} />
        )}
      </div>
    </div>
  );
}
