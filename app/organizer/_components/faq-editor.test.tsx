import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FaqEditor } from "./faq-editor";

describe("FaqEditor", () => {
  it("adds a question/answer row", () => {
    const onChange = vi.fn();
    render(<FaqEditor items={[]} onChange={onChange} />);

    fireEvent.click(screen.getByText("+ Add Question"));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ question: "", answer: "" }),
    ]);
  });
});
