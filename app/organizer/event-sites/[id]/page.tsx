"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { EventSiteView } from "@/components/event-sites/event-site-view";
import { applySiteThemeDefaults, newSection, sectionLabel, SECTION_OPTIONS, TICKETER_SITE_THEME, text, type PublicSite, type SiteDocument, type SiteRecord, type SiteSection, type SectionType } from "@/components/event-sites/model";
import { confirmSiteMedia, getSite, getSiteAnalytics, getSiteBillingStatus, startSiteProCheckout, publishSite, saveSite, unpublishSite } from "@/services/event-sites/event-sites";
import { uploadImageToS3 } from "@/services/uploads/images";
import { getOrganizerEventsV2 } from "@/services/events/events-v2";
import type { EventV2 } from "@/types/events-v2.type";
import "../site-builder.css";

const field = (name: string, value: string, onChange: (value: string) => void, multiline = false) => <label className="esb-field">{name}{multiline
  ? <textarea aria-label={name} value={value} onChange={event => onChange(event.target.value)} rows={4} />
  : <input aria-label={name} value={value} onChange={event => onChange(event.target.value)} />}</label>;
const FONT_OPTIONS = ["Inter", "DM Sans", "Space Grotesk", "Playfair Display"] as const;
function contrastRatio(first: string, second: string) {
  const luminance = (hex: string) => {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return 0;
    const channels = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
function accentForeground(accent: string) {
  return contrastRatio(accent, "#5a0d02") > contrastRatio(accent, "#ffffff") ? "#5a0d02" : "#ffffff";
}

function previewCommerce(document: SiteDocument, events: EventV2[]): Pick<PublicSite, "editions" | "ticketTarget"> {
  const now = Date.now();
  const linked = events.filter(event => document.linkedEditionIds.includes(event.id));
  const upcoming = linked.filter(event => event.isActive && event.accessType === "PUBLIC" && new Date(event.date).getTime() > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id.localeCompare(b.id));
  const status = (event: EventV2) => !event.ticketCategories?.length ? "COMING_SOON" as const
    : event.ticketCategories.every(category => (category.minted ?? 0) >= category.maxTickets) ? "SOLD_OUT" as const : "BUY" as const;
  const editions = upcoming.map(event => ({ id: event.id, name: event.name, date: event.date, venueName: event.venueName ?? null, state: status(event), url: status(event) === "BUY" ? `/events/${event.slug}` : null }));
  const selected = document.ticketTarget.mode === "SPECIFIC_EVENT"
    ? linked.find(event => event.id === document.ticketTarget.eventId) : document.ticketTarget.mode === "NEXT_EVENT" ? upcoming[0] : undefined;
  const state = selected ? !selected.isActive || selected.accessType !== "PUBLIC" ? "CANCELLED" as const
    : new Date(selected.date).getTime() <= now ? "ENDED" as const : status(selected)
    : document.ticketTarget.mode === "SPECIFIC_EVENT" ? "MISSING" as const : document.ticketTarget.fallback === "HIDE_CTA" ? "HIDDEN" as const : "COMING_SOON" as const;
  return { editions, ticketTarget: { eventId: selected?.id ?? null, eventName: selected?.name ?? null, startsAt: selected?.date ?? null, venueName: selected?.venueName ?? null, state, url: selected && state === "BUY" ? `/events/${selected.slug}` : null } };
}

export default function EventSiteBuilder() {
  const id = String(useParams().id);
  const [site, setSite] = useState<SiteRecord | null>(null);
  const [document, setDocument] = useState<SiteDocument | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [billingPrice, setBillingPrice] = useState("$20.00/month");
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingError, setBillingError] = useState("");
  const [billingNotice, setBillingNotice] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showUnpublish, setShowUnpublish] = useState(false);
  const [view, setView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [status, setStatus] = useState("Loading");
  const [error, setError] = useState("");
  const [events, setEvents] = useState<EventV2[]>([]);
  const [analytics, setAnalytics] = useState<{ uniqueVisitors: number; pageViews: number; ticketCtaClicks: number } | null>(null);
  const docRef = useRef<SiteDocument | null>(null);
  const savedJsonRef = useRef("");
  const revisionRef = useRef(0);
  const pendingSave = useRef<Promise<void> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoStack = useRef<SiteDocument[]>([]);

  useEffect(() => {
    getSite(id).then(value => {
      const initialDocument = applySiteThemeDefaults(value.document);
      setSite({ ...value, document: initialDocument }); setDocument(initialDocument); docRef.current = initialDocument;
      revisionRef.current = value.draftRevision;
      savedJsonRef.current = JSON.stringify(value.document);
      setSelectedId(value.document.sections[0]?.id ?? null);
      setStatus("Saved");
    }).catch(() => { setError("Could not load this site."); setStatus("Error"); });
    getOrganizerEventsV2().then(result => setEvents(Array.isArray(result) ? result : result?.data ?? [])).catch(() => {});
    getSiteAnalytics(id).then(setAnalytics).catch(() => {});
    getSiteBillingStatus(id).then(value => {
      const symbol = value.price.currency === "USD" ? "$" : `${value.price.currency} `;
      setBillingPrice(`${symbol}${value.price.amount}/month`);
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("billing") !== "return") return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const refresh = async () => {
      try {
        const billing = await getSiteBillingStatus(id);
        if (stopped) return;
        if (billing.plan === "PRO" && billing.proExpiresAt && new Date(billing.proExpiresAt).getTime() > Date.now()) {
          setBillingNotice("Pro active. Click Publish when your draft is ready.");
          return;
        }
      } catch { /* Keep the draft available while payment confirmation is pending. */ }
      if (!stopped && ++attempts < 30) {
        setBillingNotice("Waiting for Pro activation. Your draft is saved.");
        timer = setTimeout(refresh, 2000);
      }
    };
    void refresh();
    return () => { stopped = true; if (timer) clearTimeout(timer); };
  }, [id]);

  const change = useCallback((update: (document: SiteDocument) => SiteDocument) => {
    if (!docRef.current) return;
    const previous = docRef.current;
    const next = update(previous);
    if (next === previous) return;
    undoStack.current = [...undoStack.current.slice(-49), previous];
    docRef.current = next;
    setDocument(next);
    setStatus("Unsaved changes");
  }, []);

  function undo() {
    const previous = undoStack.current.pop();
    if (!previous) return;
    docRef.current = previous;
    setDocument(previous);
    setStatus("Unsaved changes");
  }

  const persist = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    if (pendingSave.current) return pendingSave.current;
    const operation = (async () => {
      while (docRef.current && JSON.stringify(docRef.current) !== savedJsonRef.current) {
        const snapshot = docRef.current;
        const snapshotJson = JSON.stringify(snapshot);
        setStatus("Saving");
        try {
          const result = await saveSite(id, snapshot, revisionRef.current);
          revisionRef.current = result.draftRevision;
          savedJsonRef.current = snapshotJson;
          setStatus(JSON.stringify(docRef.current) === snapshotJson ? "Saved" : "Unsaved changes");
        } catch (cause) {
          setStatus("Error");
          setError("Draft could not be saved. Your changes are still here; retry before publishing.");
          throw cause;
        }
      }
    })();
    pendingSave.current = operation;
    try { await operation; } finally { pendingSave.current = null; }
  }, [id]);

  useEffect(() => {
    if (!document || JSON.stringify(document) === savedJsonRef.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void persist().catch(() => {}); }, 800);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [document, persist]);

  async function publish() {
    setError("");
    try {
      await persist();
      await publishSite(id, revisionRef.current);
      const refreshed = await getSite(id);
      setSite(refreshed);
      setStatus("Published");
    } catch (cause: unknown) {
      const response = cause as { response?: { status?: number } };
      if (response.response?.status === 403) setUpgradeOpen(true);
      else setError("Could not publish. Check the site settings and try again.");
    }
  }

  async function unpublish() {
    await unpublishSite(id);
    setSite(value => value && { ...value, status: "UNPUBLISHED" });
    setShowUnpublish(false);
  }

  function editSection(sectionId: string, update: (section: SiteSection) => SiteSection) {
    change(doc => ({ ...doc, sections: doc.sections.map(section => section.id === sectionId ? update(section) : section) }));
  }
  function editItem(section: SiteSection, index: number, key: string, value: string) {
    editSection(section.id, original => {
      const current = Array.isArray(original.content.items) ? original.content.items as Record<string, unknown>[] : [];
      const next = current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item);
      return { ...original, content: { ...original.content, items: next } };
    });
  }
  async function uploadImage(file: File, onReady: (url: string) => void) {
    setError("");
    setStatus("Uploading image");
    try {
      const key = await uploadImageToS3(file, "images/event-sites");
      const media = await confirmSiteMedia(id, key);
      onReady(media.url);
    } catch (cause) {
      setStatus("Upload failed");
      setError(cause instanceof Error ? cause.message : "Image upload failed. Please try again.");
    }
  }
  function move(index: number, direction: number) {
    change(doc => {
      const sections = [...doc.sections];
      const target = index + direction;
      if (target < 0 || target >= sections.length) return doc;
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...doc, sections };
    });
  }
  function dropSection(draggedId: string, targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    change(doc => {
      const sections = [...doc.sections];
      const from = sections.findIndex(section => section.id === draggedId);
      const to = sections.findIndex(section => section.id === targetId);
      if (from < 0 || to < 0) return doc;
      const [moved] = sections.splice(from, 1);
      sections.splice(to, 0, moved);
      return { ...doc, sections };
    });
  }
  const selected = document?.sections.find(section => section.id === selectedId);
  if (!document) return <main className="esb-empty">{error || "Loading Event Site..."}</main>;
  const preview = previewCommerce(document, events);

  return <main className="esb-shell">
    <header className="esb-top"><Link href="/organizer/event-sites">← Event Sites</Link><strong>{document.name}</strong><span>{site?.status ?? "DRAFT"}</span><span role="status" aria-label="Save status">{status}</span>
      <Button type="button" variant="homeOutline" size="sm" onClick={() => void persist().catch(() => {})}>Save draft</Button>
      <Button type="button" variant="homeOutline" size="sm" onClick={undo} disabled={!undoStack.current.length}>Undo</Button>
      <Link href={`/organizer/event-sites/${encodeURIComponent(id)}/analytics`}>Analytics</Link>
      <Link href={`/organizer/event-sites/${encodeURIComponent(id)}/preview`} target="_blank">Open preview</Link>
      {site?.status === "PUBLISHED" && <><Link href={`/e/${site.slug}`} target="_blank">View live</Link><Button type="button" variant="homeOutline" size="sm" onClick={() => setShowUnpublish(true)}>Unpublish</Button></>}
      <Button className="esb-primary" type="button" variant="homeAccent" size="sm" onClick={() => void publish()}>Publish</Button>
    </header>
    {billingNotice && <p className="esb-hint" role="status" aria-label="Billing status">{billingNotice}</p>}
    {error && <p className="esb-error" role="alert">{error}</p>}
    <div className="esb-main">
      <aside className="esb-panel"><h2>Sections</h2><p className="esb-hint">Drag sections to reorder, or use the arrow buttons.</p><ol aria-label="Sections" className="esb-section-list">{document.sections.map((section, index) => <li key={section.id} data-section-id={section.id} draggable onDragStart={event => event.dataTransfer.setData("text/plain", section.id)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); dropSection(event.dataTransfer.getData("text/plain"), section.id); }}>
        <Button type="button" variant="ghost" size="default" className={`esb-section-select ${selectedId === section.id ? "esb-selected" : ""}`} onClick={() => setSelectedId(section.id)}>{sectionLabel(section.type)}{section.hidden ? " (hidden)" : ""}</Button>
        <div className="esb-actions"><Button variant="homeOutline" size="icon" aria-label="Move section up" disabled={index === 0} onClick={() => move(index, -1)}>↑</Button><Button variant="homeOutline" size="icon" aria-label="Move section down" disabled={index === document.sections.length - 1} onClick={() => move(index, 1)}>↓</Button><Button variant="homeOutline" size="icon" aria-label="Duplicate section" onClick={() => change(doc => { const sections = [...doc.sections]; sections.splice(index + 1, 0, { ...section, id: crypto.randomUUID(), content: { ...section.content }, styles: { ...section.styles } }); return { ...doc, sections }; })}>＋</Button><Button variant="homeOutline" size="icon" aria-label={section.hidden ? "Show section" : "Hide section"} onClick={() => editSection(section.id, item => ({ ...item, hidden: !item.hidden }))}>{section.hidden ? "◉" : "◎"}</Button><Button variant="homeOutline" size="icon" aria-label="Delete section" onClick={() => setDeleteId(section.id)}>×</Button></div>
      </li>)}</ol><Button type="button" variant="homeAccent" className="esb-add" onClick={() => setLibraryOpen(true)}>Add section</Button></aside>
      <div className="esb-preview-wrap"><div className="esb-preview-toolbar"><strong>Preview</strong><div>{(["desktop", "tablet", "mobile"] as const).map(option => <Button key={option} type="button" variant={view === option ? "homeAccent" : "homeOutline"} size="sm" aria-pressed={view === option} onClick={() => setView(option)}>{option}</Button>)}</div></div><div className={`esb-preview esb-${view}`}><EventSiteView document={document} target={preview.ticketTarget} editions={preview.editions} preview /></div></div>
      <aside className="esb-panel esb-settings"><h2>Settings</h2>
        {analytics && <div className="esb-analytics" aria-label="Site analytics"><strong>Last 30 days</strong><p><b>{analytics.uniqueVisitors.toLocaleString()}</b> unique visitors · <b>{analytics.pageViews.toLocaleString()}</b> page views · <b>{analytics.ticketCtaClicks.toLocaleString()}</b> ticket clicks</p><small>Visitors are estimated from browser IDs. Preview visits are excluded.</small></div>}
        {field("Site name", document.name, value => change(doc => ({ ...doc, name: value })))}
        {field("Site slug", document.slug, value => change(doc => ({ ...doc, slug: value.toLowerCase() })))}
        {field("Page title", text(document.seo.title), value => change(doc => ({ ...doc, seo: { ...doc.seo, title: value } })))}
        {field("Meta description", text(document.seo.description), value => change(doc => ({ ...doc, seo: { ...doc.seo, description: value } })), true)}
        {field("Social sharing image URL", text(document.seo.imageUrl), value => change(doc => ({ ...doc, seo: { ...doc.seo, imageUrl: value } })))}
        <label className="esb-field">Upload social sharing image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) void uploadImage(file, url => change(doc => ({ ...doc, seo: { ...doc.seo, imageUrl: url } }))); }} /></label>
        <h3>Theme</h3>{(["background", "text", "accent"] as const).map(key => <label className="esb-field" key={key}>{key}<input aria-label={`${key} color`} type="color" value={/^#[0-9a-fA-F]{6}$/.test(text(document.theme[key])) ? text(document.theme[key]) : TICKETER_SITE_THEME[key]} onChange={event => change(doc => ({ ...doc, theme: { ...doc.theme, [key]: event.target.value } }))} /></label>)}
        {contrastRatio(text(document.theme.background) || TICKETER_SITE_THEME.background, text(document.theme.text) || TICKETER_SITE_THEME.text) < 4.5 && <p role="alert" className="esb-warning">Page text may be hard to read against the background. Choose colors with stronger contrast.</p>}
        {document.theme.buttonStyle !== "outline" && document.theme.buttonStyle !== "text" && contrastRatio(text(document.theme.accent) || TICKETER_SITE_THEME.accent, accentForeground(text(document.theme.accent) || TICKETER_SITE_THEME.accent)) < 4.5 && <p role="alert" className="esb-warning">Button text may be hard to read. Choose a darker accent color.</p>}
        <label className="esb-field">Body font<select aria-label="Body font" value={FONT_OPTIONS.includes(text(document.theme.fontBody) as typeof FONT_OPTIONS[number]) ? text(document.theme.fontBody) : "Inter"} onChange={event => change(doc => ({ ...doc, theme: { ...doc.theme, fontBody: event.target.value } }))}>{FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}</select></label>
        <label className="esb-field">Heading font<select aria-label="Heading font" value={FONT_OPTIONS.includes(text(document.theme.fontHeading) as typeof FONT_OPTIONS[number]) ? text(document.theme.fontHeading) : "Space Grotesk"} onChange={event => change(doc => ({ ...doc, theme: { ...doc.theme, fontHeading: event.target.value } }))}>{FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}</select></label>
        {([ ["contentWidth", "Content width", ["contained", "wide", "full"]], ["buttonStyle", "Button style", ["filled", "outline", "text"]], ["buttonShape", "Button shape", ["square", "rounded", "pill"]], ["sectionSpacing", "Section spacing", ["compact", "normal", "spacious"]], ["headingCase", "Heading case", ["normal", "uppercase"]], ["typeScale", "Type scale", ["compact", "normal", "large"]], ["cornerRadius", "Corner radius", ["square", "soft", "round"]], ["shadow", "Card shadow", ["none", "subtle"]] ] as const).map(([key, label, options]) => <label className="esb-field" key={key}>{label}<select aria-label={label} value={text(document.theme[key]) || options[0]} onChange={event => change(doc => ({ ...doc, theme: { ...doc.theme, [key]: event.target.value } }))}>{options.map(option => <option key={option} value={option}>{option}</option>)}</select></label>)}
        <h3>Ticket target</h3><label className="esb-field">Target mode<select aria-label="Target mode" value={document.ticketTarget.mode} onChange={event => change(doc => ({ ...doc, ticketTarget: { mode: event.target.value as SiteDocument["ticketTarget"]["mode"] } }))}><option value="NO_TICKET_CTA">No ticket button</option><option value="NEXT_EVENT">Next event</option><option value="SPECIFIC_EVENT">Specific event</option><option value="EVENT_LIST">Event list</option></select></label>
        {document.ticketTarget.mode === "NEXT_EVENT" && <label className="esb-field">No upcoming edition<select aria-label="No upcoming edition" value={document.ticketTarget.fallback || "COMING_SOON"} onChange={event => change(doc => ({ ...doc, ticketTarget: { ...doc.ticketTarget, fallback: event.target.value as "COMING_SOON" | "HIDE_CTA" } }))}><option value="COMING_SOON">Show coming soon</option><option value="HIDE_CTA">Hide ticket button</option></select></label>}
        <fieldset><legend>Linked editions</legend>{events.length ? events.map(event => <label className="esb-event" key={event.id}><input type="checkbox" checked={document.linkedEditionIds.includes(event.id)} onChange={input => change(doc => ({ ...doc, linkedEditionIds: input.target.checked ? [...doc.linkedEditionIds, event.id] : doc.linkedEditionIds.filter(item => item !== event.id), ticketTarget: doc.ticketTarget.eventId === event.id && !input.target.checked ? { mode: "NO_TICKET_CTA" } : doc.ticketTarget }))} />{event.name}</label>) : <p>No event editions found. You can publish a coming-soon site.</p>}</fieldset>
        {document.ticketTarget.mode === "SPECIFIC_EVENT" && <label className="esb-field">Selected edition<select aria-label="Selected edition" value={document.ticketTarget.eventId ?? ""} onChange={event => change(doc => ({ ...doc, ticketTarget: { mode: "SPECIFIC_EVENT", eventId: event.target.value } }))}><option value="">Select an edition</option>{events.filter(event => document.linkedEditionIds.includes(event.id)).map(event => <option value={event.id} key={event.id}>{event.name}</option>)}</select></label>}
        {selected && <><h3>{sectionLabel(selected.type)}</h3>{(["heading", "subtitle", "body", "address", "imageUrl", "mapUrl"] as const).map(key => selected.content[key] !== undefined || key === "heading" ? <div key={key}>{field(key === "heading" && selected.type === "HERO" ? "Hero heading" : key, text(selected.content[key]), value => editSection(selected.id, section => ({ ...section, content: { ...section.content, [key]: value } })), key === "body")}</div> : null)}
          {(["HERO", "ABOUT", "RICH_CONTENT"] as SectionType[]).includes(selected.type) && <label className="esb-field">Upload section image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) void uploadImage(file, url => editSection(selected.id, section => ({ ...section, content: { ...section.content, imageUrl: url } }))); }} /></label>}
          {(["ABOUT", "RICH_CONTENT"] as SectionType[]).includes(selected.type) && <label className="esb-field"><input type="checkbox" checked={selected.content.showCta === true} onChange={event => editSection(selected.id, section => ({ ...section, content: { ...section.content, showCta: event.target.checked } }))} />Show ticket button</label>}
          <label className="esb-field">{selected.type === "HERO" ? "Hero alignment" : "Alignment"}<select aria-label={selected.type === "HERO" ? "Hero alignment" : "Alignment"} value={text(selected.styles.alignment) || "left"} onChange={event => editSection(selected.id, section => ({ ...section, styles: { ...section.styles, alignment: event.target.value } }))}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
          {(["background", "textColor"] as const).map(key => <label className="esb-field" key={key}>Section {key}<input type="color" aria-label={`Section ${key}`} value={/^#[0-9a-fA-F]{6}$/.test(text(selected.styles[key])) ? text(selected.styles[key]) : key === "background" ? TICKETER_SITE_THEME.background : TICKETER_SITE_THEME.text} onChange={event => editSection(selected.id, section => ({ ...section, styles: { ...section.styles, [key]: event.target.value } }))} /></label>)}
          <label className="esb-field">Section spacing<select aria-label="Section spacing" value={text(selected.styles.spacing) || "normal"} onChange={event => editSection(selected.id, section => ({ ...section, styles: { ...section.styles, spacing: event.target.value } }))}><option value="compact">Compact</option><option value="normal">Normal</option><option value="spacious">Spacious</option></select></label>
          <label className="esb-field">Section width<select aria-label="Section width" value={text(selected.styles.layout) || "contained"} onChange={event => editSection(selected.id, section => ({ ...section, styles: { ...section.styles, layout: event.target.value } }))}><option value="contained">Contained</option><option value="wide">Wide</option><option value="full">Full width</option></select></label>
          {(["ABOUT", "RICH_CONTENT"] as SectionType[]).includes(selected.type) && <label className="esb-field">Image layout<select aria-label="Image layout" value={text(selected.styles.variant) || "stacked"} onChange={event => editSection(selected.id, section => ({ ...section, styles: { ...section.styles, variant: event.target.value } }))}><option value="stacked">Stacked</option><option value="image-left">Image left</option><option value="image-right">Image right</option></select></label>}
          {selected.type === "HERO" && <><label className="esb-field">Image position<select aria-label="Image position" value={text(selected.styles.mediaPosition) || "center"} onChange={event => editSection(selected.id, section => ({ ...section, styles: { ...section.styles, mediaPosition: event.target.value } }))}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label><label className="esb-field">Image overlay<select aria-label="Image overlay" value={text(selected.styles.overlay) || "medium"} onChange={event => editSection(selected.id, section => ({ ...section, styles: { ...section.styles, overlay: event.target.value } }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></>}
          <label className="esb-field">Mobile alignment<select aria-label="Mobile alignment" value={text(selected.styles.mobileAlignment) || "left"} onChange={event => editSection(selected.id, section => ({ ...section, styles: { ...section.styles, mobileAlignment: event.target.value } }))}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
          <label className="esb-field"><input type="checkbox" checked={selected.styles.hideOnMobile === true} onChange={event => editSection(selected.id, section => ({ ...section, styles: { ...section.styles, hideOnMobile: event.target.checked } }))} />Hide on mobile</label>
          {(["FAQ", "SCHEDULE", "LINEUP", "SPONSORS", "GALLERY", "SOCIAL_CONTACT", "FOOTER"] as SectionType[]).includes(selected.type) && <><h3>Items</h3>{(Array.isArray(selected.content.items) ? selected.content.items as Record<string, unknown>[] : []).map((item, index) => <div className="esb-item" key={index}>
            {(selected.type === "FAQ" ? ["question", "answer"] : selected.type === "SCHEDULE" ? ["time", "title", "description"] : selected.type === "GALLERY" ? ["imageUrl", "alt"] : selected.type === "SOCIAL_CONTACT" || selected.type === "FOOTER" ? ["label", "url"] : ["name", "role", "imageUrl", "url"]).map(key => <div key={key}>{field(key, text(item[key]), value => editItem(selected, index, key, value), key === "answer" || key === "description")}</div>)}
            {(["GALLERY", "LINEUP", "SPONSORS"] as SectionType[]).includes(selected.type) && <label className="esb-field">Upload item image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) void uploadImage(file, url => editItem(selected, index, "imageUrl", url)); }} /></label>}
            <button type="button" onClick={() => editSection(selected.id, section => ({ ...section, content: { ...section.content, items: (Array.isArray(section.content.items) ? section.content.items : []).filter((_, itemIndex) => itemIndex !== index) } }))}>Remove item</button>
          </div>)}<button type="button" onClick={() => editSection(selected.id, section => ({ ...section, content: { ...section.content, items: [...(Array.isArray(section.content.items) ? section.content.items : []), {}] } }))}>Add item</button></>}
        </>}
      </aside>
    </div>
    {libraryOpen && <div className="esb-modal-backdrop"><div role="dialog" aria-modal="true" aria-label="Section library" className="esb-modal"><h2>Add a section</h2><div className="esb-library">{SECTION_OPTIONS.map(([type, label]) => <button key={type} type="button" onClick={() => { const section = newSection(type as SectionType); change(doc => ({ ...doc, sections: [...doc.sections, section] })); setSelectedId(section.id); setLibraryOpen(false); }}>{label}</button>)}</div><button onClick={() => setLibraryOpen(false)}>Close</button></div></div>}
    {deleteId && <div className="esb-modal-backdrop"><div role="dialog" aria-modal="true" aria-label="Delete section" className="esb-modal"><h2>Delete this section?</h2><p>You can add another section later.</p><button onClick={() => setDeleteId(null)}>Cancel</button> <button onClick={() => { change(doc => ({ ...doc, sections: doc.sections.filter(section => section.id !== deleteId) })); setDeleteId(null); }}>Delete</button></div></div>}
    {showUnpublish && <div className="esb-modal-backdrop"><div role="dialog" aria-modal="true" aria-label="Unpublish Event Site" className="esb-modal"><h2>Unpublish this site?</h2><p>The public page will be hidden. Your draft stays saved.</p><button onClick={() => setShowUnpublish(false)}>Cancel</button> <button onClick={() => void unpublish()}>Confirm</button></div></div>}
    {upgradeOpen && <div className="esb-modal-backdrop"><div role="dialog" aria-modal="true" aria-label="Upgrade to Pro" className="esb-modal"><h2>Publish with Pro</h2><p>Your draft is saved. Pro is {billingPrice}, billed through Bachs. After checkout activates Pro, click Publish to put this draft live.</p>{billingError && <p role="alert">{billingError}</p>}<button disabled={billingBusy} onClick={async () => { setBillingBusy(true); setBillingError(""); try { const result = await startSiteProCheckout(id); window.location.assign(result.checkoutUrl); } catch { setBillingError("Could not start checkout. Please try again."); setBillingBusy(false); } }}>{billingBusy ? "Opening checkout…" : `Upgrade for ${billingPrice}`}</button><button onClick={() => setUpgradeOpen(false)}>Keep editing</button></div></div>}
  </main>;
}
