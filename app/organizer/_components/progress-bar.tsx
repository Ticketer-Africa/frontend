"use client";

import { Button } from "@/components/ui/button";

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  labels?: string[];
}

/**
 * Multi-step form progress indicator
 */
export function ProgressBar({
  currentStep,
  totalSteps = 4,
  labels = ["Event Details", "Date & Tickets", "Advanced", "Review & Fees"],
}: ProgressBarProps) {
  return (
    <div className="mb-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step <= currentStep
                  ? "bg-[#1E88E5] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div
                className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 transition-colors ${
                  step < currentStep ? "bg-[#1E88E5]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        {labels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  );
}
