"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSite, listSites, saveSite } from "@/services/event-sites/event-sites";
import { TEMPLATE_SECTIONS, newSection, type SiteRecord } from "@/components/event-sites/model";

export default function EventSitesIndex() {
  const router = useRouter();
  const [sites, setSites] = useState<SiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [template, setTemplate] = useState("Blank");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listSites().then(setSites).catch(() => setError("Could not load Event Sites.")).finally(() => setLoading(false));
  }, []);

  async function create() {
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const site = await createSite(name.trim(), slug.trim().toLowerCase());
      setSites((current) => [site, ...current]);
      const document = { ...site.document, sections: TEMPLATE_SECTIONS[template].map(newSection) };
      document.sections[0].content.heading = name.trim();
      try {
        await saveSite(site.id, document, site.draftRevision);
      } catch {
        setError("The draft was created, but its starter layout could not be saved. Open the draft and try again.");
        return;
      }
      router.push(`/organizer/event-sites/${site.id}`);
    } catch (cause: any) {
      const responseMessage = cause?.response?.data?.message;
      const message = Array.isArray(responseMessage)
        ? responseMessage.join(" ")
        : typeof responseMessage === "string"
          ? responseMessage
          : "Could not create the draft. Check the name and slug and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1rem", color: "var(--home-text, #dce2f7)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
      <div><p style={{ textTransform: "uppercase", letterSpacing: ".15em", fontSize: 12 }}>Organizer workspace</p><h1 style={{ fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 750 }}>Event Sites</h1><p>One website for your event brand. Keep it as editions come and go.</p></div>
      <button type="button" disabled={loading} onClick={() => setCreating(true)} style={{ background: "var(--home-accent, #e2725b)", color: "var(--home-accent-fg, #5a0d02)", padding: ".85rem 1.2rem", borderRadius: 999, fontWeight: 700 }}>Create Event Site</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {loading ? <p>Loading sites...</p> : sites.length ? <div style={{ display: "grid", gap: 16, marginTop: 40 }}>
      {sites.map(site => <Link key={site.id} href={`/organizer/event-sites/${site.id}`} style={{ display: "block", padding: 24, border: "1px solid var(--home-border-strong, #56423e)", borderRadius: 16, color: "inherit", textDecoration: "none", background: "var(--home-card, #141b2b)" }}>
        <strong>{site.document.name}</strong><span style={{ marginLeft: 12, opacity: .7 }}>{site.status}</span><p style={{ marginBottom: 0 }}>/e/{site.document.slug}</p>
      </Link>)}
    </div> : <p style={{ marginTop: 40 }}>No sites yet. Create a draft to see how your page could look.</p>}
    {creating && <div role="dialog" aria-modal="true" aria-label="Create Event Site" style={{ position: "fixed", inset: 0, background: "#0009", display: "grid", placeItems: "center", zIndex: 100 }}>
      <div style={{ background: "var(--home-card-elevated, #191f2f)", color: "var(--home-text, #dce2f7)", padding: 28, border: "1px solid var(--home-border-strong, #56423e)", borderRadius: 20, width: "min(94vw,550px)", display: "grid", gap: 15 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700 }}>Create a site draft</h2>
        <label>Site name<input aria-label="Site name" value={name} onChange={event => setName(event.target.value)} style={inputStyle} /></label>
        <label>Site slug<input aria-label="Site slug" value={slug} onChange={event => setSlug(event.target.value)} style={inputStyle} placeholder="your-event-name" /></label>
        <p style={{ margin: 0 }}>Choose a starting layout</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{Object.keys(TEMPLATE_SECTIONS).map(option => <button key={option} type="button" aria-pressed={template === option} onClick={() => setTemplate(option)} style={{ padding: "8px 12px", border: "1px solid var(--home-border-strong, #56423e)", borderRadius: 999, background: template === option ? "var(--home-accent, #e2725b)" : "var(--home-card, #141b2b)", color: template === option ? "var(--home-accent-fg, #5a0d02)" : "var(--home-text, #dce2f7)" }}>{option}</button>)}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}><button type="button" onClick={() => setCreating(false)} disabled={submitting} style={{ color: "var(--home-text, #dce2f7)" }}>Cancel</button><button type="button" disabled={submitting || !name.trim() || !slug.trim()} onClick={create} style={{ padding: ".7rem 1rem", background: "var(--home-accent, #e2725b)", color: "var(--home-accent-fg, #5a0d02)", borderRadius: 8, fontWeight: 700, opacity: submitting ? .65 : 1 }}>{submitting ? "Creating…" : "Create draft"}</button></div>
      </div>
    </div>}
  </main>;
}
const inputStyle: React.CSSProperties = { display: "block", width: "100%", border: "1px solid var(--home-border-strong, #56423e)", borderRadius: 8, padding: 10, color: "var(--home-text, #dce2f7)", background: "var(--home-card, #141b2b)" };
