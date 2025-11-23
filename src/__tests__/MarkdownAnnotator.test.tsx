import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownAnnotator } from "../MarkdownAnnotator";

describe("MarkdownAnnotator", () => {
  it("renders markdown content", () => {
    render(<MarkdownAnnotator defaultValue="# Hello World" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders with default annotations", () => {
    const annotations = [{ id: 1, note: "Test annotation" }];
    render(
      <MarkdownAnnotator
        defaultValue="Test content"
        defaultAnnotations={annotations}
      />
    );
    expect(screen.getByText("Test annotation")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <MarkdownAnnotator defaultValue="Test" className="custom-class" />
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});

