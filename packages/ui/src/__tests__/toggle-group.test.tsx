import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Root, Item } from "@/components/toggle-group";

function renderToggleGroup(
  rootProps: Partial<Parameters<typeof Root>[0]> = {},
  items = ["bold", "italic", "underline"],
) {
  return render(
    <Root {...(rootProps as Parameters<typeof Root>[0])}>
      {items.map((item) => (
        <Item key={item} value={item} data-testid={`item-${item}`}>
          {item}
        </Item>
      ))}
    </Root>,
  );
}

describe("ToggleGroup", () => {
  it("single mode: clicking item selects it, clicking another deselects previous", async () => {
    const user = userEvent.setup();
    renderToggleGroup({ type: "single" });

    const bold = screen.getByTestId("item-bold");
    const italic = screen.getByTestId("item-italic");

    await user.click(bold);
    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(bold).toHaveAttribute("data-state", "on");
    expect(italic).toHaveAttribute("aria-pressed", "false");

    await user.click(italic);
    expect(italic).toHaveAttribute("aria-pressed", "true");
    expect(bold).toHaveAttribute("aria-pressed", "false");
  });

  it("single mode: clicking same item deselects it", async () => {
    const user = userEvent.setup();
    renderToggleGroup({ type: "single" });

    const bold = screen.getByTestId("item-bold");
    await user.click(bold);
    expect(bold).toHaveAttribute("aria-pressed", "true");

    await user.click(bold);
    expect(bold).toHaveAttribute("aria-pressed", "false");
  });

  it("multiple mode: clicking toggles independently", async () => {
    const user = userEvent.setup();
    renderToggleGroup({ type: "multiple" });

    const bold = screen.getByTestId("item-bold");
    const italic = screen.getByTestId("item-italic");

    await user.click(bold);
    await user.click(italic);

    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(italic).toHaveAttribute("aria-pressed", "true");

    await user.click(bold);
    expect(bold).toHaveAttribute("aria-pressed", "false");
    expect(italic).toHaveAttribute("aria-pressed", "true");
  });

  it("disabled item cannot be toggled", async () => {
    const user = userEvent.setup();

    render(
      <Root type="single">
        <Item value="a" data-testid="item-a">
          A
        </Item>
        <Item value="b" disabled data-testid="item-b">
          B
        </Item>
      </Root>,
    );

    const itemB = screen.getByTestId("item-b");
    expect(itemB).toBeDisabled();

    await user.click(itemB);
    expect(itemB).toHaveAttribute("aria-pressed", "false");
  });

  it("uncontrolled defaultValue sets initial selection", async () => {
    const user = userEvent.setup();
    render(
      <Root type="single" defaultValue="italic">
        <Item value="bold" data-testid="item-bold">
          Bold
        </Item>
        <Item value="italic" data-testid="item-italic">
          Italic
        </Item>
      </Root>,
    );

    expect(screen.getByTestId("item-italic")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("item-bold")).toHaveAttribute("aria-pressed", "false");

    // Clicking another item changes selection
    await user.click(screen.getByTestId("item-bold"));
    expect(screen.getByTestId("item-bold")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("item-italic")).toHaveAttribute("aria-pressed", "false");
  });

  it("arrow key navigation moves focus", async () => {
    const user = userEvent.setup();
    renderToggleGroup({ type: "single", orientation: "horizontal" });

    const bold = screen.getByTestId("item-bold");
    bold.focus();

    // Arrow right should move focus to next item
    await user.keyboard("{ArrowRight}");
    // The machine sends a focus effect; we verify by checking the focusedIndex update
    // which changes tabindex
    const italic = screen.getByTestId("item-italic");
    expect(italic).toHaveAttribute("tabindex", "0");
  });
});
