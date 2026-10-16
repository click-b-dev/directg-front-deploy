import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Separator } from "@/components/separator";

describe("Separator", () => {
  it('renders with role="separator"', () => {
    render(<Separator.Root />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("is horizontal by default", () => {
    render(<Separator.Root />);
    const el = screen.getByRole("separator");
    expect(el).toHaveAttribute("data-orientation", "horizontal");
    // horizontal separator should NOT have aria-orientation (default)
    expect(el).not.toHaveAttribute("aria-orientation");
  });

  it('sets aria-orientation="vertical" when orientation is vertical', () => {
    render(<Separator.Root orientation="vertical" />);
    const el = screen.getByRole("separator");
    expect(el).toHaveAttribute("aria-orientation", "vertical");
    expect(el).toHaveAttribute("data-orientation", "vertical");
  });

  it('renders with role="none" when decorative', () => {
    render(<Separator.Root decorative />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    const el = screen.getByRole("none");
    expect(el).toBeInTheDocument();
  });

  it("has data-scope and data-part attributes", () => {
    render(<Separator.Root />);
    const el = screen.getByRole("separator");
    expect(el).toHaveAttribute("data-scope", "separator");
    expect(el).toHaveAttribute("data-part", "root");
  });
});
