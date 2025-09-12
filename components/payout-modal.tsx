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
import { useAuth } from "@/lib/auth-context";
import { useBankCodes } from "@/services/banks/bank.queries";
import { Bank } from "@/types/bank.type";

// Define Zod schema for WithdrawPayload
const createWithdrawPayloadSchema = (availableBalance: number) =>
  z.object({
    amount: z
      .number({ invalid_type_error: "Please enter a valid amount" })
      .positive("Amount must be greater than 0")
      .max(
        availableBalance,
        `Amount cannot exceed ${formatPrice(availableBalance)}`
      ),
    account_number: z
      .string()
      .regex(/^\d{10}$/, "Please enter a valid 10-digit account number"),
    bank_code: z.string().min(1, "Please select a bank"),
    narration: z.string().optional(),
    pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
  });

// Infer type from Zod schema
type WithdrawPayload = z.infer<
  ReturnType<typeof createWithdrawPayloadSchema>
> & {
  email: string;
  name: string;
};

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

export function PayoutModal({
  isOpen,
  onClose,
  availableBalance,
}: PayoutModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<"details" | "pin">("details");
  const [formData, setFormData] = useState<
    Omit<WithdrawPayload, "email" | "name">
  >({
    amount: 0,
    account_number: "",
    bank_code: "",
    narration: "",
    pin: "",
  });
  const { mutateAsync: requestPayout, isPending } = useWithdrawWallet();
  const { data: banks } = useBankCodes();

  const handleDetailsSubmit = () => {
    // Validate user data
    if (!user) {
      toast.error("User not authenticated");
      return;
    }
    if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      toast.error("Invalid user email address");
      return;
    }
    if (!user.name || user.name.trim().length < 2) {
      toast.error("Invalid user name");
      return;
    }

    // Validate payout details
    const schema = createWithdrawPayloadSchema(availableBalance).omit({
      pin: true,
    });
    const result = schema.safeParse(formData);

    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message).join(", ");
      toast.error(errors);
      return;
    }

    setStep("pin");
  };

  const handlePinSubmit = async () => {
    // Validate full payload with PIN
    const schema = createWithdrawPayloadSchema(availableBalance);
    const result = schema.safeParse(formData);

    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message).join(", ");
      toast.error(errors);
      return;
    }

    try {
      const response = await requestPayout({
        ...formData,
        email: user!.email,
        name: user!.name,
        narration: formData.narration || undefined,
      });
      toast.success("Payout request submitted! Redirecting to checkout...");
      window.location.href = response.checkoutUrl;
      onClose();
      setFormData({
        amount: 0,
        account_number: "",
        bank_code: "",
        narration: "",
        pin: "",
      });
      setStep("details");
    } catch (error: any) {
      console.error("Payout error:", error.message);
      toast.error(error?.message || "Failed to submit payout request");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handlePinChange = (value: string) => {
    setFormData((prev) => ({ ...prev, pin: value }));
  };

  const handleBack = () => {
    setStep("details");
    setFormData((prev) => ({ ...prev, pin: "" }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setStep("details");
        setFormData({
          amount: 0,
          account_number: "",
          bank_code: "",
          narration: "",
          pin: "",
        });
      }}
      title={step === "details" ? "Request Payout" : "Enter PIN"}
      className="max-w-md bg-white shadow-lg rounded-xl flex flex-col items-center p-6"
    >
      <div className="w-full flex flex-col items-center space-y-6">
        {step === "details" ? (
          <>
            <div className="w-full">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(availableBalance)}
              </p>
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Payout Amount
              </label>
              <Input
                type="number"
                name="amount"
                value={formData.amount || ""}
                onChange={handleInputChange}
                placeholder="Enter amount"
                className="bg-gray-50 border-gray-200 rounded-xl"
                disabled={isPending}
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Bank
              </label>
              <Select
                value={formData.bank_code}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, bank_code: value }))
                }
                disabled={isPending}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks &&
                    banks?.map((bank: Bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Account Number
              </label>
              <Input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                placeholder="Enter account number"
                className="bg-gray-50 border-gray-200 rounded-xl"
                disabled={isPending}
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Narration (Optional)
              </label>
              <Input
                type="text"
                name="narration"
                value={formData.narration}
                onChange={handleInputChange}
                placeholder="Enter narration (optional)"
                className="bg-gray-50 border-gray-200 rounded-xl"
                disabled={isPending}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full">
              <p className="text-sm text-blue-800 text-center">
                <strong>Note:</strong> Payouts are processed within 3-5 business
                days. Ensure your bank details are correct to avoid delays.
              </p>
            </div>
            <div className="flex space-x-2 w-full">
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900 rounded-xl"
                onClick={() => {
                  onClose();
                  setStep("details");
                  setFormData({
                    amount: 0,
                    account_number: "",
                    bank_code: "",
                    narration: "",
                    pin: "",
                  });
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleDetailsSubmit}
                disabled={isPending}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 w-full">
              <label
                htmlFor="pin"
                className="text-sm font-medium text-gray-900 text-center"
              >
                Enter Your PIN
              </label>
              <InputOTP
                id="pin"
                maxLength={4}
                value={formData.pin}
                onChange={handlePinChange}
                disabled={isPending}
                type="password"
                className="flex justify-center"
              >
                <InputOTPGroup className="flex justify-center gap-2">
                  <InputOTPSlot
                    index={0}
                    className="bg-gray-50 border-gray-200 rounded-xl w-12 h-12 text-center"
                  />
                  <InputOTPSlot
                    index={1}
                    className="bg-gray-50 border-gray-200 rounded-xl w-12 h-12 text-center"
                  />
                  <InputOTPSlot
                    index={2}
                    className="bg-gray-50 border-gray-200 rounded-xl w-12 h-12 text-center"
                  />
                  <InputOTPSlot
                    index={3}
                    className="bg-gray-50 border-gray-200 rounded-xl w-12 h-12 text-center"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full">
              <p className="text-sm text-blue-800 text-center">
                <strong>Note:</strong> Enter your 4-digit PIN to confirm the
                payout request.
              </p>
            </div>
            <div className="flex space-x-2 w-full">
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900 rounded-xl"
                onClick={handleBack}
                disabled={isPending}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handlePinSubmit}
                disabled={isPending || !formData.pin}
              >
                {isPending ? "Processing..." : "Submit"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
