import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toggle } from "@/components/toggle";

describe("Toggle", () => {
  it('renders with aria-pressed="false" by default', () => {
    render(<Toggle>Bold</Toggle>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("clicking toggles pressed state", async () => {
    const user = userEvent.setup();
    render(<Toggle>Bold</Toggle>);
    const btn = screen.getByRole("button");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("data-state", "on");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).toHaveAttribute("data-state", "off");
  });

  it("controlled mode: pressed prop + onPressedChange callback", async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <Toggle pressed={false} onPressedChange={onPressedChange}>
        Bold
      </Toggle>,
    );

    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-pressed", "false");

    await user.click(btn);
    expect(onPressedChange).toHaveBeenCalledWith(true);

    rerender(
      <Toggle pressed={true} onPressedChange={onPressedChange}>
        Bold
      </Toggle>,
    );
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it('data-state reflects "on"/"off"', () => {
    const { rerender } = render(<Toggle defaultPressed={true}>Bold</Toggle>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-state", "on");

    rerender(<Toggle defaultPressed={false}>Bold</Toggle>);
    // defaultPressed only applies on mount, so we test with fresh render
    const { unmount } = render(<Toggle>Italic</Toggle>);
    expect(screen.getByRole("button", { name: "Italic" })).toHaveAttribute("data-state", "off");
    unmount();
  });

  it("disabled toggle does not change state on click", async () => {
    const user = userEvent.setup();
    render(<Toggle disabled>Bold</Toggle>);
    const btn = screen.getByRole("button");

    expect(btn).toBeDisabled();

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });
});
