import type { CSSProperties } from "react";
import Link from "next/link";
import { TrackedTicketLink } from "./tracked-ticket-link";
import { EventCountdown } from "./event-countdown";
import { SiteImage } from "./site-image";
import { sectionLabel, text, type PublicSite, type SiteDocument, type SiteSection } from "./model";
import "./event-site.css";

const color = (value: unknown, fallback: string) => typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
const fontStack = (value: unknown, fallback: "Inter" | "Space Grotesk") => {
  const allowed = ["Inter", "DM Sans", "Space Grotesk", "Playfair Display"];
  const family = typeof value === "string" && allowed.includes(value) ? value : fallback;
  return `"${family}", ${family === "Playfair Display" ? "serif" : "sans-serif"}`;
};
const align = (value: unknown) => value === "center" || value === "right" ? value : "left";
const safeUrl = (value: unknown) => typeof value === "string" && (/^https:\/\/[^\s"'()<>\\]+$/i.test(value) || /^\/[a-zA-Z0-9/_-]+$/.test(value)) ? value : null;
const items = (value: unknown): Record<string, unknown>[] => Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : [];

function TicketAction({ target, primary = false, slug, sectionId }: { target?: PublicSite["ticketTarget"]; primary?: boolean; slug?: string; sectionId: string }) {
  if (!target || target.state === "HIDDEN") return null;
  const label = target.state === "SOLD_OUT" ? "Sold out" : target.state === "CANCELLED" ? "Cancelled" : target.state === "ENDED" ? "Event ended" : target.state === "MISSING" ? "Event unavailable" : "Coming soon";
  const action = target.state === "BUY" && target.url
    ? <TrackedTicketLink href={target.url} slug={slug} sectionId={sectionId} eventId={target.eventId}>Get Tickets</TrackedTicketLink>
    : <span className="es-pill">{label}</span>;
  if (!primary) return action;
  return <div className="es-primary-target" data-testid="primary-ticket-target">
    {target.eventName && <span className="es-target-event">{target.eventName}</span>}
    {action}
  </div>;
}

function Cards({ entries }: { entries: Record<string, unknown>[] }) {
  return <div className="es-grid">{entries.map((entry, index) => <article className="es-card" key={String(entry.id ?? index)}>
    {safeUrl(entry.imageUrl) && <SiteImage src={safeUrl(entry.imageUrl)!} alt={text(entry.alt) || text(entry.name)} />}
    <h3>{text(entry.name || entry.title)}</h3><p>{text(entry.role || entry.description || entry.body)}</p>
  </article>)}</div>;
}

function SectionContent({ section, target, editions = [], slug, ticketMode }: { section: SiteSection; target?: PublicSite["ticketTarget"]; editions?: PublicSite["editions"]; slug?: string; ticketMode: SiteDocument["ticketTarget"]["mode"] }) {
  const c = section.content;
  const heading = text(c.heading);
  const body = text(c.body || c.subtitle);
  switch (section.type) {
    case "HERO": return <div className="es-hero-inner"><p className="es-eyebrow">{text(c.eyebrow) || "An event worth showing up for"}</p><h1>{heading}</h1><p className="es-lead">{body}</p>{target?.startsAt && <p className="es-event-summary"><time dateTime={target.startsAt}>{new Date(target.startsAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</time>{target.venueName && <> · {target.venueName}</>}</p>}<TicketAction target={target} primary slug={slug} sectionId={section.id} /></div>;
    case "ABOUT":
    case "RICH_CONTENT": return <div className="es-copy" data-variant={text(section.styles.variant) || "stacked"}><div><h2>{heading}</h2><p>{body}</p>{c.showCta === true && <TicketAction target={target} slug={slug} sectionId={section.id} />}</div>{safeUrl(c.imageUrl) && <SiteImage src={safeUrl(c.imageUrl)!} alt={text(c.alt) || heading} />}</div>;
    case "UPCOMING_EDITIONS": return <><h2>{heading || "Upcoming editions"}</h2><p className="es-muted">{body || "See what is coming next."}</p><div className="es-grid">{editions.map(edition => <article className="es-card" key={edition.id}><p>{new Date(edition.date).toLocaleDateString()}</p><h3>{edition.name}</h3><p>{edition.venueName}</p>{ticketMode === "NO_TICKET_CTA" ? null : edition.url ? <TrackedTicketLink href={edition.url} slug={slug} sectionId={section.id} eventId={edition.id}>Get Tickets</TrackedTicketLink> : <span className="es-pill">{edition.state === "SOLD_OUT" ? "Sold out" : "Coming soon"}</span>}</article>)}</div>{!editions.length && <p className="es-muted">New dates will be announced soon.</p>}</>;
    case "TICKET_CTA": return <div className="es-cta"><h2>{heading}</h2><p>{body}</p><TicketAction target={target} slug={slug} sectionId={section.id} /></div>;
    case "LINEUP":
    case "SPONSORS": return <><h2>{heading}</h2><Cards entries={items(c.items)} />{!items(c.items).length && <p className="es-muted">{body}</p>}</>;
    case "GALLERY": return <><h2>{heading}</h2><div className="es-gallery">{items(c.items).map((entry, index) => safeUrl(entry.imageUrl) && <figure key={String(entry.id ?? index)}><SiteImage src={safeUrl(entry.imageUrl)!} alt={text(entry.alt) || `Gallery image ${index + 1}`} />{text(entry.caption) && <figcaption>{text(entry.caption)}</figcaption>}</figure>)}</div>{!items(c.items).length && <p className="es-muted">{body}</p>}</>;
    case "SCHEDULE": return <><h2>{heading}</h2><ol className="es-list">{items(c.items).map((entry, index) => <li key={index}><strong>{text(entry.time)}</strong> {text(entry.title)} <span>{text(entry.description)}</span></li>)}</ol>{!items(c.items).length && <p className="es-muted">{body}</p>}</>;
    case "VENUE": return <><h2>{heading}</h2><p>{text(c.address) || body}</p>{safeUrl(c.mapUrl) && <a href={safeUrl(c.mapUrl)!} rel="noopener noreferrer">View location</a>}</>;
    case "FAQ": return <><h2>{heading}</h2><div className="es-faq">{items(c.items).map((entry, index) => <details key={index}><summary>{text(entry.question)}</summary><p>{text(entry.answer)}</p></details>)}</div></>;
    case "COUNTDOWN": return <><h2>{heading || "Coming up soon"}</h2><p>{body}</p><EventCountdown startsAt={target?.state === "CANCELLED" || target?.state === "MISSING" ? null : target?.startsAt ?? editions[0]?.date ?? null} eventName={target?.eventName ?? editions[0]?.name ?? null} /></>;
    case "SOCIAL_CONTACT": return <><h2>{heading}</h2><p>{body}</p><div className="es-links">{items(c.items).map((entry, index) => safeUrl(entry.url) && <a key={index} href={safeUrl(entry.url)!} rel="noopener noreferrer">{text(entry.label) || "Visit link"}</a>)}</div></>;
    case "FOOTER": return <><p className="es-footer-brand">{heading || "Event Site"}</p><p>{body}</p><div className="es-links">{items(c.items).map((entry, index) => safeUrl(entry.url) && <a key={index} href={safeUrl(entry.url)!} rel="noopener noreferrer">{text(entry.label) || "Visit link"}</a>)}</div></>;
  }
}

export function EventSiteView({ document, target, editions, preview = false, slug }: { document: SiteDocument; target?: PublicSite["ticketTarget"]; editions?: PublicSite["editions"]; preview?: boolean; slug?: string }) {
  const style: CSSProperties = {
    backgroundColor: color(document.theme.background, "#fffaf2"),
    color: color(document.theme.text, "#171717"),
    ["--es-accent" as string]: color(document.theme.accent, "#c74d33"),
    ["--es-font-body" as string]: fontStack(document.theme.fontBody, "Inter"),
    ["--es-font-heading" as string]: fontStack(document.theme.fontHeading, "Space Grotesk"),
    ["--es-content-width" as string]: document.theme.contentWidth === "full" ? "none" : document.theme.contentWidth === "wide" ? "1440px" : "1120px",
  };
  const buttonStyle = ["outline", "text"].includes(text(document.theme.buttonStyle)) ? text(document.theme.buttonStyle) : "filled";
  const buttonShape = ["square", "rounded"].includes(text(document.theme.buttonShape)) ? text(document.theme.buttonShape) : "pill";
  const sectionSpacing = ["compact", "spacious"].includes(text(document.theme.sectionSpacing)) ? text(document.theme.sectionSpacing) : "normal";
  const typeScale = ["compact", "large"].includes(text(document.theme.typeScale)) ? text(document.theme.typeScale) : "normal";
  const cornerRadius = ["square", "round"].includes(text(document.theme.cornerRadius)) ? text(document.theme.cornerRadius) : "soft";
  return <main className="es-page" style={style} data-button-style={buttonStyle} data-button-shape={buttonShape} data-section-spacing={sectionSpacing} data-heading-case={document.theme.headingCase === "uppercase" ? "uppercase" : "normal"} data-type-scale={typeScale} data-corner-radius={cornerRadius} data-shadow={document.theme.shadow === "subtle" ? "subtle" : "none"} data-testid={preview ? "site-preview" : undefined}>
    {document.sections.filter(section => !section.hidden).map(section => {
      const sectionStyle: CSSProperties & Record<string, unknown> = { textAlign: align(section.styles.alignment) };
      if (section.styles.background) sectionStyle.backgroundColor = color(section.styles.background, "transparent");
      if (section.styles.textColor) sectionStyle.color = color(section.styles.textColor, "inherit");
      if (section.styles.spacing === "compact") sectionStyle.paddingBlock = "2.5rem";
      if (section.styles.spacing === "spacious") sectionStyle.paddingBlock = "8rem";
      if (section.type === "HERO" && safeUrl(section.content.imageUrl)) {
        const overlay = section.styles.overlay === "low" ? 0.25 : section.styles.overlay === "high" ? 0.75 : 0.55;
        sectionStyle.backgroundImage = `linear-gradient(90deg, rgba(0,0,0,${overlay}), rgba(0,0,0,.1)), url("${safeUrl(section.content.imageUrl)}")`;
        sectionStyle.backgroundPosition = align(section.styles.mediaPosition);
        sectionStyle.color = "white";
      }
      if (section.styles.layout === "wide") sectionStyle["--es-section-width" as string] = "1440px";
      if (section.styles.layout === "full") sectionStyle["--es-section-width" as string] = "none";
      if (section.styles.layout === "contained") sectionStyle["--es-section-width" as string] = "1120px";
      return <section key={section.id} data-section-type={section.type} data-hide-mobile={section.styles.hideOnMobile === true ? "true" : undefined} data-mobile-alignment={align(section.styles.mobileAlignment)} aria-label={sectionLabel(section.type)} className={`es-section es-${section.type.toLowerCase().replaceAll("_", "-")}`} style={sectionStyle}>
        <div className="es-inner"><SectionContent section={section} target={document.ticketTarget.mode === "NEXT_EVENT" || document.ticketTarget.mode === "SPECIFIC_EVENT" ? target : undefined} editions={editions} slug={preview ? undefined : slug} ticketMode={document.ticketTarget.mode} /></div>
      </section>;
    })}
  </main>;
}
