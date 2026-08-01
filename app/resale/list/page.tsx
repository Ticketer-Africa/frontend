"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HomeCard } from "@/components/home/home-card";
import { useBankCodes } from "@/services/banks/bank.queries";
import {
  useListResale,
  useResolvePayoutAccount,
} from "@/services/tickets/tickets.queries";
import { Bank } from "@/types/bank.type";
import { GuestListResalePayload, ResolvedAccount } from "@/types/tickets.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const guestListSchema = z.object({
  ticketCode: z.string().trim().min(1, "Ticket code is required"),
  email: z.string().trim().email("Enter a valid purchase email"),
  resalePrice: z
    .string()
    .min(1, "Enter resale price")
    .transform((value) => Number(value))
    .refine((value) => value >= 1200, "Minimum resale price is ₦1,200"),
  bankCode: z.string().min(1, "Please select your bank"),
  accountNumber: z
    .string()
    .regex(/^\d{10}$/, "Account number must be exactly 10 digits"),
});

type GuestListFormData = z.infer<typeof guestListSchema>;

const maskAccountNumber = (value: string) =>
  value.length >= 4 ? `****${value.slice(-4)}` : value;

export default function GuestResaleListPage() {
  const router = useRouter();
  const { data: banks, isLoading: isLoadingBanks } = useBankCodes();
  const { mutateAsync: resolveAccount, isPending: isVerifyingAccount } =
    useResolvePayoutAccount();
  const { mutateAsync: listResale, isPending: isListing } = useListResale();
  const [resolvedAccount, setResolvedAccount] =
    useState<ResolvedAccount | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GuestListFormData>({
    resolver: zodResolver(guestListSchema),
  });

  const bankCode = watch("bankCode");
  const accountNumber = watch("accountNumber");

  useEffect(() => {
    setResolvedAccount(null);
  }, [bankCode, accountNumber]);

  const handleVerifyAccount = async () => {
    if (!bankCode || !/^\d{10}$/.test(accountNumber || "")) {
      toast.error("Incomplete payout details", {
        description: "Select a bank and enter a valid 10-digit account number.",
      });
      return;
    }

    try {
      const account = await resolveAccount({ bankCode, accountNumber });
      setResolvedAccount(account);
    } catch {
      // The service shows the API error.
    }
  };

  const onSubmit = async (data: GuestListFormData) => {
    if (!resolvedAccount) {
      toast.error("Payout account not verified", {
        description: "Verify your payout account before listing this ticket.",
      });
      return;
    }

    const payload: GuestListResalePayload = {
      ticketCode: data.ticketCode.trim(),
      email: data.email.trim().toLowerCase(),
      resalePrice: data.resalePrice,
      bankCode: data.bankCode,
      accountNumber: data.accountNumber,
    };

    try {
      await listResale(payload);
      router.push(
        `/resale/status?ticketCode=${encodeURIComponent(payload.ticketCode)}&email=${encodeURIComponent(payload.email)}`
      );
    } catch {}
  };

  return (
    <main
      className="home-theme min-h-screen px-4 py-10 pt-24"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <section className="mx-auto max-w-xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "var(--home-text)" }}>
            List a ticket for resale
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--home-muted)" }}>
            No account needed. Use the ticket code and purchase email from your order.
          </p>
        </div>

        <HomeCard tone="card" className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField label="Ticket code" error={errors.ticketCode?.message}>
              <Input
                {...register("ticketCode")}
                placeholder="TCK-ABC123"
                disabled={isListing}
                style={{
                  backgroundColor: "var(--home-bg)",
                  borderColor: "var(--home-border-strong)",
                  color: "var(--home-text)",
                }}
              />
            </FormField>
            <FormField label="Purchase email" error={errors.email?.message}>
              <Input
                {...register("email")}
                type="email"
                placeholder="owner@example.com"
                disabled={isListing}
                style={{
                  backgroundColor: "var(--home-bg)",
                  borderColor: "var(--home-border-strong)",
                  color: "var(--home-text)",
                }}
              />
            </FormField>
            <FormField label="Resale price (₦)" error={errors.resalePrice?.message}>
              <Input
                {...register("resalePrice")}
                type="number"
                min="1200"
                placeholder="Minimum ₦1,200"
                disabled={isListing}
                style={{
                  backgroundColor: "var(--home-bg)",
                  borderColor: "var(--home-border-strong)",
                  color: "var(--home-text)",
                }}
              />
            </FormField>
            <FormField label="Bank" error={errors.bankCode?.message}>
              <select
                {...register("bankCode")}
                disabled={isLoadingBanks || isListing}
                className="w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                style={{
                  backgroundColor: "var(--home-bg)",
                  borderColor: "var(--home-border-strong)",
                  color: "var(--home-text)",
                }}
              >
                <option value="">Choose your bank</option>
                {banks?.map((bank: Bank) => (
                  <option key={bank.code} value={bank.code}>{bank.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Account number" error={errors.accountNumber?.message}>
              <Input
                {...register("accountNumber")}
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit account number"
                disabled={isListing}
                style={{
                  backgroundColor: "var(--home-bg)",
                  borderColor: "var(--home-border-strong)",
                  color: "var(--home-text)",
                }}
              />
            </FormField>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="homeOutline"
                onClick={handleVerifyAccount}
                disabled={isListing || isVerifyingAccount}
              >
                {isVerifyingAccount ? "Verifying..." : "Verify account"}
              </Button>
              {resolvedAccount && (
                <p className="text-sm" style={{ color: "var(--home-success-text)" }}>
                  {resolvedAccount.accountName} confirmed for {maskAccountNumber(resolvedAccount.accountNumber)}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="homeAccent"
              className="w-full"
              disabled={isListing || !resolvedAccount}
            >
              {isListing ? "Listing ticket..." : "List ticket"}
            </Button>
          </form>
        </HomeCard>
      </section>
    </main>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" style={{ color: "var(--home-text)" }}>{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
