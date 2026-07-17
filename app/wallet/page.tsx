"use client";

import { useState, useCallback } from "react";
import {
  useWalletBalance,
  useWalletTransactions,
  useWalletPinStatus,
} from "@/services/wallet/wallet.queries";
import { useUser, useAuthStatus } from "@/lib/auth-context";
import { PayoutModal } from "@/components/payout-modal";
import { TransactionDetailsModal } from "@/components/transaction-details-modal";
import PinModal from "@/components/pin-modal";
import {
  WalletLoadingScreen,
  WalletDataLoadingScreen,
  WalletErrorScreen,
  PinSetupScreen,
  BalanceCard,
  QuickStats,
  TransactionHistory,
  type Transaction,
} from "./_components";

export default function WalletPage() {
  const { user: currentUser } = useUser();
  const { isLoading } = useAuthStatus();
  const {
    data: pinStatus,
    isLoading: loadingPinStatus,
    isError: errorPinStatus,
  } = useWalletPinStatus();
  const {
    data: transactions = [],
    isLoading: loadingTransactions,
    isError: errorTransactions,
  } = useWalletTransactions();
  const {
    data: balanceData,
    isLoading: loadingBalance,
    isError: errorBalance,
  } = useWalletBalance();

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleOpenPayoutModal = useCallback(() => setIsPayoutModalOpen(true), []);
  const handleClosePayoutModal = useCallback(() => setIsPayoutModalOpen(false), []);
  const handleOpenPinModal = useCallback(() => setIsPinModalOpen(true), []);
  const handleClosePinModal = useCallback(() => setIsPinModalOpen(false), []);
  const handleSelectTransaction = useCallback((tx: Transaction) => setSelectedTransaction(tx), []);
  const handleCloseTransactionModal = useCallback(() => setSelectedTransaction(null), []);

  // Loading states
  if (isLoading || loadingPinStatus) {
    return <WalletLoadingScreen />;
  }

  // Auth check
  if (!currentUser || currentUser.role !== "ORGANIZER") {
    return null;
  }

  // Pin status error
  if (errorPinStatus) {
    return <WalletErrorScreen message="Failed to load wallet PIN status. Please try again." />;
  }

  // Pin setup required
  if (!pinStatus?.hasPin) {
    return <PinSetupScreen />;
  }

  // Wallet data loading
  if (loadingTransactions || loadingBalance) {
    return <WalletDataLoadingScreen />;
  }

  // Wallet data error
  if (errorTransactions || errorBalance) {
    return <WalletErrorScreen message="Failed to load wallet data. Please try again." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="section-animate">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Wallet</h1>
              <p className="text-gray-600 mt-1">
                Manage your funds and transactions
              </p>
            </div>
          </div>

          {/* Balance and Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <BalanceCard
              balance={balanceData?.balance || 0}
              onRequestPayout={handleOpenPayoutModal}
              onChangePin={handleOpenPinModal}
            />
            <QuickStats transactions={transactions} />
          </div>

          {/* Transaction History */}
          <TransactionHistory
            transactions={transactions}
            onSelectTransaction={handleSelectTransaction}
          />
        </div>

        {/* Modals */}
        <PayoutModal
          isOpen={isPayoutModalOpen}
          onClose={handleClosePayoutModal}
          availableBalance={balanceData?.balance || 0}
        />
        <PinModal
          isOpen={isPinModalOpen}
          onClose={handleClosePinModal}
          hasPin={pinStatus?.hasPin || false}
        />
        <TransactionDetailsModal
          isOpen={!!selectedTransaction}
          onClose={handleCloseTransactionModal}
          transaction={selectedTransaction}
        />
      </div>
    </div>
  );
}
