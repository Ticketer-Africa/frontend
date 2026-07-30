import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LineupEditor } from "./lineup-editor";

describe("LineupEditor", () => {
  it("adds an artist row and calls onChange with the updated list", () => {
    const onChange = vi.fn();
    render(<LineupEditor artists={[]} onChange={onChange} />);

    fireEvent.click(screen.getByText("+ Add Artist"));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: "" }),
    ]);
  });

  it("removes an artist row", () => {
    const onChange = vi.fn();
    render(
      <LineupEditor
        artists={[{ id: "1", name: "Burna Boy" }]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Remove artist"));

    expect(onChange).toHaveBeenCalledWith([]);
  });
});
