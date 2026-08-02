"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface FormNavigationProps {
  currentStep: number;
  totalSteps?: number;
  canProceed: boolean;
  isSubmitting: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  onPrevious: () => void;
  onNext: () => void;
  formId?: string;
  requiresConfirmation?: boolean;
  isConfirmed?: boolean;
}

/**
 * Navigation buttons for multi-step form
 */
export function FormNavigation({
  currentStep,
  totalSteps = 4,
  canProceed,
  isSubmitting,
  submitLabel = "Create Event",
  submittingLabel = "Creating...",
  onPrevious,
  onNext,
  formId = "event-form",
  requiresConfirmation = false,
  isConfirmed = true,
}: FormNavigationProps) {
  // Disable submit if confirmation is required but not provided
  const canSubmit = !requiresConfirmation || isConfirmed;
  return (
    <div className="flex justify-between pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        className="bg-transparent"
        onClick={onPrevious}
        disabled={currentStep === 1 || isSubmitting}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
        Previous
      </Button>

      {currentStep < totalSteps ? (
        <Button
          type="button"
          className={`rounded-full px-6 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150 hover:opacity-90 ${
            !canProceed ? "opacity-50" : ""
          }`}
          style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
          onClick={onNext}
          disabled={isSubmitting}
          aria-disabled={!canProceed}
        >
          Next
          <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button
          type="submit"
          form={formId}
          className="rounded-full px-6 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150 hover:opacity-90"
          style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      )}
    </div>
  );
}
