import { describe, it, expect } from "vitest";
import { toViewModelFromApiEvent, toViewModelFromFormState } from "./event-layout-adapter";
import { EventV2 } from "@/types/events-v2.type";
import { EventFormData } from "@/app/organizer/_components/event-form-schema";

function buildApiEvent(overrides: Partial<EventV2> = {}): EventV2 {
  return {
    id: "evt-1",
    name: "Afro Nation Live",
    slug: "afro-nation-live",
    description: "The biggest night of the year.",
    organizerId: "org-1",
    venueName: "Eko Atlantic",
    venueAddress: "Eko Atlantic City, Lagos",
    date: "2026-08-08T21:00:00.000Z",
    category: "CONCERT",
    isActive: true,
    bannerUrl: "https://example.com/banner.png",
    organizer: { name: "Lagos Live Entertainment", email: "x@x.com", profileImage: "" },
    feeMode: "ORGANIZER",
    primaryFeeBps: 350,
    accessType: "PUBLIC",
    isVirtual: false,
    isRecurring: false,
    layout: "TIMELINE",
    ticketCategories: [
      { id: "t1", name: "Regular", price: 15000, maxTickets: 500, maxAdmissions: 1, eventId: "evt-1", displayPrice: 15000 },
    ],
    lineup: [{ id: "l1", name: "Burna Boy", position: 0 }],
    faq: [{ id: "f1", question: "Refunds?", answer: "No.", position: 0 }],
    goodToKnow: [],
    timelineSlots: [{ id: "s1", time: "9:30 PM", stage: "Main Stage", performer: "Burna Boy", position: 0 }],
    relatedEvents: [],
    ...overrides,
  };
}

describe("toViewModelFromApiEvent", () => {
  it("maps ordered lineup, faq, and timeline slots", () => {
    const vm = toViewModelFromApiEvent(buildApiEvent());

    expect(vm.layout).toBe("TIMELINE");
    expect(vm.lineup).toEqual(["Burna Boy"]);
    expect(vm.faq).toEqual([{ question: "Refunds?", answer: "No." }]);
    expect(vm.timelineSlots).toEqual([
      { time: "9:30 PM", stage: "Main Stage", performer: "Burna Boy" },
    ]);
    expect(vm.organizerName).toBe("Lagos Live Entertainment");
    expect(vm.venueName).toBe("Eko Atlantic");
  });

  it("defaults missing arrays to empty", () => {
    const vm = toViewModelFromApiEvent(
      buildApiEvent({ lineup: undefined, faq: undefined, timelineSlots: undefined, goodToKnow: undefined, relatedEvents: undefined }),
    );

    expect(vm.lineup).toEqual([]);
    expect(vm.faq).toEqual([]);
    expect(vm.timelineSlots).toEqual([]);
    expect(vm.goodToKnow).toEqual([]);
    expect(vm.relatedEvents).toEqual([]);
  });
});

function buildFormState(overrides: Partial<EventFormData> = {}): EventFormData {
  return {
    name: "Afro Nation Live",
    description: "The biggest night of the year.",
    category: "CONCERT",
    venueName: "Eko Atlantic",
    venueAddress: "Eko Atlantic City, Lagos",
    date: "2026-08-08",
    time: "21:00",
    doorsOpenAt: "19:00",
    layout: "TIMELINE",
    feeMode: "ORGANIZER",
    accessType: "PUBLIC",
    ticketCategories: [
      { id: "1", name: "Regular", price: 15000, maxTickets: 500, maxAdmissions: 1 },
    ],
    lineup: [{ id: "l1", name: "Burna Boy" }],
    faq: [],
    goodToKnow: [],
    timelineSlots: [{ id: "s1", time: "9:30 PM", stage: "Main Stage", performer: "Burna Boy" }],
    editorialPullQuote: "",
    banner: undefined,
    ...overrides,
  } as EventFormData;
}

describe("toViewModelFromFormState", () => {
  it("maps in-progress wizard state to the same shape the API adapter produces", () => {
    const vm = toViewModelFromFormState(buildFormState(), "org-preview-image.jpg");

    expect(vm.layout).toBe("TIMELINE");
    expect(vm.lineup).toEqual(["Burna Boy"]);
    expect(vm.timelineSlots).toEqual([
      { time: "9:30 PM", stage: "Main Stage", performer: "Burna Boy" },
    ]);
    expect(vm.venueName).toBe("Eko Atlantic");
    expect(vm.date).toBe(new Date("2026-08-08T21:00").toISOString());
  });

  it("falls back to a placeholder banner when none is set yet", () => {
    const vm = toViewModelFromFormState(buildFormState(), undefined);
    expect(vm.bannerUrl).toBeTruthy();
  });
});
