// Web Vitals reporting for performance monitoring
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log metrics in development
    if (process.env.NODE_ENV === "development") {
      console.log(metric);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === "production") {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      });

      // Send to your analytics endpoint
      const url = "/api/analytics";

      // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
      } else {
        fetch(url, {
          body,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          keepalive: true,
        });
      }
    }
  });

  return null;
}
