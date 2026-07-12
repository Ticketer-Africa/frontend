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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useWithdrawWallet } from "@/services/wallet/wallet.queries";
import { toast } from "sonner";
import { formatPrice } from "@/lib/helpers";
import { useUser } from "@/lib/auth-context";
import { useBankCodes } from "@/services/banks/bank.queries";
import { Bank } from "@/types/bank.type";
import { AlertCircle } from "lucide-react";

const createWithdrawPayloadSchema = (availableBalance: number) =>
  z.object({
    amount: z
      .number({ invalid_type_error: "Enter a valid amount" })
      .positive("Amount must be greater than 0")
      .max(availableBalance, `Amount cannot exceed ${formatPrice(availableBalance)}`),
    account_number: z
      .string()
      .regex(/^\d{10}$/, "Enter a valid 10-digit account number"),
    bank_code: z.string().min(1, "Select a bank"),
    narration: z.string().optional(),
    pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
  });

type WithdrawPayload = z.infer<ReturnType<typeof createWithdrawPayloadSchema>> & {
  email: string;
  name: string;
};

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

const emptyForm = { amount: 0, account_number: "", bank_code: "", narration: "", pin: "" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  );
}

export function PayoutModal({ isOpen, onClose, availableBalance }: PayoutModalProps) {
  const { user } = useUser();
  const [step, setStep] = useState<"details" | "pin">("details");
  const [formData, setFormData] = useState<Omit<WithdrawPayload, "email" | "name">>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pinError, setPinError] = useState("");
  const { mutateAsync: requestPayout, isPending } = useWithdrawWallet();
  const { data: banks } = useBankCodes();

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  const handleDetailsSubmit = () => {
    if (!user) {
      toast.error("You must be logged in to request a payout");
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
      const response = await requestPayout({
        ...formData,
        email: user!.email,
        name: user!.name,
        narration: formData.narration || undefined,
      });
      toast.success("Payout request submitted! Redirecting to checkout…");
      window.location.href = response.checkoutUrl;
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit payout request. Please try again.");
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
      className="max-w-md bg-white shadow-lg rounded-xl flex flex-col items-center p-6"
    >
      <div className="w-full flex flex-col items-center space-y-5">
        {step === "details" ? (
          <>
            <div className="w-full">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(availableBalance)}</p>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-900 mb-1">Payout Amount</label>
              <Input
                type="number"
                name="amount"
                value={formData.amount || ""}
                onChange={handleInputChange}
                placeholder="Enter amount"
                className={`bg-gray-50 border-gray-200 rounded-xl ${fieldErrors.amount ? "border-red-500" : ""}`}
                disabled={isPending}
              />
              <FieldError message={fieldErrors.amount} />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-900 mb-1">Bank</label>
              <Select
                value={formData.bank_code}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, bank_code: value }));
                  clearFieldError("bank_code");
                }}
                disabled={isPending}
              >
                <SelectTrigger className={`bg-gray-50 border-gray-200 rounded-xl ${fieldErrors.bank_code ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks?.map((bank: Bank) => (
                    <SelectItem key={bank.code} value={bank.code}>{bank.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors.bank_code} />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-900 mb-1">Account Number</label>
              <Input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                placeholder="10-digit account number"
                maxLength={10}
                className={`bg-gray-50 border-gray-200 rounded-xl ${fieldErrors.account_number ? "border-red-500" : ""}`}
                disabled={isPending}
              />
              <FieldError message={fieldErrors.account_number} />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Narration <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input
                type="text"
                name="narration"
                value={formData.narration}
                onChange={handleInputChange}
                placeholder="e.g. Event proceeds"
                className="bg-gray-50 border-gray-200 rounded-xl"
                disabled={isPending}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full">
              <p className="text-sm text-blue-800 text-center">
                <strong>Note:</strong> Payouts are processed within 3–5 business days. Ensure your bank details are correct to avoid delays.
              </p>
            </div>

            <div className="flex space-x-2 w-full">
              <Button variant="outline" className="flex-1 bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900 rounded-xl" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button className="flex-1 bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150" onClick={handleDetailsSubmit} disabled={isPending}>
                Next
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 w-full">
              <label htmlFor="pin" className="text-sm font-medium text-gray-900 text-center">
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
                    <InputOTPSlot key={i} index={i} className={`bg-gray-50 border-gray-200 rounded-xl w-12 h-12 text-center ${pinError ? "border-red-500" : ""}`} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {pinError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {pinError}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full">
              <p className="text-sm text-blue-800 text-center">
                <strong>Note:</strong> Enter your 4-digit PIN to confirm the payout request.
              </p>
            </div>

            <div className="flex space-x-2 w-full">
              <Button variant="outline" className="flex-1 bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900 rounded-xl" onClick={() => { setStep("details"); setFormData((prev) => ({ ...prev, pin: "" })); setPinError(""); }} disabled={isPending}>
                Back
              </Button>
              <Button className="flex-1 bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150" onClick={handlePinSubmit} disabled={isPending || !formData.pin}>
                {isPending ? "Processing…" : "Submit"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
