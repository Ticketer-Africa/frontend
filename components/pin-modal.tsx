"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon } from "@hugeicons/core-free-icons";
import { Label } from "@/components/ui/label";
import { useSetWalletPin } from "@/services/wallet/wallet.queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SetWalletPinPayload } from "@/types/wallet.type";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasPin: boolean;
}

const OTP_SLOTS = [0, 1, 2, 3];

export default function PinModal({ isOpen, onClose, hasPin }: PinModalProps) {
  const [newPin, setNewPin] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [newPinError, setNewPinError] = useState("");
  const [oldPinError, setOldPinError] = useState("");
  const { mutateAsync, isPending } = useSetWalletPin();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setNewPinError("New PIN must be exactly 4 digits");
      hasError = true;
    }
    if (hasPin && (oldPin.length !== 4 || !/^\d{4}$/.test(oldPin))) {
      setOldPinError("Current PIN must be exactly 4 digits");
      hasError = true;
    }
    if (hasError) return;

    const payload: SetWalletPinPayload = { newPin };
    if (hasPin) payload.oldPin = oldPin;

    try {
      await mutateAsync(payload);
      toast.success(hasPin ? "PIN updated" : "PIN set", {
        description: hasPin
          ? "Your wallet PIN has been updated."
          : "Your wallet PIN has been set up.",
      });
      queryClient.invalidateQueries({ queryKey: ["wallet-pin-status"] });
      setNewPin("");
      setOldPin("");
      setNewPinError("");
      setOldPinError("");
      onClose();
    } catch (error: any) {
      toast.error("PIN update failed", {
        description: error?.message || "Please try again.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background shadow-lg rounded-xl flex flex-col items-center p-6">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center">
            {hasPin ? "Update Wallet PIN" : "Set Wallet PIN"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="space-y-6 py-4 w-full">
            {hasPin && (
              <div className="flex flex-col items-center gap-2">
                <Label htmlFor="oldPin" className="text-sm font-medium text-foreground text-center">
                  Current PIN
                </Label>
                <InputOTP
                  id="oldPin"
                  maxLength={4}
                  value={oldPin}
                  onChange={(v) => { setOldPin(v); setOldPinError(""); }}
                  disabled={isPending}
                  type="password"
                  className="flex justify-center"
                >
                  <InputOTPGroup className="flex justify-center gap-2">
                    {OTP_SLOTS.map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className={`bg-muted rounded-xl w-12 h-12 text-center ${oldPinError ? "border-red-500" : "border-border"}`}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {oldPinError && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <HugeiconsIcon icon={Alert01Icon} className="w-3.5 h-3.5 shrink-0" />
                    {oldPinError}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col items-center gap-2">
              <Label htmlFor="newPin" className="text-sm font-medium text-foreground text-center">
                New PIN
              </Label>
              <InputOTP
                id="newPin"
                maxLength={4}
                value={newPin}
                onChange={(v) => { setNewPin(v); setNewPinError(""); }}
                disabled={isPending}
                type="password"
                className="flex justify-center"
              >
                <InputOTPGroup className="flex justify-center gap-2">
                  {OTP_SLOTS.map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className={`bg-muted rounded-xl w-12 h-12 text-center ${newPinError ? "border-red-500" : "border-border"}`}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {newPinError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <HugeiconsIcon icon={Alert01Icon} className="w-3.5 h-3.5 shrink-0" />
                  {newPinError}
                </p>
              )}
            </div>

            <div className="bg-accent border border-border rounded-lg p-3">
              <p className="text-sm text-accent-foreground text-center">
                <strong>Note:</strong> Your PIN must be a 4-digit number. Keep it secure and do not share it with anyone.
              </p>
            </div>
          </div>

          <DialogFooter className="flex space-x-2 w-full">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent border-border hover:bg-accent text-foreground rounded-xl"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Processing…" : hasPin ? "Update PIN" : "Set PIN"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
