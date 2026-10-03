import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EventSiteView } from "./event-site-view";
import { SECTION_OPTIONS, type SiteDocument } from "./model";

const document: SiteDocument = {
  schemaVersion: 1,
  name: "Friday Sessions",
  slug: "friday-sessions",
  theme: { background: "#ffffff", text: "#141414" },
  seo: { title: "Friday Sessions" },
  sections: SECTION_OPTIONS.map(([type], index) => ({
    id: `section-${index}`, type, hidden: false,
    content: { heading: type === "HERO" ? "Friday Sessions" : `Section ${index}`, body: "Join us." },
    styles: { alignment: "left" },
  })),
  linkedEditionIds: [], ticketTarget: { mode: "NO_TICKET_CTA" },
};

describe("EventSiteView", () => {
  it("renders every supported section in order and leaves an informational site without a ticket action", () => {
    const html = renderToStaticMarkup(<EventSiteView document={document} />);
    expect((html.match(/data-section-type=/g) ?? [])).toHaveLength(14);
    expect(html.indexOf('data-section-type="HERO"')).toBeLessThan(html.indexOf('data-section-type="FOOTER"'));
    expect(html).toContain("Friday Sessions");
    expect(html).not.toContain("Get Tickets");
  });

  it("does not turn untrusted text or an unsafe image URL into markup", () => {
    const changed = structuredClone(document);
    changed.sections[0].content.heading = '<img src=x onerror=alert(1)>';
    changed.sections[0].content.imageUrl = 'https://example.com/x\\" ); background:url(javascript:alert(1))';
    const html = renderToStaticMarkup(<EventSiteView document={changed} />);
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).not.toContain("background-image:");
  });
});
