import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@/lib/auth-context", () => ({
  useUser: () => ({ user: null }),
}));

import { PricingSection } from "./pricing-section";

describe("PricingSection", () => {
  it("explains the resale fee as event ticket resales", () => {
    render(<PricingSection />);

    expect(screen.getByRole("heading", { name: "Event Ticket Resales" })).toBeInTheDocument();
    expect(screen.getByText("A fair, simple way to resell tickets.")).toBeInTheDocument();
  });
});
