"use client";

import { useState } from "react";
import Image from "next/image";
import { EventFormData } from "./event-form-schema";
import { toViewModelFromFormState } from "@/lib/event-layout-adapter";
import { LAYOUT_META } from "@/app/events/_shared/layouts/registry";
import { Button } from "@/components/ui/button";
import { BuyerPreviewModal } from "./buyer-preview-modal";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon } from "@hugeicons/core-free-icons";

interface Props {
  formState: EventFormData;
  bannerPreviewUrl: string | undefined;
  isSubmitting: boolean;
  onPublish: () => void;
  onSaveDraft: () => void;
}

export function EventFormStepPreview({
  formState,
  bannerPreviewUrl,
  isSubmitting,
  onPublish,
  onSaveDraft,
}: Props) {
  const [showBuyerPreview, setShowBuyerPreview] = useState(false);
  const viewModel = toViewModelFromFormState(formState, bannerPreviewUrl);
  const eventDate = new Date(viewModel.date);
  const layoutMeta = LAYOUT_META[viewModel.layout];

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card)" }}
      >
        <div className="relative h-40 w-full">
          {bannerPreviewUrl && (
            <Image src={bannerPreviewUrl} alt={viewModel.name} fill className="object-cover" />
          )}
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--home-accent)" }}>
              {viewModel.category || "Uncategorized"}
            </p>
            <h2 className="text-xl font-bold" style={{ color: "var(--home-text)" }}>
              {viewModel.name}
            </h2>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt style={{ color: "var(--home-muted)" }}>Date & Time</dt>
              <dd style={{ color: "var(--home-text)" }}>
                {formState.date
                  ? `${eventDate.toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })} · ${eventDate.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt style={{ color: "var(--home-muted)" }}>Venue</dt>
              <dd style={{ color: "var(--home-text)" }}>{viewModel.venueName || "Not set"}</dd>
            </div>
            <div>
              <dt style={{ color: "var(--home-muted)" }}>Page Layout</dt>
              <dd style={{ color: "var(--home-text)" }}>{layoutMeta?.title ?? "Not selected"}</dd>
            </div>
            <div>
              <dt style={{ color: "var(--home-muted)" }}>Access</dt>
              <dd style={{ color: "var(--home-text)" }}>
                {formState.accessType === "PRIVATE" ? "Private (invite only)" : "Public"}
              </dd>
            </div>
          </dl>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--home-muted)" }}>
              Ticket Tiers
            </p>
            <div className="space-y-2">
              {viewModel.ticketCategories.map((tier) => (
                <div key={tier.id} className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--home-text)" }}>
                    {tier.name} <span style={{ color: "var(--home-muted)" }}>· {tier.maxTickets} available</span>
                  </span>
                  <span className="font-medium" style={{ color: "var(--home-text)" }}>
                    {tier.price > 0 ? `₦${tier.price.toLocaleString()}` : "Free"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs" style={{ color: "var(--home-muted)" }}>
            {viewModel.lineup.length > 0 && <span>{viewModel.lineup.length} lineup artists</span>}
            {viewModel.faq.length > 0 && <span>{viewModel.faq.length} FAQ entries</span>}
            {viewModel.goodToKnow.length > 0 && <span>{viewModel.goodToKnow.length} good-to-know points</span>}
            {viewModel.timelineSlots.length > 0 && <span>{viewModel.timelineSlots.length} timeline slots</span>}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => setShowBuyerPreview(true)}
          >
            <HugeiconsIcon icon={EyeIcon} className="h-4 w-4 mr-2" />
            View as Buyer
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          className="flex-1 rounded-full transition-[background-color,color,border-color,opacity,transform] duration-150 hover:opacity-90"
          style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
          disabled={isSubmitting}
          onClick={onPublish}
        >
          {isSubmitting ? "Publishing..." : "Publish Event"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-full bg-transparent"
          disabled={isSubmitting}
          onClick={onSaveDraft}
        >
          Save as Draft
        </Button>
      </div>

      <BuyerPreviewModal
        event={viewModel}
        isOpen={showBuyerPreview}
        onClose={() => setShowBuyerPreview(false)}
      />
    </div>
  );
}
