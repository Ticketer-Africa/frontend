# Event Management Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Discount Codes, Invites, and Attendee Messaging management tabs to the organizer event dashboard page.

**Architecture:** A new `EventManagementTabs` component (alongside the page) renders a shadcn `Tabs` panel. Each tab is backed by its own service domain (`discounts`, `invites`, `messages`). The page is also updated to fetch the event directly by ID via `useEventByIdV2` instead of filtering the full organizer list, which gives access to `accessType` for gating the Invites tab.

**Tech Stack:** Next.js App Router, React Query (`@tanstack/react-query`), shadcn/ui (Tabs, Card, Select, Input, Textarea, Label, Button), Framer Motion, Lucide icons, Axios, TypeScript.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `services/events/events-v2.ts` | Add `getEventByIdV2` |
| Modify | `services/events/events-v2.queries.ts` | Add `useEventByIdV2` |
| Modify | `services/discounts/discounts.ts` | Add `createDiscount`, `listDiscounts`, types |
| Modify | `services/discounts/discounts.queries.ts` | Add `useListDiscounts`, `useCreateDiscount` |
| Create | `services/invites/invites.ts` | All invite + shareable link API calls |
| Create | `services/invites/invites.queries.ts` | React Query hooks for invites |
| Create | `services/messages/messages.ts` | `sendMessage` API call |
| Create | `services/messages/messages.queries.ts` | `useSendMessage` hook |
| Create | `app/organizer/view-event/[id]/EventManagementTabs.tsx` | Full tabbed management component |
| Modify | `app/organizer/view-event/[id]/page.tsx` | Use `useEventByIdV2`, render `EventManagementTabs` |

---

## Task 1: Add `getEventByIdV2` and `useEventByIdV2`

**Files:**
- Modify: `services/events/events-v2.ts`
- Modify: `services/events/events-v2.queries.ts`

- [ ] **Step 1: Add `getEventByIdV2` to the service**

Open `services/events/events-v2.ts` and add after `getEventBySlugV2`:

```ts
export const getEventByIdV2 = async (id: string): Promise<EventV2> => {
  const endpoint = buildEndpoint(API_VERSION, `events/${id}`);
  const res = await axios.get(endpoint);
  return res.data;
};
```

- [ ] **Step 2: Add `useEventByIdV2` hook**

Open `services/events/events-v2.queries.ts` and add:

```ts
export const useEventByIdV2 = (id: string) => {
  return useQuery<EventV2, Error>({
    queryKey: ["eventV2", id],
    queryFn: () => eventsV2API.getEventByIdV2(id),
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend && npx tsc --noEmit
```

Expected: no errors related to these files.

- [ ] **Step 4: Commit**

```bash
git add services/events/events-v2.ts services/events/events-v2.queries.ts
git commit -m "feat: add getEventByIdV2 and useEventByIdV2"
```

---

## Task 2: Update `page.tsx` to use `useEventByIdV2`

**Files:**
- Modify: `app/organizer/view-event/[id]/page.tsx`

The current page loads all organizer events and filters by ID. This task replaces that with a direct ID-based fetch and switches the `Event` type to `EventV2` (which has `accessType`).

- [ ] **Step 1: Replace imports and hook at the top of the component**

In `app/organizer/view-event/[id]/page.tsx`, replace:

```ts
import {
  useDeleteEvent,
  useOrganizerEvents,
} from "@/services/events/events.queries";
import { Event } from "@/types/events.type";
```

with:

```ts
import { useDeleteEvent } from "@/services/events/events.queries";
import { useEventByIdV2 } from "@/services/events/events-v2.queries";
import { EventV2 } from "@/types/events-v2.type";
```

- [ ] **Step 2: Replace the data fetching logic inside the component**

Replace:

```ts
const { data: organizerEventList, isLoading: eventsLoading } =
  useOrganizerEvents();
```

with:

```ts
const { data: event, isLoading: eventsLoading } = useEventByIdV2(id as string);
```

- [ ] **Step 3: Remove the array filtering and type the event directly**

