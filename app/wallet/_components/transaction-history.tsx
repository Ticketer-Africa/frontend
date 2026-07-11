"use client";

import { memo, useMemo, useState, useCallback } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { Transaction } from "./types";
import { TransactionItem } from "./transaction-item";

interface TransactionHistoryProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}

const TRANSACTIONS_PER_PAGE = 10;

export const TransactionHistory = memo(function TransactionHistory({
  transactions,
  onSelectTransaction,
}: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
    filteredTransactions.length / TRANSACTIONS_PER_PAGE
  );

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
    const end = start + TRANSACTIONS_PER_PAGE;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, currentPage]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="wallet-card-animate wallet-card-delay-2 mt-8">
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
              onChange={handleSearch}
              className="w-full max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          {paginatedTransactions.length > 0 ? (
            <div className="space-y-2">
              {paginatedTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onClick={() => onSelectTransaction(transaction)}
                />
              ))}
              {/* Pagination Controls */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          ) : (
            <EmptyTransactions hasSearch={!!searchTerm} />
          )}
        </CardContent>
      </Card>
    </div>
  );
});

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls = memo(function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between mt-6">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
            className={currentPage === page ? "bg-[#1E88E5] text-white" : ""}
          >
            {page}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
});

interface EmptyTransactionsProps {
  hasSearch: boolean;
}

const EmptyTransactions = memo(function EmptyTransactions({
  hasSearch,
}: EmptyTransactionsProps) {
  return (
    <div className="text-center py-12">
      <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No transactions found
      </h3>
      <p className="text-gray-600 mb-6">
        {hasSearch
          ? "No transactions match your search."
          : "Your transaction history will appear here once your events generate sales."}
      </p>
      <Button
        className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150"
        asChild
      >
        <Link href="/explore">Explore Events</Link>
      </Button>
    </div>
  );
});
