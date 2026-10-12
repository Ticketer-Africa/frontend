import { describe, expect, it } from "vitest";
import { calculateCosts, calculateGatewayFee } from "./types";

describe("calculateGatewayFee", () => {
  it("matches what Kora took on a ₦3,500 pay-in", () => {
    expect(calculateGatewayFee(3500)).toBe(56.44);
  });
});

describe("calculateCosts", () => {
  it("adds the platform fee and the gateway fee with VAT", () => {
    const costs = calculateCosts(
      null,
      [{ id: "cat-1", price: 10000 } as never],
      { "cat-1": 1 },
      350
    );
    expect(costs).toEqual({
      baseAmount: 10000,
      platformFee: 350,
      gatewayFee: 161.25,
      totalAmount: 10511.25,
    });
  });

  it("charges nothing on an empty order", () => {
    expect(calculateCosts(null, [], {}).totalAmount).toBe(0);
  });
});