Remove these lines:

```ts
// Handle both array and paginated response formats
const organizerEvents: Event[] = Array.isArray(organizerEventList)
  ? organizerEventList
  : (organizerEventList?.data ?? []);

const event: Event = organizerEvents.find((e: Event) => e.id === id);
```

The `event` variable is now the direct query result (`EventV2 | undefined`).

- [ ] **Step 4: Update the not-found guard**

The existing guard `if (!event)` still works — when the query returns `undefined` (loading or not found) and `eventsLoading` is false, this will render the not-found message. No change needed here.

- [ ] **Step 5: Fix `ticketCategories` references**

`EventV2` uses `TicketCategoryV2` which has the same fields (`maxTickets`, `minted`, `price`). The existing calculations for `totalTickets`, `ticketsSold`, `totalRevenue`, `percentageSold` all still work — no changes needed.

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit
```

Fix any type errors — common ones will be `event.id` accessed before the not-found guard. Ensure the guard (`if (!event) return ...`) comes before any property access.

- [ ] **Step 7: Commit**

```bash
git add app/organizer/view-event/\[id\]/page.tsx
git commit -m "feat: fetch event by ID directly in view-event page"
```

---

## Task 3: Extend Discounts Service

**Files:**
- Modify: `services/discounts/discounts.ts`
- Modify: `services/discounts/discounts.queries.ts`

- [ ] **Step 1: Add types and organizer functions to `discounts.ts`**

Add to `services/discounts/discounts.ts` (after existing interfaces):

```ts
export interface Discount {
  id: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  usageLimit: number | null;
  usedCount: number;
}

export interface CreateDiscountPayload {
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  usageLimit?: number;
}

export const listDiscounts = async (eventId: string): Promise<Discount[]> => {
  const endpoint = buildEndpoint("v2", `events/${eventId}/discounts`);
  const response = await axios.get<Discount[]>(endpoint);
  return response.data;
};

export const createDiscount = async (
  eventId: string,
  payload: CreateDiscountPayload,
): Promise<Discount> => {
  const endpoint = buildEndpoint("v2", `events/${eventId}/discounts`);
  const response = await axios.post<Discount>(endpoint, payload);
  return response.data;
};
```

- [ ] **Step 2: Add hooks to `discounts.queries.ts`**

Add to `services/discounts/discounts.queries.ts`:

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// add these imports alongside existing ones:
import {
  // existing:
  ApplyDiscountRequest,
  DiscountDetailsResponse,
  // new:
  Discount,
  CreateDiscountPayload,
} from "@/services/discounts/discounts";

export const useListDiscounts = (eventId: string) => {
  return useQuery<Discount[], Error>({
    queryKey: ["discounts", eventId],
    queryFn: () => discountsAPI.listDiscounts(eventId),
    enabled: !!eventId,
  });
};

export const useCreateDiscount = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Discount, Error, CreateDiscountPayload>({
    mutationFn: (payload) => discountsAPI.createDiscount(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts", eventId] });
    },
  });
};
```

Note: `discounts.queries.ts` currently only imports `useMutation`. Change the import to also include `useQuery` and `useQueryClient`.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add services/discounts/discounts.ts services/discounts/discounts.queries.ts
git commit -m "feat: add organizer discount CRUD to discounts service"
```

---

## Task 4: Create Invites Service

**Files:**
- Create: `services/invites/invites.ts`
- Create: `services/invites/invites.queries.ts`

- [ ] **Step 1: Create `services/invites/invites.ts`**

```ts
import { buildEndpoint } from "@/services/api-config";
import axios from "@/services/axios";

export interface Invite {
  id: string;
  eventId: string;
  email: string;
  name: string;
  status: "PENDING" | "ACCEPTED" | "REVOKED";
  token: string;
}

export interface AddInviteePayload {
  email: string;
  name: string;
}

export interface ShareableLink {
  token: string;
}

const BASE = (eventId: string) => `events/${eventId}/invites`;

