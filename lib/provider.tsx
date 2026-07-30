"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";

// Configure QueryClient with caching settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes after the query is no longer active
      gcTime: 5 * 60 * 1000,
      // Consider data stale after 30 seconds
      staleTime: 30 * 1000,
      // Retry failed queries up to 3 times, except for 401/403 errors
      retry: (failureCount, error: any) => {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          return false; // Don't retry on auth errors
        }
        return failureCount < 3;
      },
      // Per-query opt-in only — see refetchOnWindowFocus: true on individual
      // useQuery calls (e.g. useWalletBalance, useResaleListings) for queries
      // that need focus-refetch.
      refetchOnWindowFocus: false,
      // Refetch when reconnecting to the internet
      refetchOnReconnect: true,
      // Avoid refetching on mount unless data is stale
      refetchOnMount: "always",
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          theme="dark"
          className="shadow-lg rounded-lg"
          toastOptions={{
            unstyled: false,
            style: {
              background: "var(--home-card-elevated)",
              border: "1px solid var(--home-border)",
            },
            classNames: {
              toast: "rounded-lg text-[var(--home-text)]",
              success: "!text-[var(--home-success-text)]",
              error: "!text-red-400",
              actionButton:
                "bg-[var(--home-accent)] text-[var(--home-accent-fg)] rounded-full px-4 py-1",
              cancelButton:
                "bg-[var(--home-card-highlight)] text-[var(--home-muted)] rounded-full px-4 py-1",
            },
          }}
        />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
