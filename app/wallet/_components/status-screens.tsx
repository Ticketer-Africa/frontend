"use client";

import { Button } from "@/components/ui/button";
import PinModal from "@/components/pin-modal";
import { useState } from "react";

export function WalletLoadingScreen({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="section-animate fixed inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
        <p className="text-gray-600">
          Please wait while we load your wallet data
        </p>
      </div>
    </div>
  );
}

export function WalletDataLoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="section-animate text-center">
        <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Loading Wallet...
        </h2>
        <p className="text-gray-600">
          Please wait while we fetch your wallet data
        </p>
      </div>
    </div>
  );
}

export function WalletErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="section-animate text-center">
        <p className="text-lg text-red-600 mb-4">{message}</p>
        <Button
          variant="outline"
          className="bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

export function PinSetupScreen() {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="section-animate text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Wallet Setup</h1>
        <p className="text-lg text-gray-600 mb-6 max-w-md">
          Please set a 4-digit PIN to secure your wallet and enable
          transactions.
        </p>
        <Button
          onClick={() => setIsPinModalOpen(true)}
          className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Set Wallet PIN
        </Button>
        <PinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          hasPin={false}
        />
      </div>
    </div>
  );
}