export const listInvites = async (eventId: string): Promise<Invite[]> => {
  const endpoint = buildEndpoint("v2", BASE(eventId));
  const res = await axios.get<Invite[]>(endpoint);
  return res.data;
};

export const addInvitee = async (
  eventId: string,
  payload: AddInviteePayload,
): Promise<Invite> => {
  const endpoint = buildEndpoint("v2", BASE(eventId));
  const res = await axios.post<Invite>(endpoint, payload);
  return res.data;
};

export const resendInvite = async (
  eventId: string,
  inviteId: string,
): Promise<void> => {
  const endpoint = buildEndpoint("v2", `${BASE(eventId)}/${inviteId}/resend`);
  await axios.post(endpoint);
};

export const regenerateToken = async (
  eventId: string,
  inviteId: string,
): Promise<Invite> => {
  const endpoint = buildEndpoint(
    "v2",
    `${BASE(eventId)}/${inviteId}/regenerate-token`,
  );
  const res = await axios.post<Invite>(endpoint);
  return res.data;
};

export const removeInvitee = async (
  eventId: string,
  inviteId: string,
): Promise<void> => {
  const endpoint = buildEndpoint("v2", `${BASE(eventId)}/${inviteId}/remove`);
  await axios.patch(endpoint);
};

export const generateShareableLink = async (
  eventId: string,
): Promise<ShareableLink> => {
  const endpoint = buildEndpoint("v2", `${BASE(eventId)}/shareable`);
  const res = await axios.post<ShareableLink>(endpoint);
  return res.data;
};

export const getShareableLink = async (
  eventId: string,
): Promise<ShareableLink | null> => {
  try {
    const endpoint = buildEndpoint("v2", `${BASE(eventId)}/shareable`);
    const res = await axios.get<ShareableLink>(endpoint);
    return res.data;
  } catch {
    return null;
  }
};

export const revokeShareableLink = async (eventId: string): Promise<void> => {
  const endpoint = buildEndpoint("v2", `${BASE(eventId)}/shareable`);
  await axios.delete(endpoint);
};
```

- [ ] **Step 2: Create `services/invites/invites.queries.ts`**

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as invitesAPI from "@/services/invites/invites";
import { AddInviteePayload, Invite, ShareableLink } from "@/services/invites/invites";

export const useListInvites = (eventId: string) => {
  return useQuery<Invite[], Error>({
    queryKey: ["invites", eventId],
    queryFn: () => invitesAPI.listInvites(eventId),
    enabled: !!eventId,
  });
};

export const useShareableLink = (eventId: string) => {
  return useQuery<ShareableLink | null, Error>({
    queryKey: ["shareableLink", eventId],
    queryFn: () => invitesAPI.getShareableLink(eventId),
    enabled: !!eventId,
  });
};

export const useAddInvitee = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Invite, Error, AddInviteePayload>({
    mutationFn: (payload) => invitesAPI.addInvitee(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", eventId] });
    },
  });
};

export const useResendInvite = (eventId: string) => {
  return useMutation<void, Error, string>({
    mutationFn: (inviteId) => invitesAPI.resendInvite(eventId, inviteId),
  });
};

export const useRegenerateToken = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Invite, Error, string>({
    mutationFn: (inviteId) => invitesAPI.regenerateToken(eventId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", eventId] });
    },
  });
};

export const useRemoveInvitee = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (inviteId) => invitesAPI.removeInvitee(eventId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", eventId] });
    },
  });
};

export const useGenerateShareableLink = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ShareableLink, Error, void>({
    mutationFn: () => invitesAPI.generateShareableLink(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareableLink", eventId] });
    },
  });
};

export const useRevokeShareableLink = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => invitesAPI.revokeShareableLink(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareableLink", eventId] });
    },
  });
};
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add services/invites/
git commit -m "feat: add invites service and React Query hooks"
```

---

## Task 5: Create Messages Service

**Files:**
- Create: `services/messages/messages.ts`
- Create: `services/messages/messages.queries.ts`

