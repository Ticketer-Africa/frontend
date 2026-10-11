import { describe, expect, it } from "vitest";
import { formatAmount } from "./transaction-utils";
import { formatPrice } from "@/lib/helpers";

describe("formatAmount", () => {
  it("shows a withdrawal as money out", () => {
    expect(formatAmount(300, "WITHDRAW")).toBe(`−${formatPrice(300)}`);
  });

  it("shows ticket sales and resale fees as money in", () => {
    expect(formatAmount(7000, "PURCHASE")).toBe(`+${formatPrice(7000)}`);
    expect(formatAmount(350, "RESALE")).toBe(`+${formatPrice(350)}`);
  });

  it("ignores the sign the amount arrives with", () => {
    expect(formatAmount(-300, "WITHDRAW")).toBe(`−${formatPrice(300)}`);
  });
});
