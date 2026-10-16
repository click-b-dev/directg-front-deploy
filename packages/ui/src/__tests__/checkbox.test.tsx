import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "@/components/checkbox";

function renderCheckbox(props: Parameters<typeof Checkbox.Root>[0] = {}) {
  return render(
    <Checkbox.Root {...props}>
      <Checkbox.Control data-testid="control">
        <Checkbox.Indicator data-testid="indicator" />
      </Checkbox.Control>
      <Checkbox.Label>Test Checkbox</Checkbox.Label>
      <Checkbox.HiddenInput data-testid="hidden-input" />
    </Checkbox.Root>,
  );
}

describe("Checkbox", () => {
  it("renders unchecked by default", () => {
    renderCheckbox();
    const control = screen.getByTestId("control");
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(control).toHaveAttribute("data-state", "unchecked");
  });

  it("clicking control toggles checked state", async () => {
    const user = userEvent.setup();
    renderCheckbox();
    const control = screen.getByTestId("control");

    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(control).toHaveAttribute("data-state", "checked");

    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(control).toHaveAttribute("data-state", "unchecked");
  });

  it("Space key toggles checked state", async () => {
    const user = userEvent.setup();
    renderCheckbox();
    const control = screen.getByTestId("control");

    control.focus();
    await user.keyboard(" ");

    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("controlled mode: calls onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <Checkbox.Root checked={false} onCheckedChange={onCheckedChange}>
        <Checkbox.Control data-testid="control" />
        <Checkbox.HiddenInput />
      </Checkbox.Root>,
    );

    const control = screen.getByTestId("control");
    await user.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);

    // Simulate parent updating controlled prop
    rerender(
      <Checkbox.Root checked={true} onCheckedChange={onCheckedChange}>
        <Checkbox.Control data-testid="control" />
        <Checkbox.HiddenInput />
      </Checkbox.Root>,
    );

    expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
  });

  it("disabled state prevents toggling", async () => {
    const user = userEvent.setup();
    renderCheckbox({ disabled: true });
    const control = screen.getByTestId("control");

    expect(control).toHaveAttribute("aria-disabled", "true");

    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "false");
  });

  it("indeterminate state", () => {
    renderCheckbox({ checked: "indeterminate" });
    const control = screen.getByTestId("control");

    expect(control).toHaveAttribute("aria-checked", "mixed");
    expect(control).toHaveAttribute("data-state", "indeterminate");
  });

  it("hidden input reflects checked value", async () => {
    const user = userEvent.setup();
    renderCheckbox();

    const hiddenInput = screen.getByTestId("hidden-input") as HTMLInputElement;
    expect(hiddenInput.checked).toBe(false);

    const control = screen.getByTestId("control");
    await user.click(control);
    expect(hiddenInput.checked).toBe(true);
  });

  it("hidden input has correct type and value", () => {
    renderCheckbox({ name: "agree", value: "yes" });
    const hiddenInput = screen.getByTestId("hidden-input") as HTMLInputElement;

    expect(hiddenInput.type).toBe("checkbox");
    expect(hiddenInput.name).toBe("agree");
    expect(hiddenInput.value).toBe("yes");
  });
});
