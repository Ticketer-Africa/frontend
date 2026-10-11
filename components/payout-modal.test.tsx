import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const requestPayout = vi.fn();
const onClose = vi.fn();

vi.mock("@/lib/auth-context", () => ({
  useUser: () => ({ user: { email: "organizer@example.com", name: "Organizer" } }),
}));

vi.mock("@/services/wallet/wallet.queries", () => ({
  useWithdrawWallet: () => ({ mutateAsync: requestPayout, isPending: false }),
}));

vi.mock("@/services/banks/bank.queries", () => ({
  useBankCodes: () => ({ data: [{ code: "058", name: "GTBank" }] }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/components/ui/modal", () => ({
  Modal: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
}));

// Radix Select and InputOTP don't drive well in jsdom; swap in native inputs.
vi.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange }: { value: string; onValueChange: (v: string) => void }) => (
    <select aria-label="Bank" value={value} onChange={(e) => onValueChange(e.target.value)}>
      <option value="">Select a bank</option>
      <option value="058">GTBank</option>
    </select>
  ),
  SelectContent: () => null,
  SelectItem: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
}));

vi.mock("@/components/ui/input-otp", () => ({
  InputOTP: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input aria-label="PIN" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
  InputOTPGroup: () => null,
  InputOTPSlot: () => null,
}));

import { PayoutModal } from "./payout-modal";

describe("PayoutModal", () => {
  it("stays on the page and closes after a successful withdrawal", async () => {
    // The withdraw endpoint returns no checkoutUrl.
    requestPayout.mockResolvedValue({
      message: "Withdrawal initiated successfully",
      reference: "withdraw_123",
      payout: {},
    });
    const assignedHrefs: unknown[] = [];
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        set href(value: unknown) {
          assignedHrefs.push(value);
        },
      },
    });

    render(<PayoutModal isOpen onClose={onClose} availableBalance={50000} />);

    fireEvent.change(screen.getByPlaceholderText("Enter amount"), { target: { name: "amount", value: "1000" } });
    fireEvent.change(screen.getByLabelText("Bank"), { target: { value: "058" } });
    fireEvent.change(screen.getByPlaceholderText("10-digit account number"), {
      target: { name: "account_number", value: "0123456789" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.change(screen.getByLabelText("PIN"), { target: { value: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(requestPayout).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 1000, bank_code: "058", account_number: "0123456789", pin: "1234" }),
    );
    expect(assignedHrefs).toEqual([]);

    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });
});
