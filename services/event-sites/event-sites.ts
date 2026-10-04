import Axios from "@/services/axios";
import type { SiteDocument, SitePreview, SiteRecord } from "@/components/event-sites/model";

const root = "/v1/event-sites";
export async function listSites(): Promise<SiteRecord[]> {
  const response = await Axios.get(root);
  return response.data;
}
export async function createSite(name: string, slug: string): Promise<SiteRecord> {
  const response = await Axios.post(root, { name, slug });
  return response.data;
}
export async function getSite(id: string): Promise<SiteRecord> {
  const response = await Axios.get(`${root}/${encodeURIComponent(id)}`);
  return response.data;
}
export async function getSitePreview(id: string): Promise<SitePreview> {
  const response = await Axios.get(`${root}/${encodeURIComponent(id)}/preview`);
  return response.data;
}
export async function saveSite(id: string, document: SiteDocument, expectedRevision: number): Promise<{ draftRevision: number }> {
  const response = await Axios.patch(`${root}/${encodeURIComponent(id)}`, { document, expectedRevision });
  return response.data;
}
export async function publishSite(id: string, expectedRevision: number) {
  const response = await Axios.post(`${root}/${encodeURIComponent(id)}/publish`, { expectedRevision });
  return response.data;
}
export async function unpublishSite(id: string) {
  const response = await Axios.post(`${root}/${encodeURIComponent(id)}/unpublish`);
  return response.data;
}
export async function getSiteAnalytics(id: string): Promise<{ windowDays: number; uniqueVisitors: number; pageViews: number; ticketCtaClicks: number; checkouts: number; orders: number; revenueKobo: string }> {
  const response = await Axios.get(`${root}/${encodeURIComponent(id)}/analytics?days=30`);
  return response.data;
}
export async function confirmSiteMedia(id: string, key: string): Promise<{ url: string; width: number; height: number }> {
  const response = await Axios.post(`${root}/${encodeURIComponent(id)}/media`, { key });
  return response.data;
}
