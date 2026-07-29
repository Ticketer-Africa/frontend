import { EventLayout } from "@/types/events-v2.type";
import { EventLayoutViewModel } from "@/types/event-layout.type";
import { HeroOverlayLayout } from "./hero-overlay-layout";
import { SplitScreenLayout } from "./split-screen-layout";
import { EditorialLayout } from "./editorial-layout";
import { TicketFirstLayout } from "./ticket-first-layout";
import { TimelineLayout } from "./timeline-layout";

export interface EventLayoutComponentProps {
  event: EventLayoutViewModel;
  mode: "live" | "preview";
}

export const LAYOUT_COMPONENTS: Record<
  EventLayout,
  (props: EventLayoutComponentProps) => JSX.Element
> = {
  HERO_OVERLAY: HeroOverlayLayout,
  SPLIT_SCREEN: SplitScreenLayout,
  EDITORIAL: EditorialLayout,
  TICKET_FIRST: TicketFirstLayout,
  TIMELINE: TimelineLayout,
};

export const LAYOUT_META: Record<
  EventLayout,
  { title: string; description: string; thumbnail: string }
> = {
  HERO_OVERLAY: {
    title: "Hero Overlay",
    description: "Full-bleed hero image, lineup grid, sticky ticket sidebar.",
    thumbnail: "/layout-previews/hero-overlay.png",
  },
  SPLIT_SCREEN: {
    title: "Split Screen",
    description: "Image on one side, tabbed overview/lineup/location on the other.",
    thumbnail: "/layout-previews/split-screen.png",
  },
  EDITORIAL: {
    title: "Editorial",
    description: "Magazine-style story with a pull quote and related events.",
    thumbnail: "/layout-previews/editorial.png",
  },
  TICKET_FIRST: {
    title: "Ticket-First",
    description: "Leads with ticket tiers as pricing cards, FAQ below.",
    thumbnail: "/layout-previews/ticket-first.png",
  },
  TIMELINE: {
    title: "Timeline",
    description: "Festival-style running order across stages, plus lineup.",
    thumbnail: "/layout-previews/timeline.png",
  },
};
