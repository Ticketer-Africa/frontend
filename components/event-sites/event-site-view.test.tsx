import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EventSiteView } from "./event-site-view";
import { SECTION_OPTIONS, type SiteDocument } from "./model";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

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

  it("names the selected nearest edition inside the primary ticket action", () => {
    const changed = structuredClone(document);
    changed.ticketTarget = { mode: "NEXT_EVENT" };
    const html = renderToStaticMarkup(<EventSiteView document={changed} target={{ eventId: "edition-1", eventName: "Nearest Friday", state: "BUY", url: "/events/nearest-friday" }} />);
    expect(html).toContain('data-testid="primary-ticket-target"');
    expect(html).toContain("Nearest Friday");
    expect(html).toContain('href="/events/nearest-friday"');
  });

  it("shows edition cards without a misleading primary action in event-list mode", () => {
    const changed = structuredClone(document);
    changed.ticketTarget = { mode: "EVENT_LIST" };
    const html = renderToStaticMarkup(<EventSiteView document={changed}
      target={{ eventId: null, eventName: null, state: "COMING_SOON", url: null }}
      editions={[{ id: "one", name: "Friday One", date: "2026-10-10T18:00:00.000Z", venueName: "Hall", state: "BUY", url: "/events/friday-one" }]} />);
    expect(html).toContain("Friday One");
    expect(html).toContain('href="/events/friday-one"');
    expect(html).not.toContain('data-testid="primary-ticket-target"');
  });

  it("keeps a linked edition informational when ticket buttons are disabled", () => {
    const changed = structuredClone(document);
    const html = renderToStaticMarkup(<EventSiteView document={changed}
      editions={[{ id: "one", name: "Friday One", date: "2026-10-10T18:00:00.000Z", venueName: "Hall", state: "BUY", url: "/events/friday-one" }]} />);
    expect(html).toContain("Friday One");
    expect(html).not.toContain("Get Tickets");
  });
});
