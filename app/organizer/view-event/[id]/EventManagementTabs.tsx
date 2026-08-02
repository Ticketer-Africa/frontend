"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  ChartBarLineIcon,
  Copy01Icon,
  DashboardSquare01Icon,
  Loading03Icon,
  Sent02Icon,
  Tag01Icon,
  Tick01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useToast } from "@/hooks/use-toast";
import {
  useListDiscounts,
  useCreateDiscount,
} from "@/services/discounts/discounts.queries";
import { useSendMessage } from "@/services/messages/messages.queries";
import { useEventAnalytics } from "@/services/analytics/analytics.queries";
import { formatPrice } from "@/lib/helpers";
import { EventV2 } from "@/types/events-v2.type";
import AttendeesPanel from "@/app/organizer/event/[id]/attendees/AttendeesPanel";

type NavKey = "overview" | "attendees" | "discounts" | "messaging" | "analytics";

const NAV_ITEMS: { key: NavKey; label: string; icon: typeof Calendar01Icon }[] = [
  { key: "overview", label: "Overview", icon: DashboardSquare01Icon },
  { key: "attendees", label: "Attendees", icon: UserGroupIcon },
  { key: "discounts", label: "Discount Codes", icon: Tag01Icon },
  { key: "messaging", label: "Messaging", icon: Sent02Icon },
  { key: "analytics", label: "Analytics", icon: ChartBarLineIcon },
];

interface EventManagementTabsProps {
  event: EventV2;
}

