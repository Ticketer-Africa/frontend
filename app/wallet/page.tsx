"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  useWalletBalance,
  useWalletTransactions,
  useWalletPinStatus,
} from "@/services/wallet/wallet.queries";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PayoutModal } from "@/components/payout-modal";
import { TransactionDetailsModal } from "@/components/transaction-details-modal";
import { formatPrice } from "@/lib/helpers";
import PinModal from "@/components/pin-modal";

interface Transaction {
  id: string;
  reference: string;
  type: "PURCHASE" | "RESALE" | "WITHDRAW";
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  createdAt: string;
  buyer: { id: string; name: string; email: string } | null;
  event: { id: string; name: string } | null;
  tickets: { id: string; code: string; event: { id: string; name: string } }[];
}

export default function WalletPage() {
  const { user: currentUser, isLoading } = useAuth();
  const router = useRouter();
  const {
    data: pinStatus,
    isLoading: loadingPinStatus,
    isError: errorPinStatus,
  } = useWalletPinStatus();
  const {
    data: transactions = [], // Default to empty array to avoid undefined
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
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push(
        `/login?returnUrl=${encodeURIComponent(window.location.href)}`
      );
      return;
    }
    if (
      currentUser &&
      !["ORGANIZER", "ADMIN", "SUPERADMIN"].includes(currentUser.role)
    ) {
      router.push("/explore");
      return;
    }
  }, [currentUser, isLoading, router]);

  // Filter transactions based on search term
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    const lowerSearch = searchTerm.toLowerCase();
    return transactions.filter((tx) =>
      [tx.reference, tx.event?.name, tx.buyer?.name].some((field) =>
        field?.toLowerCase().includes(lowerSearch)
      )
    );
  }, [transactions, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * transactionsPerPage;
    const end = start + transactionsPerPage;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatAmount = (amount: number, type: string) => {
    const isCredit = type === "RESALE";
    const formattedAmount = formatPrice(Math.abs(amount));
    return isCredit ? `+${formattedAmount}` : `+${formattedAmount}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "RESALE":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "WITHDRAW":
        return <Download className="h-4 w-4 text-blue-500" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "success";
      case "PENDING":
        return "warning";
      case "FAILED":
        return "destructive";
      default:
        return "default";
    }
  };

  if (isLoading || loadingPinStatus) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-50"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600">
            Please wait while we load your wallet data
          </p>
        </div>
      </motion.div>
    );
  }

  if (
    !currentUser ||
    !["ORGANIZER", "ADMIN", "SUPERADMIN"].includes(currentUser.role)
  ) {
    return null;
  }

  if (errorPinStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-lg text-red-600 mb-4">
            Failed to load wallet PIN status. Please try again.
          </p>
          <Button
            variant="outline"
            className="bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!pinStatus?.hasPin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wallet Setup
          </h1>
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
        </motion.div>
      </div>
    );
  }

  if (loadingTransactions || loadingBalance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Wallet...
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch your wallet data
          </p>
        </motion.div>
      </div>
    );
  }

  if (errorTransactions || errorBalance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-lg text-red-600 mb-4">
            Failed to load wallet data. Please try again.
          </p>
          <Button
            variant="outline"
            className="bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Wallet</h1>
              <p className="text-gray-600 mt-1">
                Manage your funds and transactions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wallet Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-white rounded-xl shadow-lg border border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    <span>Available Balance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-4xl font-bold text-gray-900">
                      {formatPrice(balanceData?.balance || 0)}
                    </p>
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => setIsPayoutModalOpen(true)}
                        disabled={(balanceData?.balance || 0) <= 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Request Payout
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 hover:bg-gray-100 text-gray-900 rounded-full px-6"
                        onClick={() => setIsPinModalOpen(true)}
                      >
                        Change PIN
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 h-full p-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Total Earned From Resale
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(
                      filteredTransactions
                        .filter(
                          (t) => t.type === "RESALE" && t.status === "SUCCESS"
                        )
                        .reduce((sum, t) => sum + t.amount, 0) || 0
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Total Withdrawn</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(
                      filteredTransactions
                        .filter(
                          (t) => t.type === "WITHDRAW" && t.status === "SUCCESS"
                        )
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredTransactions.length || "0"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Transaction History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-white rounded-xl shadow-lg border border-gray-100">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">
                  Transaction History
                </CardTitle>
                <div className="mt-4">
                  <Input
                    type="text"
                    placeholder="Search transactions by reference, event, or buyer..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="w-full max-w-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {paginatedTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {paginatedTransactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <div className="flex items-center space-x-4">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {transaction.type.toLowerCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {transaction.event?.name || "Payout Request"}
                            </p>
                            {transaction.buyer && (
                              <p className="text-sm text-gray-500">
                                Buyer: {transaction.buyer.name}
                              </p>
                            )}
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={getStatusColor(transaction.status)}
                                className="text-xs"
                              >
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              transaction.type === "RESALE"
                                ? "text-green-600"
                                : "text-black"
                            }`}
                          >
                            {formatAmount(transaction.amount, transaction.type)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between mt-6">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center space-x-2">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            onClick={() => handlePageChange(page)}
                            className={
                              currentPage === page
                                ? "bg-blue-600 text-white"
                                : ""
                            }
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No transactions found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm
                        ? "No transactions match your search."
                        : "Your transaction history will appear here once your events generate sales."}
                    </p>
                    <Button
                      className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                      asChild
                    >
                      <Link href="/explore">Explore Events</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <PayoutModal
          isOpen={isPayoutModalOpen}
          onClose={() => setIsPayoutModalOpen(false)}
          availableBalance={balanceData?.balance || 0}
        />
        <PinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          hasPin={pinStatus?.hasPin || false}
        />
        <TransactionDetailsModal
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          transaction={selectedTransaction}
        />
      </div>
    </div>
  );
}
