import { describe, expect, it } from "vitest";
import { getSitemapApiUrl } from "./sitemap-api-url";

describe("getSitemapApiUrl", () => {
  it("uses the configured API base URL and adds https when the value has no scheme", () => {
    expect(
      getSitemapApiUrl({
        NEXT_PUBLIC_API_BASE_URL: "api.ticketer.africa",
        NEXT_PUBLIC_API_URL: "https://legacy.example.com",
      })
    ).toBe("https://api.ticketer.africa");
  });
});
