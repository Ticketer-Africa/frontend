/**
 * API Configuration
 * Centralized management of API versions and endpoints
 * Each service specifies its own API version
 */

/**
 * Build versioned endpoint path
 * @param version - API version (e.g., "v1", "v2", "v3")
 * @param endpoint - The endpoint path (e.g., "events", "tickets/buy")
 * @returns The full versioned path (e.g., "/v2/events")
 */
export const buildEndpoint = (version: string, endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `/${version}/${cleanEndpoint}`;
};
