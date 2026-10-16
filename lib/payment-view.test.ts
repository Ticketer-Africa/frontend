import { describe, expect, it } from "vitest";
import { derivePaymentView } from "./payment-view";

describe("derivePaymentView", () => {
  it("is invalid when the link is not found, whatever else is known", () => {
    expect(derivePaymentView({ notFound: true, elapsedMs: 0 })).toBe("invalid");
    expect(
      derivePaymentView({ status: "success", notFound: true, elapsedMs: 0 })
    ).toBe("invalid");
  });

  it("is confirmed once the payment succeeds, however long it took", () => {
    expect(
      derivePaymentView({ status: "success", notFound: false, elapsedMs: 0 })
    ).toBe("confirmed");
    expect(
      derivePaymentView({ status: "success", notFound: false, elapsedMs: 900_000 })
    ).toBe("confirmed");
  });

  it("is failed when the payment failed", () => {
    expect(
      derivePaymentView({ status: "failed", notFound: false, elapsedMs: 1_000 })
    ).toBe("failed");
  });

  it("is confirming for the first minute, including before the first answer", () => {
    expect(derivePaymentView({ notFound: false, elapsedMs: 0 })).toBe("confirming");
    expect(
      derivePaymentView({ status: "pending", notFound: false, elapsedMs: 59_999 })
    ).toBe("confirming");
  });

  it("is slow from one minute until ten", () => {
    expect(
      derivePaymentView({ status: "pending", notFound: false, elapsedMs: 60_000 })
    ).toBe("slow");
    expect(
      derivePaymentView({ status: "pending", notFound: false, elapsedMs: 599_999 })
    ).toBe("slow");
  });

  it("gives up after ten minutes", () => {
    expect(
      derivePaymentView({ status: "pending", notFound: false, elapsedMs: 600_000 })
    ).toBe("gave-up");
  });
});
