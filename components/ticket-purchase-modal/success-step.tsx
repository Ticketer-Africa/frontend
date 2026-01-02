"use client";

import { Button } from "@/components/ui/button";

interface SuccessStepProps {
  onViewTickets: () => void;
  onContinue: () => void;
}

export function SuccessStep({ onViewTickets, onContinue }: SuccessStepProps) {
  return (
    <div className="space-y-6 text-center success-step-animate">
      <div className="text-6xl mb-4">🎉</div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Tickets purchased successfully!
        </h3>
        <p className="text-gray-600">
          Your tickets have been sent to your email and are available in your
          account.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onViewTickets}
          className="w-full h-12 bg-[#1E88E5] hover:bg-blue-500 text-white font-semibold rounded-xl"
        >
          View My Tickets
        </Button>
        <Button
          onClick={onContinue}
          variant="outline"
          className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-xl bg-transparent"
        >
          Continue Browsing
        </Button>
      </div>
    </div>
  );
}
