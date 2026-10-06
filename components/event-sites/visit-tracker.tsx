"use client";

import { useEffect } from "react";

const KEY = "ticketer:event-site-visitor:v1";
const LIFE_MS = 90 * 86_400_000;

export function getOrCreateVisitorId(storage: Pick<Storage, "getItem" | "setItem">, now: number, newId: () => string): string {
  try {
    const saved = JSON.parse(storage.getItem(KEY) || "null");
    if (saved && typeof saved.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(saved.id) && typeof saved.expiresAt === "number" && saved.expiresAt > now) return saved.id;
  } catch { /* A blocked or corrupted store creates a fresh browser ID. */ }
  const id = newId();
  try { storage.setItem(KEY, JSON.stringify({ id, expiresAt: now + LIFE_MS })); } catch { /* Session-only estimate. */ }
  return id;
}

export function VisitTracker({ slug, apiBase }: { slug: string; apiBase: string }) {
  useEffect(() => {
    const visitorId = getOrCreateVisitorId(window.localStorage, Date.now(), () => crypto.randomUUID());
    void fetch(`${apiBase.replace(/\/$/, "")}/v1/public/event-sites/${encodeURIComponent(slug)}/visit`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ visitorId }), keepalive: true,
    }).catch(() => {});
  }, [slug, apiBase]);
  return null;
}