- [ ] **Step 1: Create `services/messages/messages.ts`**

```ts
import { buildEndpoint } from "@/services/api-config";
import axios from "@/services/axios";

export interface SendMessagePayload {
  subject: string;
  body: string;
  scheduledFor?: string;
}

export const sendMessage = async (
  eventId: string,
  payload: SendMessagePayload,
): Promise<void> => {
  const endpoint = buildEndpoint("v2", `events/${eventId}/messages`);
  await axios.post(endpoint, payload);
};
```

- [ ] **Step 2: Create `services/messages/messages.queries.ts`**

```ts
import { useMutation } from "@tanstack/react-query";
import * as messagesAPI from "@/services/messages/messages";
import { SendMessagePayload } from "@/services/messages/messages";

export const useSendMessage = (eventId: string) => {
  return useMutation<void, Error, SendMessagePayload>({
    mutationFn: (payload) => messagesAPI.sendMessage(eventId, payload),
  });
};
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add services/messages/
git commit -m "feat: add messages service and useSendMessage hook"
```

---

## Task 6: Create `EventManagementTabs` Component

**Files:**
- Create: `app/organizer/view-event/[id]/EventManagementTabs.tsx`

This is the full component. It uses all service hooks from Tasks 3–5. Build it in one file — it's one cohesive unit.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState } from "react";
import {
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Send,
  Trash2,
  Link,
  Tag,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useListDiscounts,
  useCreateDiscount,
} from "@/services/discounts/discounts.queries";
import {
  useListInvites,
  useShareableLink,
  useAddInvitee,
  useResendInvite,
  useRegenerateToken,
  useRemoveInvitee,
  useGenerateShareableLink,
  useRevokeShareableLink,
} from "@/services/invites/invites.queries";
import { useSendMessage } from "@/services/messages/messages.queries";

interface EventManagementTabsProps {
  eventId: string;
  accessType: "PUBLIC" | "INVITE_ONLY";
  eventSlug: string;
}

