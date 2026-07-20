"use client";

import { memo } from "react";
import { Wallet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/helpers";

interface BalanceCardProps {
  balance: number;
  onRequestPayout: () => void;
  onChangePin: () => void;
}

export const BalanceCard = memo(function BalanceCard({
  balance,
  onRequestPayout,
  onChangePin,
}: BalanceCardProps) {
  return (
    <div className="wallet-card-animate">
      <Card
        className="rounded-xl shadow-lg border"
        style={{
          backgroundColor: "var(--home-card)",
          borderColor: "var(--home-border)",
          color: "var(--home-text)",
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center space-x-2" style={{ color: "var(--home-text)" }}>
            <Wallet className="h-5 w-5" style={{ color: "var(--home-accent)" }} />
            <span>Available Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-4xl font-bold" style={{ color: "var(--home-text)" }}>
              {formatPrice(balance)}
            </p>
            <div className="space-y-2">
              <Button
                variant="homeAccent"
                className="w-full px-6"
                onClick={onRequestPayout}
                disabled={balance <= 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Request Payout
              </Button>
              <Button
                variant="homeOutline"
                className="w-full px-6"
                onClick={onChangePin}
              >
                Change PIN
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
