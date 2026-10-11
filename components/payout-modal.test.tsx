import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

type Destination = {
  id: string;
  label: string;
  bankName: string | null;
  last4: string;
  resolvedAccountName: string | null;
  status: string;
  statusReason: string | null;
  isUsable: boolean;
  isDefault: boolean;
};

const requestPayout = vi.fn();
const resolveAccount = vi.fn();
const registerDestination = vi.fn();
const refetchDestinations = vi.fn();
const onClose = vi.fn();

const usableDestination: Destination = {
  id: "dest_ok",
  label: "Main account",
  bankName: "GTBank",
  last4: "6789",
  resolvedAccountName: "ADA OBI",
  status: "approved",
  statusReason: null,
  isUsable: true,
  isDefault: true,
};
const pendingDestination: Destination = {
  ...usableDestination,
  id: "dest_pending",
  label: "Pending account",
  last4: "1111",
  status: "pending_review",
  isUsable: false,
  isDefault: false,
};

// Mutable so the refetch mock can "return" a newly registered destination.
let destinations: Destination[] = [];

vi.mock("@/lib/auth-context", () => ({
  useUser: () => ({ user: { email: "organizer@example.com", name: "Organizer" } }),
}));

vi.mock("@/services/wallet/wallet.queries", () => ({
  useWithdrawWallet: () => ({ mutateAsync: requestPayout, isPending: false }),
  usePayoutBanks: () => ({ data: [{ code: "058", name: "GTBank" }] }),
  usePayoutDestinations: () => ({ data: destinations, refetch: refetchDestinations }),
  useRegisterPayoutDestination: () => ({ mutateAsync: registerDestination, isPending: false }),
  useResolvePayoutAccount: () => ({ mutateAsync: resolveAccount, isPending: false }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), message: vi.fn() } }));

vi.mock("@/components/ui/modal", () => ({
  Modal: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
}));

// Radix Select and InputOTP don't drive well in jsdom; swap in native inputs.
// The destination select is the first combobox; the bank select (add-account form) is the second.
vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
  }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      <option value="">Select</option>
      {children}
    </select>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
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

const destinationSelect = () => screen.getAllByRole("combobox")[0];
const bankSelect = () => screen.getAllByRole("combobox")[1];

function enterAmount(value: string) {
  fireEvent.change(screen.getByPlaceholderText("Enter amount"), { target: { name: "amount", value } });
}

function submitPin(pin: string) {
  fireEvent.change(screen.getByLabelText("PIN"), { target: { value: pin } });
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
}

