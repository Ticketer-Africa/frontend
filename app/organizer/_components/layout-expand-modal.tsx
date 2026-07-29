"use client";

import { EventLayout } from "@/types/events-v2.type";
import { LAYOUT_COMPONENTS } from "@/app/events/_shared/layouts/registry";
import { buildDummyEventLayoutViewModel } from "@/lib/dummy-event-fixture";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface Props {
  layout: EventLayout;
  isOpen: boolean;
  onClose: () => void;
}

export function LayoutExpandModal({ layout, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const Component = LAYOUT_COMPONENTS[layout];

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
        <Component event={buildDummyEventLayoutViewModel(layout)} mode="preview" />
      </div>
    </div>
  );
}
