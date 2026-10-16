import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "@/components/switch";

function renderSwitch(props: Parameters<typeof Switch.Root>[0] = {}) {
  return render(
    <Switch.Root {...props}>
      <Switch.Control data-testid="control">
        <Switch.Thumb data-testid="thumb" />
      </Switch.Control>
      <Switch.Label>Test Switch</Switch.Label>
      <Switch.HiddenInput data-testid="hidden-input" />
    </Switch.Root>,
  );
}

describe("Switch", () => {
  it("renders unchecked by default", () => {
    renderSwitch();
    const control = screen.getByTestId("control");
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(control).toHaveAttribute("data-state", "unchecked");
  });

  it("clicking control toggles checked state", async () => {
    const user = userEvent.setup();
    renderSwitch();
    const control = screen.getByTestId("control");

    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(control).toHaveAttribute("data-state", "checked");

    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "false");
  });

  it("Space key toggles", async () => {
    const user = userEvent.setup();
    renderSwitch();
    const control = screen.getByTestId("control");

    control.focus();
    await user.keyboard(" ");

    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("has role=switch on control", () => {
    renderSwitch();
    const control = screen.getByTestId("control");
    expect(control).toHaveAttribute("role", "switch");
  });

  it("aria-checked reflects state", async () => {
    const user = userEvent.setup();
    renderSwitch();
    const control = screen.getByTestId("control");

    expect(control).toHaveAttribute("aria-checked", "false");

    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("disabled prevents toggling", async () => {
    const user = userEvent.setup();
    renderSwitch({ disabled: true });
    const control = screen.getByTestId("control");

    expect(control).toHaveAttribute("aria-disabled", "true");

    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "false");
  });

  it("controlled mode with onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Switch.Root checked={false} onCheckedChange={onCheckedChange}>
        <Switch.Control data-testid="control" />
        <Switch.HiddenInput />
      </Switch.Root>,
    );

    await user.click(screen.getByTestId("control"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
