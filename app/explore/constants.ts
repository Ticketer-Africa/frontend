/**
 * Static constants extracted to avoid recreation on each render
 * Performance: These values never change, so keeping them outside components
 * prevents unnecessary allocations during React reconciliation
 */

export const CATEGORIES = [
  "Music",
  "Concert",
  "Conference",
  "Workshop",
  "Sports",
  "Comedy",
  "Theatre",
  "Festival",
  "Exhibition",
  "Religion",
  "Networking",
  "Tech",
  "Fashion",
  "Party",
] as const;

/**
 * Default price range fallbacks when API fails
 * These should match reasonable expectations for the market
 */
export const DEFAULT_MIN_PRICE = 0;
export const DEFAULT_MAX_PRICE = 100000;

/**
 * Debounce delay for search input in milliseconds
 * 500ms provides good balance between responsiveness and API call reduction
 */
export const SEARCH_DEBOUNCE_MS = 500;

/**
 * Fixed dimensions for event card images
 * CRITICAL FOR CLS: These must match the actual rendered dimensions
 * to prevent layout shift when images load
 */
export const EVENT_IMAGE_WIDTH = 400;
export const EVENT_IMAGE_HEIGHT = 192; // h-48 = 12rem = 192px

/**
 * Price slider step increment
 */
export const PRICE_SLIDER_STEP = 100;
