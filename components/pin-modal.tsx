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

export default function PinModal({ isOpen, onClose, hasPin }: PinModalProps) {
  const [newPin, setNewPin] = useState("");
  const [oldPin, setOldPin] = useState("");
  const { mutateAsync, isPending } = useSetWalletPin();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast.error("New PIN must be exactly 4 digits");
      return;
    }
    if (hasPin && (oldPin.length !== 4 || !/^\d{4}$/.test(oldPin))) {
      toast.error("Current PIN must be exactly 4 digits");
      return;
    }
    const payload: SetWalletPinPayload = { newPin };
    if (hasPin) {
      payload.oldPin = oldPin;
    }
    try {
      await mutateAsync(payload);
      toast.success(
        hasPin ? "PIN updated successfully" : "PIN set successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["wallet-pin-status"] });
      setNewPin("");
      setOldPin("");
      onClose();
    } catch (error: any) {
      console.error("Error setting PIN:", error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white shadow-lg rounded-xl flex flex-col items-center p-6">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-center">
            {hasPin ? "Update Wallet PIN" : "Set Wallet PIN"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center"
        >
          <div className="space-y-6 py-4 w-full">
            {hasPin && (
              <div className="flex flex-col items-center gap-2">
                <Label
                  htmlFor="oldPin"
                  className="text-sm font-medium text-gray-900 text-center"
                >
                  Current PIN
                </Label>
                <InputOTP
                  id="oldPin"
                  maxLength={4}
                  value={oldPin}
                  onChange={setOldPin}
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
            )}
            <div className="flex flex-col items-center gap-2">
              <Label
                htmlFor="newPin"
                className="text-sm font-medium text-gray-900 text-center"
              >
                New PIN
              </Label>
              <InputOTP
                id="newPin"
                maxLength={4}
                value={newPin}
                onChange={setNewPin}
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 text-center">
                <strong>Note:</strong> Your PIN must be a 4-digit number. Keep
                it secure and do not share it with anyone.
              </p>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 w-full">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900 rounded-xl"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Processing..." : hasPin ? "Update PIN" : "Set PIN"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
