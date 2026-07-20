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
    <div
      className="section-animate fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "var(--home-bg)", opacity: 0.9 }}
    >
      <div className="text-center">
        <div
          className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: "var(--home-accent)" }}
        ></div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--home-text)" }}>
          {message}
        </h2>
        <p style={{ color: "var(--home-muted)" }}>
          Please wait while we load your wallet data
        </p>
      </div>
    </div>
  );
}

export function WalletDataLoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="section-animate text-center">
        <div
          className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: "var(--home-accent)" }}
        ></div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--home-text)" }}>
          Loading Wallet...
        </h2>
        <p style={{ color: "var(--home-muted)" }}>
          Please wait while we fetch your wallet data
        </p>
      </div>
    </div>
  );
}

export function WalletErrorScreen({ message }: { message: string }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="section-animate text-center">
        <p className="text-lg mb-4" style={{ color: "var(--home-text-highlight)" }}>
          {message}
        </p>
        <Button
          variant="homeOutline"
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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="section-animate text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--home-text)" }}>
          Wallet Setup
        </h1>
        <p className="text-lg mb-6 max-w-md" style={{ color: "var(--home-muted)" }}>
          Please set a 4-digit PIN to secure your wallet and enable
          transactions.
        </p>
        <Button
          onClick={() => setIsPinModalOpen(true)}
          variant="homeAccent"
          className="px-6"
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
