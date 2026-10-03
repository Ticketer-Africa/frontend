import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteAnalytics } from "./site-analytics";

describe("SiteAnalytics", () => {
  it("shows the reporting window, distinct visitors and page views separately", () => {
    const html = renderToStaticMarkup(<SiteAnalytics windowDays={30} uniqueVisitors={2} pageViews={4} />);
    expect(html).toContain("Last 30 days");
    expect(html).toContain('data-testid="unique-visitors">2');
    expect(html).toContain('data-testid="site-views">4');
  });
});
