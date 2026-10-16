import { describe, expect, it, vi } from "vitest";
import axios from "@/services/axios";
import { getPaymentStatus } from "./payment-status";

vi.mock("@/services/axios", () => ({ default: { get: vi.fn() } }));

describe("getPaymentStatus", () => {
  it("asks the status endpoint with a timeout so a hung request can't stall polling", async () => {
    const body = { status: "pending", event: null, tickets: [] };
    vi.mocked(axios.get).mockResolvedValue({ data: body });

    await expect(getPaymentStatus("V2_PURCHASE_ABC", "a-b_c")).resolves.toEqual(body);

    expect(axios.get).toHaveBeenCalledWith(
      "/v1/payment/status/V2_PURCHASE_ABC/a-b_c",
      expect.objectContaining({ timeout: 10_000 })
    );
  });
});
