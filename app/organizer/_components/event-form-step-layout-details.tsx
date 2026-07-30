"use client";

import { EventLayout } from "@/types/events-v2.type";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineupEditor, LineupArtistFormItem } from "./lineup-editor";
import { FaqEditor, FaqFormItem } from "./faq-editor";
import { GoodToKnowEditor, GoodToKnowFormItem } from "./good-to-know-editor";
import { ShowTimelineEditor, ShowTimelineFormItem } from "./show-timeline-editor";

export interface LayoutDetailsValues {
  lineup: LineupArtistFormItem[];
  faq: FaqFormItem[];
  goodToKnow: GoodToKnowFormItem[];
  timelineSlots: ShowTimelineFormItem[];
  editorialPullQuote: string;
}

interface Props {
  layout: EventLayout;
  values: LayoutDetailsValues;
  onChange: (patch: Partial<LayoutDetailsValues>) => void;
  isDisabled?: boolean;
}

const SHOWS_LINEUP: EventLayout[] = ["HERO_OVERLAY", "SPLIT_SCREEN", "TIMELINE"];
const SHOWS_FAQ: EventLayout[] = ["HERO_OVERLAY", "SPLIT_SCREEN", "EDITORIAL", "TICKET_FIRST"];

export function EventFormStepLayoutDetails({ layout, values, onChange, isDisabled }: Props) {
  return (
    <div className="space-y-6">
      {SHOWS_LINEUP.includes(layout) && (
        <LineupEditor
          artists={values.lineup}
          onChange={(lineup) => onChange({ lineup })}
          isDisabled={isDisabled}
        />
      )}

      {layout === "EDITORIAL" && (
        <div className="space-y-1.5">
          <Label htmlFor="editorialPullQuote" className="text-sm font-medium">Pull Quote</Label>
          <Input
            id="editorialPullQuote"
            placeholder="Never miss a heartbeat of African culture."
            className="h-11 rounded-xl"
            value={values.editorialPullQuote}
            onChange={(e) => onChange({ editorialPullQuote: e.target.value })}
            disabled={isDisabled}
          />
        </div>
      )}

      {layout === "EDITORIAL" && (
        <GoodToKnowEditor
          points={values.goodToKnow}
          onChange={(goodToKnow) => onChange({ goodToKnow })}
          isDisabled={isDisabled}
        />
      )}

      {layout === "TIMELINE" && (
        <ShowTimelineEditor
          slots={values.timelineSlots}
          onChange={(timelineSlots) => onChange({ timelineSlots })}
          isDisabled={isDisabled}
        />
      )}

      {SHOWS_FAQ.includes(layout) && (
        <FaqEditor
          items={values.faq}
          onChange={(faq) => onChange({ faq })}
          isDisabled={isDisabled}
        />
      )}
    </div>
  );
}
