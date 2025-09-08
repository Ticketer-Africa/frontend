"use client";

import { Ticket } from "@/types/tickets.type";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatPrice } from "@/lib/dummy-data";
import { useState } from "react";
import { useBankCodes } from "@/services/banks/bank.queries";
import { Bank } from "@/types/bank.type";

interface ResaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket: Ticket | null;
  onConfirmResale: (payload: {
    resalePrice: string;
    bankCode: string;
    accountNumber: string;
  }) => void;
  isPending: boolean;
}

export function ResaleModal({
  isOpen,
  onClose,
  selectedTicket,
  onConfirmResale,
  isPending,
}: ResaleModalProps) {
  const [resalePrice, setResalePrice] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const { data: banks, isLoading, error } = useBankCodes();

  const handleSubmit = () => {
    if (!resalePrice || !bankCode || !accountNumber) return;
    if ((selectedTicket?.resaleCount ?? 0) >= 1) {
      return; // Prevent submission if ticket has been resold once
    }
    onConfirmResale({ resalePrice, bankCode, accountNumber });
    setResalePrice("");
    setBankCode("");
    setAccountNumber("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setResalePrice("");
        setBankCode("");
        setAccountNumber("");
      }}
      title="List Ticket for Resale"
      className="max-w-lg rounded-xl"
    >
      {selectedTicket && (
        <div className="overflow-y-auto max-h-[70vh] space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {selectedTicket.event.name}
            </h3>
            <p className="text-sm text-gray-600">
              {selectedTicket.event.location}
            </p>
            <p className="text-sm text-gray-600">
              {formatDate(selectedTicket.event.date)}
            </p>
            <p className="text-sm text-gray-600">
              Ticket #{selectedTicket.code}
            </p>
            <p className="text-sm text-gray-600">
              Category: {selectedTicket.ticketCategory?.name}
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Original Price:</span>
              <span className="font-semibold text-gray-900">
                {selectedTicket.ticketCategory?.price &&
                selectedTicket.ticketCategory.price > 0
                  ? `${formatPrice(selectedTicket.ticketCategory.price)}`
                  : "Free"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="resalePrice"
              className="text-sm font-medium text-gray-900"
            >
              Resale Price (₦) *
            </label>
            <Input
              id="resalePrice"
              type="number"
              placeholder="Enter resale price"
              value={resalePrice}
              onChange={(e) => setResalePrice(e.target.value)}
              min="0"
              step="100"
              disabled={selectedTicket.resaleCount >= 1}
            />
            <p className="text-xs text-gray-500">
              You'll receive
              {formatPrice(
                Math.round(Number.parseFloat(resalePrice || "0") * 0.95)
              )}{" "}
              after 5% service fee
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="bankCode"
              className="text-sm font-medium text-gray-900"
            >
              Select Bank *
            </label>
            <select
              id="bankCode"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-700"
              disabled={isLoading || selectedTicket.resaleCount >= 1}
            >
              <option value="">-- Select your bank --</option>
              {banks?.map((bank: Bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
            {isLoading && (
              <p className="text-xs text-gray-500">Loading banks...</p>
            )}
            {error && (
              <p className="text-xs text-red-500">Failed to load banks</p>
            )}
            <p className="text-xs text-gray-500">
              Pick your bank from the list
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="accountNumber"
              className="text-sm font-medium text-gray-900"
            >
              Account Number *
            </label>
            <Input
              id="accountNumber"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              disabled={selectedTicket.resaleCount >= 1}
            />
            <p className="text-xs text-gray-500">
              Enter your 10-digit account number
            </p>
          </div>

          {selectedTicket.resaleCount >= 1 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Note:</strong> This ticket has already been resold once
                and cannot be listed again.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Once listed, your ticket will be available
              for purchase by other users. You can remove the listing anytime
              before it's sold.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent border-gray-300 hover:bg-gray-100"
              onClick={() => onClose()}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleSubmit}
              disabled={
                !resalePrice ||
                Number.parseFloat(resalePrice) <= 0 ||
                !bankCode ||
                !accountNumber ||
                isPending ||
                selectedTicket.resaleCount >= 1
              }
            >
              {isPending ? "Listing..." : "List for Sale"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
