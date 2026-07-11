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
      <Card className="bg-white rounded-xl shadow-lg border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <Wallet className="h-5 w-5 text-[#1E88E5]" />
            <span>Available Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-4xl font-bold text-gray-900">
              {formatPrice(balance)}
            </p>
            <div className="space-y-2">
              <Button
                className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150"
                onClick={onRequestPayout}
                disabled={balance <= 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Request Payout
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-100 text-gray-900 rounded-full px-6"
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
