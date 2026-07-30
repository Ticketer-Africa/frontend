"use client";

import { EventLayoutViewModel } from "@/types/event-layout.type";
import { LAYOUT_COMPONENTS } from "@/app/events/_shared/layouts/registry";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface Props {
  event: EventLayoutViewModel;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full-screen render of the live buyer-facing event page, using the
 * organizer's in-progress form data instead of the dummy fixture.
 */
export function BuyerPreviewModal({ event, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const LayoutComponent = LAYOUT_COMPONENTS[event.layout];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto">
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="fixed top-4 right-4 z-50 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
      </button>
      <div className="min-h-screen">
        <LayoutComponent event={event} mode="preview" />
      </div>
    </div>
  );
}
