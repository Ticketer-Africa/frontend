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
      refetchOnWindowFocus: (query) => {
        const queryKeys = [
          "me",
          "wallet-balance",
          "events",
          "resaleListings",
          "event",
        ];
        return queryKeys.some((key) => query.queryKey.includes(key));
      },
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
          theme="light"
          className="border border-gray-200 shadow-lg rounded-lg"
          toastOptions={{
            classNames: {
              toast: "bg-white text-gray-900 border border-gray-200 rounded-lg",
              success: "bg-green-50 text-green-800 border-green-200",
              error: "bg-red-50 text-red-800 border-red-200",
              actionButton:
                "bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-4 py-1",
              cancelButton: "bg-gray-100 text-gray-900 rounded-full px-4 py-1",
            },
          }}
        />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
