"use client";

import { ResolvedAccount, Ticket } from "@/types/tickets.type";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatPrice } from "@/lib/helpers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBankCodes } from "@/services/banks/bank.queries";
import { Bank } from "@/types/bank.type";
import { useEffect, useState } from "react";
import { useResolvePayoutAccount } from "@/services/tickets/tickets.queries";
import { toast } from "sonner";

// Zod schema with your rules
const resaleSchema = z.object({
  resalePrice: z
    .string()
    .min(1, "Enter resale price")
    .transform((val) => Number(val))
    .refine((val) => val >= 1200, {
      message: "Minimum resale price is ₦1,200",
    }),
  bankCode: z.string().min(1, "Please select your bank"),
  accountNumber: z
    .string()
    .regex(/^\d{10}$/, "Account number must be exactly 10 digits"),
});

type ResaleFormData = z.infer<typeof resaleSchema>;

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
  const { data: banks, isLoading, error } = useBankCodes();
  const { mutateAsync: resolveAccount, isPending: isVerifyingAccount } =
    useResolvePayoutAccount();
  const [resolvedAccount, setResolvedAccount] =
    useState<ResolvedAccount | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ResaleFormData>({
    resolver: zodResolver(resaleSchema),
  });

  const resalePrice = watch("resalePrice");
  const bankCode = watch("bankCode");
  const accountNumber = watch("accountNumber");
  const youWillReceive = resalePrice
    ? Math.round(Number(resalePrice) * 0.85)
    : 0;

  const isAlreadyResold = (selectedTicket?.resaleCount ?? 0) >= 1;

  useEffect(() => {
    setResolvedAccount(null);
  }, [bankCode, accountNumber]);

  const maskAccountNumber = (value: string) =>
    value.length >= 4 ? `****${value.slice(-4)}` : value;

  const handleVerifyAccount = async () => {
    if (!bankCode || !/^\d{10}$/.test(accountNumber || "")) {
      toast.error("Select a bank and enter a valid 10-digit account number");
      return;
    }

    try {
      const account = await resolveAccount({ bankCode, accountNumber });
      setResolvedAccount(account);
    } catch {
      // The service presents the API error consistently with other ticket flows.
    }
  };

  const onSubmit = (data: ResaleFormData) => {
    if (isAlreadyResold) return;
    if (!resolvedAccount) {
      toast.error("Verify your payout account before listing this ticket");
      return;
    }

    onConfirmResale({
      resalePrice: data.resalePrice.toString(),
      bankCode: data.bankCode,
      accountNumber: data.accountNumber,
    });
  };

  const resetForm = () => {
    reset();
    setResolvedAccount(null);
  };

  return (
    <Modal
      isOpen={isOpen}
        onClose={() => {
          onClose();
          resetForm();
      }}
      title="List Ticket for Resale"
      className="max-w-lg rounded-xl"
    >
      {selectedTicket && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full max-h-[85vh] md:max-h-none"
        >
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 space-y-3">
            {/* Event Info */}
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-gray-900">
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

            {/* Original Price */}
            <div className="border rounded-xl p-4 bg-gray-50">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Original Price:</span>
                <span className="font-semibold">
                  {selectedTicket.ticketCategory &&
                  selectedTicket?.ticketCategory?.price > 0
                    ? formatPrice(selectedTicket?.ticketCategory.price)
                    : "Free"}
                </span>
              </div>
            </div>

            {/* Resale Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Resale Price (₦) <span className="text-red-600">*</span>
              </label>
              <Input
                {...register("resalePrice")}
                type="number"
                placeholder="Minimum ₦1,200"
                disabled={isAlreadyResold || isPending}
                className="text-base"
              />
              {errors.resalePrice && (
                <p className="text-xs text-red-600">
                  {errors.resalePrice.message}
                </p>
              )}
              {Number(resalePrice) >= 1200 && (
                <p className="text-xs text-gray-600">
                  You’ll receive{" "}
                  <span className="font-semibold text-gray-900">
                    {formatPrice(youWillReceive)}
                  </span>{" "}
                  after 15% service fee
                </p>
              )}
            </div>

            {/* Bank Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Select Bank <span className="text-red-600">*</span>
              </label>
              <select
                {...register("bankCode")}
                disabled={isLoading || isAlreadyResold || isPending}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm disabled:bg-gray-100"
              >
                <option value="">-- Choose your bank --</option>
                {banks?.map((bank: Bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
              {errors.bankCode && (
                <p className="text-xs text-red-600">
                  {errors.bankCode.message}
                </p>
              )}
              {isLoading && (
                <p className="text-xs text-gray-500">Loading banks...</p>
              )}
              {error && (
                <p className="text-xs text-red-600">Failed to load banks</p>
              )}
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Account Number <span className="text-red-600">*</span>
              </label>
              <Input
                {...register("accountNumber")}
                placeholder="10-digit account number"
                maxLength={10}
                disabled={isAlreadyResold || isPending}
              />
              {errors.accountNumber && (
                <p className="text-xs text-red-600">
                  {errors.accountNumber.message}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVerifyAccount}
                  disabled={
                    isAlreadyResold || isPending || isVerifyingAccount
                  }
                >
                  {isVerifyingAccount ? "Verifying..." : "Verify account"}
                </Button>
                {resolvedAccount && (
                  <p className="text-xs text-green-700">
                    {resolvedAccount.accountName} confirmed for{" "}
                    {maskAccountNumber(resolvedAccount.accountNumber)}
                  </p>
                )}
              </div>
            </div>

            {/* Warnings */}
            {isAlreadyResold && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">
                  This ticket has already been resold once and cannot be listed
                  again.
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Once listed, anyone can buy your ticket.
                You can delist it anytime before it's sold.
              </p>
            </div>
          </div>

          {/* Fixed Bottom Actions */}
          <div className="border-t border-gray-200 px-6 py-4 bg-white sticky bottom-0">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#1E88E5] hover:bg-blue-600 text-white font-medium rounded-full shadow-lg"
                disabled={isPending || isAlreadyResold || !resolvedAccount}
              >
                {isPending ? "Listing..." : "List for Sale"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
