import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Root, Control, Input, Label, HiddenInput } from "@/components/pin-input";

function renderPinInput(props: Partial<Parameters<typeof Root>[0]> = {}, length = 4) {
  const effectiveLength = props.length ?? length;
  return render(
    <Root length={effectiveLength} {...props}>
      <Label>PIN</Label>
      <Control data-testid="control">
        {Array.from({ length: effectiveLength }, (_, i) => (
          <Input key={i} index={i} data-testid={`input-${i}`} />
        ))}
      </Control>
      <HiddenInput data-testid="hidden-input" />
    </Root>,
  );
}

describe("PinInput", () => {
  it("renders correct number of inputs", () => {
    renderPinInput({ length: 6 });
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`input-${i}`)).toBeInTheDocument();
    }
  });

  it("typing a character fills the input and moves focus to next", async () => {
    const user = userEvent.setup();
    renderPinInput();

    const input0 = screen.getByTestId("input-0") as HTMLInputElement;
    const input1 = screen.getByTestId("input-1") as HTMLInputElement;

    await user.click(input0);

    // The pin input uses onInput handler. We simulate typing via fireEvent
    // because userEvent types character by character which triggers the machine
    await user.keyboard("1");

    // After typing "1", the value should be set and focus should move
    expect(input0.value).toBe("1");
    // Focus should move to next input
    expect(input1).toHaveFocus();
  });

  it("backspace clears current input and moves to previous", async () => {
    const user = userEvent.setup();
    renderPinInput();

    const input0 = screen.getByTestId("input-0") as HTMLInputElement;
    const input1 = screen.getByTestId("input-1") as HTMLInputElement;
    const input2 = screen.getByTestId("input-2") as HTMLInputElement;

    // Type into first two inputs: "1" goes to input0, auto-advances to input1
    // Then "2" goes to input1, auto-advances to input2
    await user.click(input0);
    await user.keyboard("1");
    await user.keyboard("2");

    // Focus is now on input2 (auto-advanced after filling input1)
    expect(input2).toHaveFocus();
    expect(input0.value).toBe("1");
    expect(input1.value).toBe("2");

    // Backspace on empty input2 moves focus to input1 and clears it
    await user.keyboard("{Backspace}");
    expect(input1).toHaveFocus();
    expect(input1.value).toBe("");

    // Another backspace on empty input1 moves to input0 and clears it
    await user.keyboard("{Backspace}");
    expect(input0).toHaveFocus();
    expect(input0.value).toBe("");
  });

  it("paste distributes characters across inputs", async () => {
    const user = userEvent.setup();
    renderPinInput();

    const input0 = screen.getByTestId("input-0") as HTMLInputElement;
    await user.click(input0);

    // Simulate paste
    await user.paste("1234");

    expect((screen.getByTestId("input-0") as HTMLInputElement).value).toBe("1");
    expect((screen.getByTestId("input-1") as HTMLInputElement).value).toBe("2");
    expect((screen.getByTestId("input-2") as HTMLInputElement).value).toBe("3");
    expect((screen.getByTestId("input-3") as HTMLInputElement).value).toBe("4");
  });

  it("onComplete fires when all inputs are filled", async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    renderPinInput({ onComplete, length: 4 });

    const input0 = screen.getByTestId("input-0") as HTMLInputElement;
    await user.click(input0);
    await user.paste("1234");

    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("hidden input contains joined value", async () => {
    const user = userEvent.setup();
    renderPinInput();

    const input0 = screen.getByTestId("input-0") as HTMLInputElement;
    await user.click(input0);
    await user.paste("5678");

    const hidden = screen.getByTestId("hidden-input") as HTMLInputElement;
    expect(hidden.value).toBe("5678");
  });

  it("each input has maxLength=1", () => {
    renderPinInput();
    for (let i = 0; i < 4; i++) {
      const input = screen.getByTestId(`input-${i}`) as HTMLInputElement;
      expect(input).toHaveAttribute("maxlength", "1");
    }
  });

  it("inputs have correct aria-label", () => {
    renderPinInput({ length: 4 });
    for (let i = 0; i < 4; i++) {
      const input = screen.getByTestId(`input-${i}`);
      expect(input).toHaveAttribute("aria-label", `Pin code digit ${i + 1} of 4`);
    }
  });
});
