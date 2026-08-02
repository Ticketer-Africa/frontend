"use client";

import { useState } from "react";
import Image from "next/image";
import { EventLayout } from "@/types/events-v2.type";
import { LAYOUT_META } from "@/app/events/_shared/layouts/registry";
import { LayoutExpandModal } from "./layout-expand-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  value: EventLayout | undefined;
  onChange: (layout: EventLayout) => void;
}

export function EventFormStepLayout({ value, onChange }: Props) {
  const [expandedLayout, setExpandedLayout] = useState<EventLayout | null>(null);
  const [loadedThumbnails, setLoadedThumbnails] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(Object.keys(LAYOUT_META) as EventLayout[]).map((layout) => {
          const meta = LAYOUT_META[layout];
          const isSelected = value === layout;
          return (
            <div
              key={layout}
              data-testid={`select-layout-${layout}`}
              onClick={() => onChange(layout)}
              className={cn(
                "rounded-2xl border-2 p-4 cursor-pointer transition-colors",
                isSelected ? "border-[#1E88E5]" : "border-transparent bg-gray-50/70",
              )}
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-gray-200">
                {!loadedThumbnails[layout] && <Skeleton className="absolute inset-0 rounded-xl" />}
                <Image
                  src={meta.thumbnail}
                  alt={meta.title}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    loadedThumbnails[layout] ? "opacity-100" : "opacity-0",
                  )}
                  onLoad={() => setLoadedThumbnails((prev) => ({ ...prev, [layout]: true }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{meta.title}</h3>
                <button
                  type="button"
                  data-testid={`expand-layout-${layout}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedLayout(layout);
                  }}
                  className="text-xs text-[#1E88E5] underline"
                >
                  Expand
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">{meta.description}</p>
            </div>
          );
        })}
      </div>

      <LayoutExpandModal
        layout={expandedLayout ?? "TICKET_FIRST"}
        isOpen={expandedLayout !== null}
        onClose={() => setExpandedLayout(null)}
      />
    </div>
  );
}