export default function EventManagementTabs({ event }: EventManagementTabsProps) {
  const { toast } = useToast();
  const eventId = event.id;
  const [nav, setNav] = useState<NavKey>("overview");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [analyticsMode, setAnalyticsMode] = useState<"simple" | "advanced">("simple");

  // ── Overview derived stats ───────────────────────────────────
  const totalTickets =
    event.ticketCategories?.reduce((sum, cat) => sum + (cat.maxTickets || 0), 0) ?? 0;
  const ticketsSold =
    event.ticketCategories?.reduce((sum, cat) => sum + (cat.minted || 0), 0) ?? 0;
  const totalRevenue =
    event.ticketCategories?.reduce(
      (sum, cat) => sum + (cat.minted || 0) * (cat.price || 0),
      0,
    ) ?? 0;
  const percentSold = totalTickets > 0 ? Math.round((ticketsSold / totalTickets) * 100) : 0;
  const eventUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/events/${event.slug}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopiedToClipboard(true);
      toast({ title: "Copied!", description: "Event URL copied to clipboard" });
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to copy URL to clipboard", variant: "destructive" });
    }
  };

  // ── Discounts state ──────────────────────────────────────────
  const { data: discounts, isLoading: discountsLoading } =
    useListDiscounts(eventId);
  const { mutate: createDiscount, isPending: creatingDiscount } =
    useCreateDiscount(eventId);
  const [discountForm, setDiscountForm] = useState({
    code: "",
    type: "PERCENT" as "PERCENT" | "FLAT",
    value: "",
    usageLimit: "",
  });

  const handleCreateDiscount = () => {
    if (!discountForm.code || !discountForm.value) return;
    const { code } = discountForm;
    createDiscount(
      {
        code: discountForm.code,
        type: discountForm.type,
        value: Number(discountForm.value),
        usageLimit: discountForm.usageLimit
          ? Number(discountForm.usageLimit)
          : undefined,
      },
      {
        onSuccess: () => {
          setDiscountForm({ code: "", type: "PERCENT", value: "", usageLimit: "" });
          toast({ title: "Discount created", description: `Code "${code}" added.` });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create discount code.", variant: "destructive" });
        },
      },
    );
  };

  // ── Analytics state ──────────────────────────────────────────
  const { data: analytics, isLoading: analyticsLoading } = useEventAnalytics(
    nav === "analytics" ? eventId : "",
  );

  // ── Messaging state ──────────────────────────────────────────
  const { mutate: sendMessage, isPending: sendingMessage } =
    useSendMessage(eventId);
  const [messageForm, setMessageForm] = useState({
    subject: "",
    body: "",
    scheduledFor: "",
  });

  const handleSendMessage = () => {
    if (!messageForm.subject || !messageForm.body) return;
    sendMessage(
      {
        subject: messageForm.subject,
        body: messageForm.body,
        scheduledFor: messageForm.scheduledFor
          ? new Date(messageForm.scheduledFor).toISOString()
          : undefined,
      },
      {
        onSuccess: () => {
          setMessageForm({ subject: "", body: "", scheduledFor: "" });
          toast({ title: "Message sent", description: "Your message has been sent to all attendees." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
        },
      },
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
      <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setNav(item.key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
              nav === item.key
                ? "bg-[var(--home-accent)]/15 text-[var(--home-text-highlight)]"
                : "text-[var(--home-muted)] hover:bg-[var(--home-card-highlight)] hover:text-[var(--home-text)]"
            }`}
          >
            <HugeiconsIcon icon={item.icon} className="h-[18px] w-[18px]" />
            {item.label}
          </button>
        ))}
      </nav>

      <Card className="border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-text)] shadow-none">
        <CardContent className="p-4 sm:p-6">
          {/* ── Overview ── */}
          {nav === "overview" && (
            <div className="flex flex-col gap-7">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--home-muted)]">Total Tickets</span>
                  <span className="text-xl font-bold">{totalTickets}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--home-muted)]">Sold</span>
                  <span className="text-xl font-bold">{ticketsSold}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--home-muted)]">Percent Sold</span>
                  <span className="text-xl font-bold">{percentSold}%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--home-muted)]">Net Earnings</span>
                  <span className="text-xl font-bold">{formatPrice(Math.round(totalRevenue))}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="font-semibold">Ticket Tiers</h3>
                <div className="grid grid-cols-4 pb-2 border-b border-[var(--home-border)] text-xs text-[var(--home-muted)]">
                  <span>Tier</span>
                  <span>Price</span>
                  <span>Capacity</span>
                  <span>Sold</span>
                </div>
                {event.ticketCategories?.map((t) => (
                  <div key={t.id} className="grid grid-cols-4 py-2 border-b border-[var(--home-border)] text-sm">
                    <span className="font-semibold">{t.name}</span>
                    <span>{formatPrice(t.price)}</span>
                    <span>{t.maxTickets}</span>
                    <span>{t.minted ?? 0} / {t.maxTickets}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-[var(--home-muted)]">Event URL</span>
                <div className="flex gap-3">
                  <p className="flex-1 text-sm break-all bg-[var(--home-card-elevated)] text-[var(--home-muted)] px-3 py-2 rounded-xl font-mono">
                    {eventUrl}
                  </p>
                  <Button
                    onClick={handleCopyUrl}
                    className="border-0 bg-[var(--home-accent)] text-[var(--home-accent-fg)] hover:bg-[#f18b76]"
                  >
                    {copiedToClipboard ? (
                      <>
                        <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 mr-2" />
                        Copy URL
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Attendees ── */}
          {nav === "attendees" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Attendees</h3>
                <Button asChild variant="outline" className="border-[var(--home-border-strong)] bg-transparent text-[var(--home-text)] hover:bg-[var(--home-card-highlight)] hover:text-[var(--home-text)]">
                  <Link href={`/organizer/event/${eventId}/attendees`}>Open full view</Link>
                </Button>
              </div>
              <AttendeesPanel eventId={eventId} />
            </div>
          )}

          {/* ── Discounts ── */}
          {nav === "discounts" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Discount Codes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-1">
                  <Label htmlFor="dc-code">Code</Label>
                  <Input
                    id="dc-code"
                    placeholder="SUMMER20"
                    value={discountForm.code}
                    onChange={(e) =>
                      setDiscountForm((f) => ({ ...f, code: e.target.value }))
                    }
                    disabled={creatingDiscount}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dc-type">Type</Label>
                  <Select
                    value={discountForm.type}
                    onValueChange={(v: "PERCENT" | "FLAT") =>
                      setDiscountForm((f) => ({ ...f, type: v }))
                    }
                    disabled={creatingDiscount}
                  >
                    <SelectTrigger id="dc-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENT">Percent (%)</SelectItem>
                      <SelectItem value="FLAT">Flat (amount)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dc-value">Value</Label>
                  <Input
                    id="dc-value"
                    type="number"
                    min="0"
                    placeholder={discountForm.type === "PERCENT" ? "20" : "500"}
                    value={discountForm.value}
                    onChange={(e) =>
                      setDiscountForm((f) => ({ ...f, value: e.target.value }))
                    }
                    disabled={creatingDiscount}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dc-limit">Usage Limit (optional)</Label>
                  <Input
                    id="dc-limit"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={discountForm.usageLimit}
                    onChange={(e) =>
                      setDiscountForm((f) => ({
                        ...f,
                        usageLimit: e.target.value,
                      }))
                    }
                    disabled={creatingDiscount}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <Button
                    onClick={handleCreateDiscount}
                    disabled={
                      creatingDiscount ||
                      !discountForm.code ||
                      !discountForm.value
                    }
                    className="border-0 bg-[var(--home-accent)] text-[var(--home-accent-fg)] hover:bg-[#f18b76]"
                  >
                    {creatingDiscount ? (
                      <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Create Discount Code
                  </Button>
                </div>
              </div>

              {discountsLoading ? (
                <div className="flex justify-center py-8">
                  <HugeiconsIcon icon={Loading03Icon} className="h-6 w-6 animate-spin text-[#1E88E5]" />
                </div>
              ) : discounts && discounts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 pr-4 font-medium">Code</th>
                        <th className="text-left py-2 pr-4 font-medium">Type</th>
                        <th className="text-left py-2 pr-4 font-medium">Value</th>
                        <th className="text-left py-2 pr-4 font-medium">Limit</th>
                        <th className="text-left py-2 font-medium">Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discounts.map((d) => (
                        <tr key={d.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-mono font-semibold">
                            {d.code}
                          </td>
                          <td className="py-2 pr-4">{d.type}</td>
                          <td className="py-2 pr-4">
                            {d.type === "PERCENT" ? `${d.value}%` : `${d.value}`}
                          </td>
                          <td className="py-2 pr-4">
                            {d.usageLimit ?? "Unlimited"}
                          </td>
                          <td className="py-2">{d.usedCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No discount codes yet.
                </p>
              )}
            </div>
          )}

          {/* ── Messaging ── */}
          {nav === "messaging" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Message Attendees</h3>
              <p className="text-sm text-muted-foreground">
                Send a broadcast message to all attendees who have purchased
                tickets.
              </p>
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-1">
                  <Label htmlFor="msg-subject">Subject</Label>
                  <Input
                    id="msg-subject"
                    placeholder="Important update about the event"
                    value={messageForm.subject}
                    onChange={(e) =>
                      setMessageForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    disabled={sendingMessage}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="msg-body">Message</Label>
                  <Textarea
                    id="msg-body"
                    placeholder="Write your message here..."
                    rows={5}
                    value={messageForm.body}
                    onChange={(e) =>
                      setMessageForm((f) => ({ ...f, body: e.target.value }))
                    }
                    disabled={sendingMessage}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="msg-schedule">
                    Schedule For (optional)
                  </Label>
                  <DateTimePicker
                    value={messageForm.scheduledFor}
                    onChange={(val) =>
                      setMessageForm((f) => ({ ...f, scheduledFor: val }))
                    }
                    disabled={sendingMessage}
                    placeholder="Schedule for later (optional)"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    sendingMessage ||
                    !messageForm.subject ||
                    !messageForm.body
                  }
                  className="border-0 bg-[var(--home-accent)] text-[var(--home-accent-fg)] hover:bg-[#f18b76]"
                >
                  {sendingMessage ? (
                    <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <HugeiconsIcon icon={Sent02Icon} className="h-4 w-4 mr-2" />
                  )}
                  {messageForm.scheduledFor ? "Schedule Message" : "Send Now"}
                </Button>
              </div>
            </div>
          )}

          {/* ── Analytics ── */}
          {nav === "analytics" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Analytics</h3>
                <div className="flex bg-[var(--home-card-elevated)] rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setAnalyticsMode("simple")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      analyticsMode === "simple"
                        ? "bg-[var(--home-accent)] text-[var(--home-accent-fg)]"
                        : "text-[var(--home-muted)]"
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsMode("advanced")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      analyticsMode === "advanced"
                        ? "bg-[var(--home-accent)] text-[var(--home-accent-fg)]"
                        : "text-[var(--home-muted)]"
                    }`}
                  >
                    Advanced
                  </button>
                </div>
              </div>

              {analyticsLoading || !analytics ? (
                <div className="flex justify-center py-12">
                  <HugeiconsIcon icon={Loading03Icon} className="h-6 w-6 animate-spin text-[var(--home-accent)]" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5 p-4 bg-[var(--home-card-elevated)] rounded-xl">
                      <span className="text-xs text-[var(--home-muted)]">Avg. Order Value</span>
                      <span className="text-xl font-bold">{formatPrice(analytics.avgOrderValue)}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 p-4 bg-[var(--home-card-elevated)] rounded-xl">
                      <span className="text-xs text-[var(--home-muted)]">Peak Sales Day</span>
                      <span className="text-xl font-bold">{analytics.peakSalesDay ?? "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 p-4 bg-[var(--home-card-elevated)] rounded-xl">
                      <span className="text-xs text-[var(--home-muted)]">Conversion Rate</span>
                      <span className="text-xl font-bold">{analytics.conversionRate}%</span>
                    </div>
                  </div>

                  {analyticsMode === "advanced" && (
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col gap-3.5">
                        <span className="text-sm text-[var(--home-muted)]">
                          Tickets sold, last 7 days
                        </span>
                        <div className="flex items-end gap-3.5 h-[120px]">
                          {analytics.trend.map((d, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center gap-2 flex-1 h-full justify-end"
                            >
                              <div
                                className="w-full max-w-8 rounded-t-md bg-[var(--home-accent)]"
                                style={{ height: `${d.heightPct}%` }}
                              />
                              <span className="text-[11px] text-[var(--home-muted)]">{d.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <span className="text-sm text-[var(--home-muted)]">
                          Ticket tier breakdown — {event.name}
                        </span>
                        {analytics.tierBreakdown.map((t) => (
                          <div key={t.id} className="flex items-center gap-4">
                            <span className="w-16 text-sm shrink-0">{t.name}</span>
                            <div className="flex-1 h-2 rounded bg-[var(--home-card-elevated)] overflow-hidden">
                              <div
                                className="h-full rounded bg-[var(--home-accent)]"
                                style={{ width: `${t.barPct}%` }}
                              />
                            </div>
                            <span className="w-16 text-right text-sm text-[var(--home-muted)] shrink-0">
                              {t.sold} / {t.capacity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
