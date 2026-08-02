import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GoodToKnowEditor } from "./good-to-know-editor";

describe("GoodToKnowEditor", () => {
  it("adds a point row", () => {
    const onChange = vi.fn();
    render(<GoodToKnowEditor points={[]} onChange={onChange} />);

    fireEvent.click(screen.getByText("+ Add Point"));

    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ text: "" })]);
  });
});
