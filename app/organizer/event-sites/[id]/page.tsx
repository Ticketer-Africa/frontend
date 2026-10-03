"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EventSiteView } from "@/components/event-sites/event-site-view";
import { newSection, sectionLabel, SECTION_OPTIONS, text, type SiteDocument, type SiteRecord, type SiteSection, type SectionType } from "@/components/event-sites/model";
import { getSite, getSiteAnalytics, publishSite, saveSite, unpublishSite } from "@/services/event-sites/event-sites";
import { getOrganizerEventsV2 } from "@/services/events/events-v2";
import type { EventV2 } from "@/types/events-v2.type";
import "../site-builder.css";

const field = (name: string, value: string, onChange: (value: string) => void, multiline = false) => <label className="esb-field">{name}{multiline
  ? <textarea aria-label={name} value={value} onChange={event => onChange(event.target.value)} rows={4} />
  : <input aria-label={name} value={value} onChange={event => onChange(event.target.value)} />}</label>;

export default function EventSiteBuilder() {
  const id = String(useParams().id);
  const [site, setSite] = useState<SiteRecord | null>(null);
  const [document, setDocument] = useState<SiteDocument | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showUnpublish, setShowUnpublish] = useState(false);
  const [view, setView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [status, setStatus] = useState("Loading");
  const [error, setError] = useState("");
  const [events, setEvents] = useState<EventV2[]>([]);
  const [analytics, setAnalytics] = useState<{ uniqueVisitors: number; pageViews: number } | null>(null);
  const docRef = useRef<SiteDocument | null>(null);
  const savedJsonRef = useRef("");
  const revisionRef = useRef(0);
  const pendingSave = useRef<Promise<void> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getSite(id).then(value => {
      setSite(value); setDocument(value.document); docRef.current = value.document;
      revisionRef.current = value.draftRevision;
      savedJsonRef.current = JSON.stringify(value.document);
      setSelectedId(value.document.sections[0]?.id ?? null);
      setStatus("Saved");
    }).catch(() => { setError("Could not load this site."); setStatus("Error"); });
    getOrganizerEventsV2().then(result => setEvents(Array.isArray(result) ? result : result?.data ?? [])).catch(() => {});
    getSiteAnalytics(id).then(setAnalytics).catch(() => {});
  }, [id]);

  const change = useCallback((update: (document: SiteDocument) => SiteDocument) => {
    if (!docRef.current) return;
    const next = update(docRef.current);
    docRef.current = next;
    setDocument(next);
    setStatus("Unsaved changes");
  }, []);

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
    const current = Array.isArray(section.content.items) ? section.content.items as Record<string, unknown>[] : [];
    const next = current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item);
    editSection(section.id, original => ({ ...original, content: { ...original.content, items: next } }));
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
  const selected = document?.sections.find(section => section.id === selectedId);
  if (!document) return <main className="esb-empty">{error || "Loading Event Site..."}</main>;

  return <main className="esb-shell">
    <header className="esb-top"><Link href="/organizer/event-sites">← Event Sites</Link><strong>{document.name}</strong><span>{site?.status ?? "DRAFT"}</span><span role="status" aria-label="Save status">{status}</span>
      <button type="button" onClick={() => void persist().catch(() => {})}>Save draft</button>
      <Link href={`/organizer/event-sites/${encodeURIComponent(id)}/analytics`}>Analytics</Link>
      <Link href={`/organizer/event-sites/${encodeURIComponent(id)}/preview`} target="_blank">Open preview</Link>
      {site?.status === "PUBLISHED" && <><Link href={`/e/${site.slug}`} target="_blank">View live</Link><button type="button" onClick={() => setShowUnpublish(true)}>Unpublish</button></>}
      <button className="esb-primary" type="button" onClick={() => void publish()}>Publish</button>
    </header>
    {error && <p className="esb-error" role="alert">{error}</p>}
    <div className="esb-main">
      <aside className="esb-panel"><h2>Sections</h2><ol aria-label="Sections" className="esb-section-list">{document.sections.map((section, index) => <li key={section.id} data-section-id={section.id}>
        <button type="button" className={selectedId === section.id ? "esb-selected" : ""} onClick={() => setSelectedId(section.id)}>{sectionLabel(section.type)}{section.hidden ? " (hidden)" : ""}</button>
        <div className="esb-actions"><button aria-label="Move section up" disabled={index === 0} onClick={() => move(index, -1)}>↑</button><button aria-label="Move section down" disabled={index === document.sections.length - 1} onClick={() => move(index, 1)}>↓</button><button aria-label="Duplicate section" onClick={() => change(doc => { const sections = [...doc.sections]; sections.splice(index + 1, 0, { ...section, id: crypto.randomUUID(), content: { ...section.content }, styles: { ...section.styles } }); return { ...doc, sections }; })}>＋</button><button aria-label={section.hidden ? "Show section" : "Hide section"} onClick={() => editSection(section.id, item => ({ ...item, hidden: !item.hidden }))}>{section.hidden ? "◉" : "◎"}</button><button aria-label="Delete section" onClick={() => setDeleteId(section.id)}>×</button></div>
      </li>)}</ol><button type="button" className="esb-add" onClick={() => setLibraryOpen(true)}>Add section</button></aside>
      <div className="esb-preview-wrap"><div className="esb-preview-toolbar"><strong>Preview</strong><div>{(["desktop", "tablet", "mobile"] as const).map(option => <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}>{option}</button>)}</div></div><div className={`esb-preview esb-${view}`}><EventSiteView document={document} preview /></div></div>
      <aside className="esb-panel esb-settings"><h2>Settings</h2>
        {analytics && <div className="esb-analytics" aria-label="Site analytics"><strong>Last 30 days</strong><p><b>{analytics.uniqueVisitors.toLocaleString()}</b> unique visitors · <b>{analytics.pageViews.toLocaleString()}</b> page views</p><small>Visitors are estimated from browser IDs. Preview visits are excluded.</small></div>}
        {field("Site name", document.name, value => change(doc => ({ ...doc, name: value })))}
        {field("Site slug", document.slug, value => change(doc => ({ ...doc, slug: value.toLowerCase() })))}
        {field("Page title", text(document.seo.title), value => change(doc => ({ ...doc, seo: { ...doc.seo, title: value } })))}
        {field("Meta description", text(document.seo.description), value => change(doc => ({ ...doc, seo: { ...doc.seo, description: value } })), true)}
        <h3>Theme</h3>{(["background", "text", "accent"] as const).map(key => <label className="esb-field" key={key}>{key}<input aria-label={`${key} color`} type="color" value={/^#[0-9a-fA-F]{6}$/.test(text(document.theme[key])) ? text(document.theme[key]) : "#ffffff"} onChange={event => change(doc => ({ ...doc, theme: { ...doc.theme, [key]: event.target.value } }))} /></label>)}
        <h3>Ticket target</h3><label className="esb-field">Target mode<select aria-label="Target mode" value={document.ticketTarget.mode} onChange={event => change(doc => ({ ...doc, ticketTarget: { mode: event.target.value as SiteDocument["ticketTarget"]["mode"] } }))}><option value="NO_TICKET_CTA">No ticket button</option><option value="NEXT_EVENT">Next event</option><option value="SPECIFIC_EVENT">Specific event</option><option value="EVENT_LIST">Event list</option></select></label>
        <fieldset><legend>Linked editions</legend>{events.length ? events.map(event => <label className="esb-event" key={event.id}><input type="checkbox" checked={document.linkedEditionIds.includes(event.id)} onChange={input => change(doc => ({ ...doc, linkedEditionIds: input.target.checked ? [...doc.linkedEditionIds, event.id] : doc.linkedEditionIds.filter(item => item !== event.id), ticketTarget: doc.ticketTarget.eventId === event.id && !input.target.checked ? { mode: "NO_TICKET_CTA" } : doc.ticketTarget }))} />{event.name}</label>) : <p>No event editions found. You can publish a coming-soon site.</p>}</fieldset>
        {document.ticketTarget.mode === "SPECIFIC_EVENT" && <label className="esb-field">Selected edition<select aria-label="Selected edition" value={document.ticketTarget.eventId ?? ""} onChange={event => change(doc => ({ ...doc, ticketTarget: { mode: "SPECIFIC_EVENT", eventId: event.target.value } }))}><option value="">Select an edition</option>{events.filter(event => document.linkedEditionIds.includes(event.id)).map(event => <option value={event.id} key={event.id}>{event.name}</option>)}</select></label>}
        {selected && <><h3>{sectionLabel(selected.type)}</h3>{(["heading", "subtitle", "body", "address", "imageUrl", "mapUrl"] as const).map(key => selected.content[key] !== undefined || key === "heading" ? <div key={key}>{field(key === "heading" && selected.type === "HERO" ? "Hero heading" : key, text(selected.content[key]), value => editSection(selected.id, section => ({ ...section, content: { ...section.content, [key]: value } })), key === "body")}</div> : null)}
          <label className="esb-field">{selected.type === "HERO" ? "Hero alignment" : "Alignment"}<select aria-label={selected.type === "HERO" ? "Hero alignment" : "Alignment"} value={text(selected.styles.alignment) || "left"} onChange={event => editSection(selected.id, section => ({ ...section, styles: { ...section.styles, alignment: event.target.value } }))}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
          {(["background", "textColor"] as const).map(key => <label className="esb-field" key={key}>Section {key}<input type="color" aria-label={`Section ${key}`} value={/^#[0-9a-fA-F]{6}$/.test(text(selected.styles[key])) ? text(selected.styles[key]) : key === "background" ? "#ffffff" : "#171717"} onChange={event => editSection(selected.id, section => ({ ...section, styles: { ...section.styles, [key]: event.target.value } }))} /></label>)}
          <label className="esb-field">Section spacing<select aria-label="Section spacing" value={text(selected.styles.spacing) || "normal"} onChange={event => editSection(selected.id, section => ({ ...section, styles: { ...section.styles, spacing: event.target.value } }))}><option value="compact">Compact</option><option value="normal">Normal</option><option value="spacious">Spacious</option></select></label>
          {(["FAQ", "SCHEDULE", "LINEUP", "SPONSORS", "GALLERY", "SOCIAL_CONTACT", "FOOTER"] as SectionType[]).includes(selected.type) && <><h3>Items</h3>{(Array.isArray(selected.content.items) ? selected.content.items as Record<string, unknown>[] : []).map((item, index) => <div className="esb-item" key={index}>
            {(selected.type === "FAQ" ? ["question", "answer"] : selected.type === "SCHEDULE" ? ["time", "title", "description"] : selected.type === "GALLERY" ? ["imageUrl", "alt"] : selected.type === "SOCIAL_CONTACT" || selected.type === "FOOTER" ? ["label", "url"] : ["name", "role", "imageUrl", "url"]).map(key => <div key={key}>{field(key, text(item[key]), value => editItem(selected, index, key, value), key === "answer" || key === "description")}</div>)}
            <button type="button" onClick={() => editSection(selected.id, section => ({ ...section, content: { ...section.content, items: (Array.isArray(section.content.items) ? section.content.items : []).filter((_, itemIndex) => itemIndex !== index) } }))}>Remove item</button>
          </div>)}<button type="button" onClick={() => editSection(selected.id, section => ({ ...section, content: { ...section.content, items: [...(Array.isArray(section.content.items) ? section.content.items : []), {}] } }))}>Add item</button></>}
        </>}
      </aside>
    </div>
    {libraryOpen && <div className="esb-modal-backdrop"><div role="dialog" aria-modal="true" aria-label="Section library" className="esb-modal"><h2>Add a section</h2><div className="esb-library">{SECTION_OPTIONS.map(([type, label]) => <button key={type} type="button" onClick={() => { const section = newSection(type as SectionType); change(doc => ({ ...doc, sections: [...doc.sections, section] })); setSelectedId(section.id); setLibraryOpen(false); }}>{label}</button>)}</div><button onClick={() => setLibraryOpen(false)}>Close</button></div></div>}
    {deleteId && <div className="esb-modal-backdrop"><div role="dialog" aria-modal="true" aria-label="Delete section" className="esb-modal"><h2>Delete this section?</h2><p>You can add another section later.</p><button onClick={() => setDeleteId(null)}>Cancel</button> <button onClick={() => { change(doc => ({ ...doc, sections: doc.sections.filter(section => section.id !== deleteId) })); setDeleteId(null); }}>Delete</button></div></div>}
    {showUnpublish && <div className="esb-modal-backdrop"><div role="dialog" aria-modal="true" aria-label="Unpublish Event Site" className="esb-modal"><h2>Unpublish this site?</h2><p>The public page will be hidden. Your draft stays saved.</p><button onClick={() => setShowUnpublish(false)}>Cancel</button> <button onClick={() => void unpublish()}>Confirm</button></div></div>}
    {upgradeOpen && <div className="esb-modal-backdrop"><div role="dialog" aria-modal="true" aria-label="Upgrade to Pro" className="esb-modal"><h2>Publish with Pro</h2><p>Your draft is saved. An active Pro subscription is required to publish your Event Site.</p><button onClick={() => setUpgradeOpen(false)}>Keep editing</button></div></div>}
  </main>;
}
