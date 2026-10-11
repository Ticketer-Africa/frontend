"use client";

import { useState } from "react";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon } from "@hugeicons/core-free-icons";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { usePayoutBanks, usePayoutDestinations, useRegisterPayoutDestination, useResolvePayoutAccount, useWithdrawWallet } from "@/services/wallet/wallet.queries";
import { toast } from "sonner";
import { formatPrice } from "@/lib/helpers";
import { useUser } from "@/lib/auth-context";
import type { PayoutDestination } from "@/services/wallet/payout";

const createWithdrawPayloadSchema = (availableBalance: number) =>
  z.object({
    amount: z
      .number({ invalid_type_error: "Enter a valid amount" })
      .positive("Amount must be greater than 0")
      .max(availableBalance, `Amount cannot exceed ${formatPrice(availableBalance)}`),
    destinationId: z.string().min(1, "Select an approved bank account"),
    pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
  });

type WithdrawPayload = z.infer<ReturnType<typeof createWithdrawPayloadSchema>>;

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

const emptyForm = { amount: 0, destinationId: "", pin: "" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
      <HugeiconsIcon icon={Alert01Icon} className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  );
}

export function PayoutModal({ isOpen, onClose, availableBalance }: PayoutModalProps) {
  const { user } = useUser();
  const [addingDestination, setAddingDestination] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newBankCode, setNewBankCode] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [step, setStep] = useState<"details" | "pin">("details");
  const [formData, setFormData] = useState<Omit<WithdrawPayload, "email" | "name">>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pinError, setPinError] = useState("");
  const { mutateAsync: requestPayout, isPending } = useWithdrawWallet();
  const { data: banks } = usePayoutBanks();
  const { data: destinations, refetch: refetchDestinations } = usePayoutDestinations();
  const { mutateAsync: registerDestination, isPending: registering } = useRegisterPayoutDestination();
  const { mutateAsync: resolveAccount, isPending: resolving } = useResolvePayoutAccount();

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  const handleDetailsSubmit = () => {
    if (!user) {
      toast.error("Login required", {
        description: "You must be logged in to request a payout.",
      });
      return;
    }

    const schema = createWithdrawPayloadSchema(availableBalance).omit({ pin: true });
    const result = schema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStep("pin");
  };

  const handlePinSubmit = async () => {
    if (formData.pin.length !== 4) {
      setPinError("Enter your 4-digit PIN to confirm");
      return;
    }

    const schema = createWithdrawPayloadSchema(availableBalance);
    const result = schema.safeParse(formData);

    if (!result.success) {
      const pinIssue = result.error.issues.find((i) => i.path[0] === "pin");
      if (pinIssue) { setPinError(pinIssue.message); return; }
    }

    setPinError("");
    try {
      await requestPayout(formData);
      toast.success("Payout request submitted", { description: "Your payout is being processed." });
      handleClose();
    } catch (error: any) {
      toast.error("Payout request failed", {
        description: "We couldn’t process your payout. Check your account and balance, then try again. If the problem continues, contact support.",
      });
    }
  };

  const handleResolveDestination = async () => {
    if (!newLabel.trim() || !newBankCode || !/^\d{10}$/.test(newAccountNumber)) {
      toast.error("Check the account details", { description: "Enter a label, bank, and valid 10-digit account number." });
      return;
    }
    try {
      const resolved = await resolveAccount({ bankCode: newBankCode, accountNumber: newAccountNumber });
      setResolvedName(resolved.accountName);
    } catch {
      toast.error("Couldn’t verify this bank account", { description: "Check the details and try again. Contact support if the problem continues." });
    }
  };

  const handleRegisterDestination = async () => {
    try {
      const destination = await registerDestination({ label: newLabel.trim(), bankCode: newBankCode, accountNumber: newAccountNumber });
      await refetchDestinations();
      if (destination.isUsable) {
        setFormData((prev) => ({ ...prev, destinationId: destination.id }));
        toast.success("Bank account added", { description: "The account is ready for payouts." });
      } else {
        toast.message("Account sent for review", { description: "We’ll notify you when it’s ready to use." });
      }
      setAddingDestination(false);
      setNewLabel(""); setNewBankCode(""); setNewAccountNumber("");
      setResolvedName("");
    } catch {
      toast.error("Couldn’t add this bank account", { description: "Check the details and try again. Contact support if the problem continues." });
    }
  };

  const handleClose = () => {
    onClose();
    setStep("details");
    setFormData(emptyForm);
    setFieldErrors({});
    setPinError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "amount" ? parseFloat(value) || 0 : value }));
    clearFieldError(name);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === "details" ? "Request Payout" : "Enter PIN"}
      className="max-w-md bg-background shadow-lg rounded-xl flex flex-col items-center p-4 sm:p-6"
    >
      <div className="w-full flex flex-col items-center space-y-5">
        {step === "details" ? (
          <>
            <div className="w-full">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(availableBalance)}</p>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-foreground mb-1">Payout Amount</label>
              <Input
                type="number"
                name="amount"
                value={formData.amount || ""}
                onChange={handleInputChange}
                placeholder="Enter amount"
                className={`bg-muted border-border rounded-xl ${fieldErrors.amount ? "border-red-500" : ""}`}
                disabled={isPending}
              />
              <FieldError message={fieldErrors.amount} />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-foreground mb-1">Bank account</label>
              <Select value={formData.destinationId} onValueChange={(destinationId) => setFormData((prev) => ({ ...prev, destinationId }))} disabled={isPending}>
                <SelectTrigger className={`bg-muted border-border rounded-xl ${fieldErrors.destinationId ? "border-red-500" : ""}`}><SelectValue placeholder="Select an approved account" /></SelectTrigger>
                <SelectContent>{destinations?.filter((d: PayoutDestination) => d.isUsable).map((d: PayoutDestination) => <SelectItem key={d.id} value={d.id}>{d.label} · {d.bankName || "Bank"} •••• {d.last4}</SelectItem>)}</SelectContent>
              </Select>
              <FieldError message={fieldErrors.destinationId} />
              <button type="button" className="mt-2 text-sm text-home-accent underline" onClick={() => setAddingDestination((value) => !value)}>Add a bank account</button>
            </div>
            {addingDestination && <div className="w-full space-y-3 rounded-lg border border-border p-3">
              <Input value={newLabel} onChange={(e) => { setNewLabel(e.target.value); setResolvedName(""); }} placeholder="Account label" disabled={registering || resolving} />
              <Select value={newBankCode} onValueChange={(value) => { setNewBankCode(value); setResolvedName(""); }} disabled={registering || resolving}><SelectTrigger><SelectValue placeholder="Select a bank" /></SelectTrigger><SelectContent>{banks?.map((bank) => <SelectItem key={bank.code} value={bank.code}>{bank.name}</SelectItem>)}</SelectContent></Select>
              <Input value={newAccountNumber} onChange={(e) => { setNewAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10)); setResolvedName(""); }} placeholder="10-digit account number" inputMode="numeric" disabled={registering || resolving} />
              {resolvedName ? <><p className="text-sm text-foreground">Account holder: <strong>{resolvedName}</strong></p><Button type="button" onClick={handleRegisterDestination} disabled={registering}>{registering ? "Adding…" : "Confirm and add account"}</Button></> : <Button type="button" onClick={handleResolveDestination} disabled={registering || resolving}>{resolving ? "Verifying…" : "Verify account"}</Button>}
            </div>}

            <div className="bg-accent border border-border rounded-lg p-3 w-full">
              <p className="text-sm text-accent-foreground text-center">
                <strong>Note:</strong> Only approved bank accounts can receive payouts. New accounts are checked before they can be used.
              </p>
            </div>

            <div className="flex space-x-2 w-full">
              <Button variant="outline" className="flex-1 bg-transparent border-border hover:bg-accent text-foreground rounded-xl" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button variant="homeAccent" className="flex-1 px-6 shadow-lg" onClick={handleDetailsSubmit} disabled={isPending}>
                Next
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 w-full">
              <label htmlFor="pin" className="text-sm font-medium text-foreground text-center">
                Enter Your PIN
              </label>
              <InputOTP
                id="pin"
                maxLength={4}
                value={formData.pin}
                onChange={(value) => { setFormData((prev) => ({ ...prev, pin: value })); setPinError(""); }}
                disabled={isPending}
                type="password"
                className="flex justify-center"
              >
                <InputOTPGroup className="flex justify-center gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <InputOTPSlot key={i} index={i} className={`bg-muted border-border rounded-xl w-12 h-12 text-center ${pinError ? "border-red-500" : ""}`} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {pinError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <HugeiconsIcon icon={Alert01Icon} className="w-3.5 h-3.5 shrink-0" />
                  {pinError}
                </p>
              )}
            </div>

            <div className="bg-accent border border-border rounded-lg p-3 w-full">
              <p className="text-sm text-accent-foreground text-center">
                <strong>Note:</strong> Enter your 4-digit PIN to confirm the payout request.
              </p>
            </div>

            <div className="flex space-x-2 w-full">
              <Button variant="outline" className="flex-1 bg-transparent border-border hover:bg-accent text-foreground rounded-xl" onClick={() => { setStep("details"); setFormData((prev) => ({ ...prev, pin: "" })); setPinError(""); }} disabled={isPending}>
                Back
              </Button>
              <Button variant="homeAccent" className="flex-1 px-6 shadow-lg" onClick={handlePinSubmit} disabled={isPending || !formData.pin}>
                {isPending ? "Processing…" : "Submit"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
