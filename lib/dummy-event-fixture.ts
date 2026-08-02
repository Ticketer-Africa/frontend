import { EventLayoutViewModel } from "@/types/event-layout.type";

export function buildDummyEventLayoutViewModel(
  layout: EventLayoutViewModel["layout"],
): EventLayoutViewModel {
  return {
    id: "dummy-event",
    slug: "afro-nation-live",
    name: "Afro Nation Live",
    description:
      "Ticketer Africa presents the biggest night of the year — a headline concert experience on the shores of Eko Atlantic. Expect an all-star lineup, immersive stage production and a crowd that never stops moving. Doors open at 7:00 PM.",
    category: "CONCERT",
    bannerUrl: "/layout-previews/dummy-banner.jpg",
    organizerName: "Lagos Live Entertainment",
    organizerImage: undefined,
    date: "2026-08-08T21:00:00.000Z",
    doorsOpenAt: "2026-08-08T19:00:00.000Z",
    venueName: "Eko Atlantic",
    venueAddress: "Eko Atlantic City, Victoria Island, Lagos",
    layout,
    feeMode: "ORGANIZER",
    primaryFeeBps: 350,
    ticketCategories: [
      { id: "t1", name: "Regular", description: "General admission, standing area access", price: 15000, maxTickets: 500, maxAdmissions: 1, eventId: "dummy-event", displayPrice: 15000 },
      { id: "t2", name: "VIP", description: "Reserved seating, express entry, welcome drink", price: 35000, maxTickets: 200, maxAdmissions: 1, eventId: "dummy-event", displayPrice: 35000 },
      { id: "t3", name: "VVIP", description: "Backstage lounge, meet & greet, premium bar", price: 75000, maxTickets: 50, maxAdmissions: 1, eventId: "dummy-event", displayPrice: 75000 },
    ],
    lineup: ["Burna Boy", "Tiwa Savage", "Rema", "Asake", "Ayra Starr", "Wizkid"],
    faq: [
      { question: "Can I get a refund?", answer: "Tickets are non-refundable but transferable up to 48 hours before the event via your Ticketer Africa account." },
      { question: "Is there an age restriction?", answer: "This event is 18+. A valid government-issued ID is required at entry." },
      { question: "What time do doors open?", answer: "Doors open at 7:00 PM, three hours ahead of the main performance." },
      { question: "Where do I park?", answer: "Secure on-site parking is available at Eko Atlantic for ₦2,000, first-come first-served." },
    ],
    goodToKnow: [
      "Tickets are non-refundable but transferable up to 48 hours before the event.",
      "This event is 18+. A valid government-issued ID is required at entry.",
      "Doors open at 7:00 PM, three hours ahead of the main performance.",
      "Secure on-site parking is available at Eko Atlantic for ₦2,000.",
    ],
    pullQuote: "Never miss a heartbeat of African culture.",
    timelineSlots: [
      { time: "7:00 PM", stage: "Main Stage", performer: "Doors Open" },
      { time: "8:30 PM", stage: "Main Stage", performer: "DJ Spinall — Opening Set" },
      { time: "9:30 PM", stage: "Main Stage", performer: "Rema" },
      { time: "10:45 PM", stage: "Main Stage", performer: "Asake" },
      { time: "12:00 AM", stage: "Main Stage", performer: "Burna Boy — Headliner" },
    ],
    relatedEvents: [
      { id: "r1", slug: "unfiltered-kickback", name: "Unfiltered Kickback", category: "PARTY", date: "2026-08-21T22:00:00.000Z", venueName: "Jameson Yard, VI", bannerUrl: "/layout-previews/dummy-related-1.jpg", fromPrice: 8000 },
      { id: "r2", slug: "midnight-experience", name: "Midnight Experience", category: "CONCERT", date: "2026-09-05T21:00:00.000Z", venueName: "Ilashe Beach, Lagos", bannerUrl: "/layout-previews/dummy-related-2.jpg", fromPrice: 12000 },
      { id: "r3", slug: "gb-rumble-x-mosky", name: "GB Rumble x Mosky", category: "SPORT", date: "2026-08-30T16:00:00.000Z", venueName: "Teslim Balogun Stadium", bannerUrl: "/layout-previews/dummy-related-3.jpg", fromPrice: 5000 },
    ],
  };
}