describe("PayoutModal", () => {
  const originalLocation = window.location;
  let assignedHrefs: unknown[];

  beforeEach(() => {
    vi.clearAllMocks();
    requestPayout.mockReset();
    resolveAccount.mockReset();
    registerDestination.mockReset();
    refetchDestinations.mockReset();
    refetchDestinations.mockResolvedValue({});
    destinations = [usableDestination, pendingDestination];

    // Any navigation (window.location.href = ...) would be recorded here.
    assignedHrefs = [];
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        set href(value: unknown) {
          assignedHrefs.push(value);
        },
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("only offers usable destinations in the account select", () => {
    render(<PayoutModal isOpen onClose={onClose} availableBalance={50000} />);

    expect(screen.getByRole("option", { name: /Main account/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Pending account/ })).not.toBeInTheDocument();
  });

  it("withdraws to an existing destination, stays on the page and closes after success", async () => {
    // The withdraw endpoint returns no checkoutUrl.
    requestPayout.mockResolvedValue({ message: "Withdrawal initiated successfully", reference: "withdraw_123" });

    render(<PayoutModal isOpen onClose={onClose} availableBalance={50000} />);

    enterAmount("1000");
    fireEvent.change(destinationSelect(), { target: { value: "dest_ok" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    submitPin("1234");

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(requestPayout).toHaveBeenCalledTimes(1);
    expect(requestPayout).toHaveBeenCalledWith({ destinationId: "dest_ok", amount: 1000, pin: "1234" });
    expect(toast.success).toHaveBeenCalledWith("Payout request submitted", expect.anything());
    expect(toast.error).not.toHaveBeenCalled();
    expect(assignedHrefs).toEqual([]);
  });

  it("does not advance to the PIN step without a destination", () => {
    render(<PayoutModal isOpen onClose={onClose} availableBalance={50000} />);

    enterAmount("1000");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Select an approved bank account")).toBeInTheDocument();
    expect(screen.queryByLabelText("PIN")).not.toBeInTheDocument();
    expect(requestPayout).not.toHaveBeenCalled();
  });

  it("resolves the account name, then registers the destination and selects it for payout", async () => {
    const newDestination: Destination = {
      ...usableDestination,
      id: "dest_new",
      label: "Savings",
      last4: "4321",
      resolvedAccountName: "CHIDI OKAFOR",
      isDefault: false,
    };
    resolveAccount.mockResolvedValue({ accountName: "CHIDI OKAFOR", bankName: "GTBank" });
    registerDestination.mockResolvedValue(newDestination);
    refetchDestinations.mockImplementation(async () => {
      destinations = [...destinations, newDestination];
      return {};
    });
    requestPayout.mockResolvedValue({ reference: "withdraw_456" });

    render(<PayoutModal isOpen onClose={onClose} availableBalance={50000} />);

    fireEvent.click(screen.getByRole("button", { name: "Add a bank account" }));
    fireEvent.change(screen.getByPlaceholderText("Account label"), { target: { value: "Savings" } });
    fireEvent.change(bankSelect(), { target: { value: "058" } });
    fireEvent.change(screen.getByPlaceholderText("10-digit account number"), { target: { value: "0123454321" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify account" }));

    // Step 1: the account name is resolved and shown; nothing is registered yet.
    expect(await screen.findByText("CHIDI OKAFOR")).toBeInTheDocument();
    expect(resolveAccount).toHaveBeenCalledWith({ bankCode: "058", accountNumber: "0123454321" });
    expect(registerDestination).not.toHaveBeenCalled();

    // Step 2: the user confirms the resolved name and the destination is registered.
    fireEvent.click(screen.getByRole("button", { name: "Confirm and add account" }));

    await waitFor(() => expect(registerDestination).toHaveBeenCalledTimes(1));
    expect(registerDestination).toHaveBeenCalledWith({ label: "Savings", bankCode: "058", accountNumber: "0123454321" });
    expect(resolveAccount.mock.invocationCallOrder[0]).toBeLessThan(registerDestination.mock.invocationCallOrder[0]);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Bank account added", expect.anything()));
    expect(refetchDestinations).toHaveBeenCalled();

    // The add form collapses and the new destination is preselected for the withdrawal.
    expect(screen.queryByPlaceholderText("10-digit account number")).not.toBeInTheDocument();
    await waitFor(() => expect(destinationSelect()).toHaveValue("dest_new"));

    enterAmount("2500");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    submitPin("4321");

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(requestPayout).toHaveBeenCalledWith({ destinationId: "dest_new", amount: 2500, pin: "4321" });
    expect(assignedHrefs).toEqual([]);
  });

  it("shows an error toast and stays open when the withdrawal fails", async () => {
    requestPayout.mockRejectedValue(new Error("Insufficient balance"));

    render(<PayoutModal isOpen onClose={onClose} availableBalance={50000} />);

    enterAmount("1000");
    fireEvent.change(destinationSelect(), { target: { value: "dest_ok" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    submitPin("1234");

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Payout request failed", expect.anything()));
    expect(requestPayout).toHaveBeenCalledWith({ destinationId: "dest_ok", amount: 1000, pin: "1234" });
    expect(toast.success).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    // Still on the PIN step, so the user can retry.
    expect(screen.getByLabelText("PIN")).toHaveValue("1234");
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(assignedHrefs).toEqual([]);
  });
});
