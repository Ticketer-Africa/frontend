import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShowTimelineEditor } from "./show-timeline-editor";

describe("ShowTimelineEditor", () => {
  it("adds a time slot row", () => {
    const onChange = vi.fn();
    render(<ShowTimelineEditor slots={[]} onChange={onChange} />);

    fireEvent.click(screen.getByText("+ Add Time Slot"));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ time: "", stage: "", performer: "" }),
    ]);
  });
});
