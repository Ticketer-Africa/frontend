"use client";

import { EventFormData } from "./event-form-schema";
import { toViewModelFromFormState } from "@/lib/event-layout-adapter";
import { LAYOUT_COMPONENTS } from "@/app/events/_shared/layouts/registry";
import { Button } from "@/components/ui/button";

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
  const viewModel = toViewModelFromFormState(formState, bannerPreviewUrl);
  const LayoutComponent = LAYOUT_COMPONENTS[viewModel.layout];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        <LayoutComponent event={viewModel} mode="preview" />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          className="flex-1 bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full"
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
    </div>
  );
}