export default function EventManagementTabs({
  eventId,
  accessType,
  eventSlug,
}: EventManagementTabsProps) {
  const { toast } = useToast();

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
          toast({ title: "Discount created", description: `Code "${discountForm.code}" added.` });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create discount code.", variant: "destructive" });
        },
      },
    );
  };

  // ── Invites state ────────────────────────────────────────────
  const { data: invites, isLoading: invitesLoading } = useListInvites(eventId);
  const { data: shareableLink, isLoading: linkLoading } =
    useShareableLink(eventId);
  const { mutate: addInvitee, isPending: addingInvitee } =
    useAddInvitee(eventId);
  const { mutate: resendInvite, isPending: resendingInvite } =
    useResendInvite(eventId);
  const { mutate: regenerateToken } = useRegenerateToken(eventId);
  const { mutate: removeInvitee } = useRemoveInvitee(eventId);
  const { mutate: generateLink, isPending: generatingLink } =
    useGenerateShareableLink(eventId);
  const { mutate: revokeLink, isPending: revokingLink } =
    useRevokeShareableLink(eventId);
  const [inviteForm, setInviteForm] = useState({ email: "", name: "" });
  const [copiedLink, setCopiedLink] = useState(false);

  const handleAddInvitee = () => {
    if (!inviteForm.email || !inviteForm.name) return;
    addInvitee(inviteForm, {
      onSuccess: () => {
        setInviteForm({ email: "", name: "" });
        toast({ title: "Invite sent", description: `Invite sent to ${inviteForm.email}.` });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to send invite.", variant: "destructive" });
      },
    });
  };

  const handleCopyLink = async (token: string) => {
    const url = `${window.location.origin}/invite/shareable?s=${token}&eventSlug=${eventSlug}`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast({ title: "Copied!", description: "Shareable link copied to clipboard." });
    setTimeout(() => setCopiedLink(false), 2000);
  };

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
        scheduledFor: messageForm.scheduledFor || undefined,
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Event Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="discounts">
          <TabsList className="mb-6">
            <TabsTrigger value="discounts" className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Discount Codes
            </TabsTrigger>
            {accessType === "INVITE_ONLY" && (
              <TabsTrigger value="invites" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Invites
              </TabsTrigger>
            )}
            <TabsTrigger value="messaging" className="flex items-center gap-1">
              <Send className="h-4 w-4" />
              Messaging
            </TabsTrigger>
          </TabsList>

          {/* ── Discounts Tab ── */}
          <TabsContent value="discounts" className="space-y-6">
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
                  className="bg-[#1E88E5] hover:bg-blue-500 text-white"
                >
                  {creatingDiscount ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Create Discount Code
                </Button>
              </div>
            </div>

            {discountsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#1E88E5]" />
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
          </TabsContent>

          {/* ── Invites Tab ── */}
          {accessType === "INVITE_ONLY" && (
            <TabsContent value="invites" className="space-y-8">
              {/* Individual invites */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Individual Invites</h3>
                <div className="flex flex-col sm:flex-row gap-3 p-4 border rounded-lg bg-muted/30">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="inv-name">Name</Label>
                    <Input
                      id="inv-name"
                      placeholder="Jane Doe"
                      value={inviteForm.name}
                      onChange={(e) =>
                        setInviteForm((f) => ({ ...f, name: e.target.value }))
                      }
                      disabled={addingInvitee}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="inv-email">Email</Label>
                    <Input
                      id="inv-email"
                      type="email"
                      placeholder="jane@example.com"
                      value={inviteForm.email}
                      onChange={(e) =>
                        setInviteForm((f) => ({ ...f, email: e.target.value }))
                      }
                      disabled={addingInvitee}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddInvitee}
                      disabled={
                        addingInvitee ||
                        !inviteForm.email ||
                        !inviteForm.name
                      }
                      className="bg-[#1E88E5] hover:bg-blue-500 text-white w-full sm:w-auto"
                    >
                      {addingInvitee ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Send Invite
                    </Button>
                  </div>
                </div>

                {invitesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1E88E5]" />
                  </div>
                ) : invites && invites.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left py-2 pr-4 font-medium">Name</th>
                          <th className="text-left py-2 pr-4 font-medium">Email</th>
                          <th className="text-left py-2 pr-4 font-medium">Status</th>
                          <th className="text-left py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invites.map((inv) => (
                          <tr key={inv.id} className="border-b last:border-0">
                            <td className="py-2 pr-4">{inv.name}</td>
                            <td className="py-2 pr-4">{inv.email}</td>
                            <td className="py-2 pr-4">
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  inv.status === "ACCEPTED"
                                    ? "bg-green-100 text-green-700"
                                    : inv.status === "REVOKED"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-2">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    resendInvite(inv.id, {
                                      onSuccess: () =>
                                        toast({
                                          title: "Invite resent",
                                          description: `Resent to ${inv.email}.`,
                                        }),
                                      onError: () =>
                                        toast({
                                          title: "Error",
                                          description: "Failed to resend invite.",
                                          variant: "destructive",
                                        }),
                                    })
                                  }
                                  disabled={resendingInvite}
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Resend
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    regenerateToken(inv.id, {
                                      onSuccess: () =>
                                        toast({
                                          title: "Token regenerated",
                                          description: "A new invite link has been generated.",
                                        }),
                                      onError: () =>
                                        toast({
                                          title: "Error",
                                          description: "Failed to regenerate token.",
                                          variant: "destructive",
                                        }),
                                    })
                                  }
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Regenerate
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                                  onClick={() =>
                                    removeInvitee(inv.id, {
                                      onSuccess: () =>
                                        toast({
                                          title: "Invitee removed",
                                          description: `${inv.name} has been removed.`,
                                        }),
                                      onError: () =>
                                        toast({
                                          title: "Error",
                                          description: "Failed to remove invitee.",
                                          variant: "destructive",
                                        }),
                                    })
                                  }
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No invitees yet.
                  </p>
                )}
              </div>

              {/* Shareable link */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-base">Shareable Invite Link</h3>
                {linkLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-[#1E88E5]" />
                  </div>
                ) : shareableLink?.token ? (
                  <div className="space-y-3">
                    <p className="text-sm break-all bg-muted px-3 py-2 rounded-md font-mono">
                      {`${typeof window !== "undefined" ? window.location.origin : ""}/invite/shareable?s=${shareableLink.token}&eventSlug=${eventSlug}`}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(shareableLink.token)}
                      >
                        {copiedLink ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                        onClick={() =>
                          revokeLink(undefined, {
                            onSuccess: () =>
                              toast({
                                title: "Link revoked",
                                description: "The shareable link has been disabled.",
                              }),
                            onError: () =>
                              toast({
                                title: "Error",
                                description: "Failed to revoke link.",
                                variant: "destructive",
                              }),
                          })
                        }
                        disabled={revokingLink}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Generate a single link that anyone can use to register for
                      this event.
                    </p>
                    <Button
                      onClick={() =>
                        generateLink(undefined, {
                          onSuccess: () =>
                            toast({
                              title: "Link generated",
                              description: "Your shareable invite link is ready.",
                            }),
                          onError: () =>
                            toast({
                              title: "Error",
                              description: "Failed to generate link.",
                              variant: "destructive",
                            }),
                        })
                      }
                      disabled={generatingLink}
                      className="bg-[#1E88E5] hover:bg-blue-500 text-white"
                    >
                      {generatingLink ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Link className="h-4 w-4 mr-2" />
                      )}
                      Generate Shareable Link
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* ── Messaging Tab ── */}
          <TabsContent value="messaging" className="space-y-4">
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
                <Input
                  id="msg-schedule"
                  type="datetime-local"
                  value={messageForm.scheduledFor}
                  onChange={(e) =>
                    setMessageForm((f) => ({
                      ...f,
                      scheduledFor: e.target.value,
                    }))
                  }
                  disabled={sendingMessage}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={
                  sendingMessage ||
                  !messageForm.subject ||
                  !messageForm.body
                }
                className="bg-[#1E88E5] hover:bg-blue-500 text-white"
              >
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {messageForm.scheduledFor ? "Schedule Message" : "Send Now"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Fix any errors. Common ones:
- Missing import: ensure all hooks and components are imported.
- `resendInvite` / `revokeLink` callbacks: `useMutation`'s `mutate` accepts callbacks as the second argument — if TypeScript complains, ensure `mutate(variable, { onSuccess, onError })` signature matches.

- [ ] **Step 3: Commit**

```bash
git add app/organizer/view-event/\[id\]/EventManagementTabs.tsx
git commit -m "feat: add EventManagementTabs component"
```

---

## Task 7: Wire `EventManagementTabs` into `page.tsx`

**Files:**
- Modify: `app/organizer/view-event/[id]/page.tsx`

- [ ] **Step 1: Add the import**

At the top of `page.tsx`, add:

```ts
import EventManagementTabs from "./EventManagementTabs";
```

- [ ] **Step 2: Add the component after the Analytics card**

Find the Analytics card motion block (ends around the `</motion.div>` that wraps the Analytics `<Card>`). After it, add:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.7 }}
  className="mt-8"
>
  <EventManagementTabs
    eventId={event.id}
    accessType={event.accessType}
    eventSlug={event.slug}
  />
</motion.div>
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Start the dev server and verify**

```bash
npm run dev
```

Open `http://localhost:3000/organizer/view-event/<any-event-id>` and verify:
- Stats cards still render
- Event Details card still renders
- "Event Management" card appears below Analytics
- Discounts tab: create form works, list appears after creation
- Invites tab: only visible for INVITE_ONLY events; individual invite form works; shareable link generate/copy/revoke works
- Messaging tab: form sends a message and resets

- [ ] **Step 5: Commit**

```bash
git add app/organizer/view-event/\[id\]/page.tsx
git commit -m "feat: wire EventManagementTabs into view-event page"
```
