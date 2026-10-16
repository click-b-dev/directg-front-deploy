import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/button";

describe("Button", () => {
  it("renders as a button element", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: "Click me" });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("type", "button");
  });

  it("click handler fires", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("toggle mode: aria-pressed toggles based on pressed prop", () => {
    const { rerender } = render(<Button pressed={false}>Toggle</Button>);
    const btn = screen.getByRole("button");

    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).toHaveAttribute("data-state", "off");

    rerender(<Button pressed={true}>Toggle</Button>);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("data-state", "on");
  });

  it("non-toggle mode: no aria-pressed attribute", () => {
    render(<Button>Normal</Button>);
    const btn = screen.getByRole("button");
    expect(btn).not.toHaveAttribute("aria-pressed");
    expect(btn).not.toHaveAttribute("data-state");
  });

  it("disabled: aria-disabled is set, click does not fire", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const btn = screen.getByRole("button");

    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(btn).toBeDisabled();

    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("accepts custom type attribute", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
