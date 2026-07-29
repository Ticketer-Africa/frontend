import { EventV2 } from "@/types/events-v2.type";
import { EventLayoutViewModel } from "@/types/event-layout.type";
import { EventFormData } from "@/app/organizer/_components/event-form-schema";

function sortByPosition<T extends { position: number }>(items: T[] = []): T[] {
  return [...items].sort((a, b) => a.position - b.position);
}

export function toViewModelFromApiEvent(event: EventV2): EventLayoutViewModel {
  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    description: event.description,
    category: event.category,
    bannerUrl: event.bannerUrl,
    organizerName: event.organizer.name,
    organizerImage: event.organizer.profileImage,
    date: event.date,
    doorsOpenAt: event.doorsOpenAt,
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    layout: event.layout,
    feeMode: event.feeMode,
    primaryFeeBps: event.primaryFeeBps,
    ticketCategories: event.ticketCategories,
    lineup: sortByPosition(event.lineup).map((artist) => artist.name),
    faq: sortByPosition(event.faq).map(({ question, answer }) => ({ question, answer })),
    goodToKnow: sortByPosition(event.goodToKnow).map((point) => point.text),
    pullQuote: event.editorialPullQuote,
    timelineSlots: sortByPosition(event.timelineSlots).map(
      ({ time, stage, performer }) => ({ time, stage, performer }),
    ),
    relatedEvents: (event.relatedEvents ?? []).map((related) => ({
      id: related.id,
      slug: related.slug,
      name: related.name,
      category: related.category,
      date: related.date,
      venueName: related.venueName,
      bannerUrl: related.bannerUrl,
      fromPrice: related.fromPrice,
    })),
  };
}

export function toViewModelFromFormState(
  formState: EventFormData,
  bannerPreviewUrl: string | undefined,
): EventLayoutViewModel {
  const combinedDate = formState.date && formState.time
    ? new Date(`${formState.date}T${formState.time}`)
    : new Date();
  const doorsOpenAt = formState.date && formState.doorsOpenAt
    ? new Date(`${formState.date}T${formState.doorsOpenAt}`).toISOString()
    : undefined;

  return {
    id: "preview",
    slug: "preview",
    name: formState.name || "Untitled Event",
    description: formState.description || "",
    category: formState.category || "",
    bannerUrl: bannerPreviewUrl || "/layout-previews/dummy-banner.jpg",
    organizerName: "You",
    organizerImage: undefined,
    date: combinedDate.toISOString(),
    doorsOpenAt,
    venueName: formState.venueName,
    venueAddress: formState.venueAddress,
    layout: formState.layout,
    feeMode: formState.feeMode,
    primaryFeeBps: 350,
    ticketCategories: (formState.ticketCategories ?? []).map((cat, i) => ({
      id: cat.id || `preview-${i}`,
      name: cat.name || "Untitled Tier",
      description: cat.description,
      price: cat.price,
      maxTickets: cat.maxTickets,
      maxAdmissions: cat.maxAdmissions ?? 1,
      eventId: "preview",
      displayPrice: cat.price,
    })),
    lineup: (formState.lineup ?? []).map((a) => a.name),
    faq: (formState.faq ?? []).map(({ question, answer }) => ({ question, answer })),
    goodToKnow: (formState.goodToKnow ?? []).map((p) => p.text),
    pullQuote: formState.editorialPullQuote,
    timelineSlots: (formState.timelineSlots ?? []).map(({ time, stage, performer }) => ({
      time,
      stage,
      performer,
    })),
    relatedEvents: [],
  };
}
