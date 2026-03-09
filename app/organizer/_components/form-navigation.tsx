"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
  totalSteps = 3,
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
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      {currentStep < totalSteps ? (
        <Button
          type="button"
          className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button
          type="submit"
          form={formId}
          className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      )}
    </div>
  );
}
