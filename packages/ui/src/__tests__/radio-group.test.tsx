import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup } from "@/components/radio-group";

function renderRadioGroup(
  props: Partial<Parameters<typeof RadioGroup.Root>[0]> = {},
  items = ["apple", "banana", "cherry"],
) {
  return render(
    <RadioGroup.Root {...props}>
      {items.map((item) => (
        <RadioGroup.Item key={item} value={item} data-testid={`item-${item}`}>
          <RadioGroup.ItemControl />
          <RadioGroup.ItemText>{item}</RadioGroup.ItemText>
          <RadioGroup.ItemHiddenInput />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>,
  );
}

describe("RadioGroup", () => {
  it("renders items, none selected by default", () => {
    renderRadioGroup();

    const apple = screen.getByTestId("item-apple");
    const banana = screen.getByTestId("item-banana");

    expect(apple).toHaveAttribute("aria-checked", "false");
    expect(banana).toHaveAttribute("aria-checked", "false");
  });

  it("has role=radiogroup on root and role=radio on items", () => {
    renderRadioGroup();

    const root = screen.getByRole("radiogroup");
    expect(root).toBeInTheDocument();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("clicking an item selects it", async () => {
    const user = userEvent.setup();
    renderRadioGroup();

    const banana = screen.getByTestId("item-banana");
    await user.click(banana);

    expect(banana).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("item-apple")).toHaveAttribute("aria-checked", "false");
  });

  it("only selected item has tabindex=0", async () => {
    const user = userEvent.setup();
    renderRadioGroup();

    // Before any selection, first item should have tabindex=0
    expect(screen.getByTestId("item-apple")).toHaveAttribute("tabindex", "0");
    expect(screen.getByTestId("item-banana")).toHaveAttribute("tabindex", "-1");

    // After selection, selected item gets tabindex=0
    await user.click(screen.getByTestId("item-banana"));
    expect(screen.getByTestId("item-banana")).toHaveAttribute("tabindex", "0");
    expect(screen.getByTestId("item-apple")).toHaveAttribute("tabindex", "-1");
  });

  it("arrow keys navigate between items (selects on navigate per WAI-ARIA)", async () => {
    const user = userEvent.setup();
    renderRadioGroup({ orientation: "vertical" });

    const apple = screen.getByTestId("item-apple");
    await user.click(apple);
    expect(apple).toHaveAttribute("aria-checked", "true");

    // Focus the selected item, then arrow down
    apple.focus();
    await user.keyboard("{ArrowDown}");

    // In WAI-ARIA radio group, arrow keys move focus AND select
    const banana = screen.getByTestId("item-banana");
    expect(banana).toHaveAttribute("aria-checked", "true");
  });

  it("controlled mode", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <RadioGroup.Root value="apple" onValueChange={onValueChange}>
        <RadioGroup.Item value="apple" data-testid="item-apple">
          <RadioGroup.ItemText>Apple</RadioGroup.ItemText>
        </RadioGroup.Item>
        <RadioGroup.Item value="banana" data-testid="item-banana">
          <RadioGroup.ItemText>Banana</RadioGroup.ItemText>
        </RadioGroup.Item>
      </RadioGroup.Root>,
    );

    expect(screen.getByTestId("item-apple")).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByTestId("item-banana"));
    expect(onValueChange).toHaveBeenCalledWith("banana");

    rerender(
      <RadioGroup.Root value="banana" onValueChange={onValueChange}>
        <RadioGroup.Item value="apple" data-testid="item-apple">
          <RadioGroup.ItemText>Apple</RadioGroup.ItemText>
        </RadioGroup.Item>
        <RadioGroup.Item value="banana" data-testid="item-banana">
          <RadioGroup.ItemText>Banana</RadioGroup.ItemText>
        </RadioGroup.Item>
      </RadioGroup.Root>,
    );

    expect(screen.getByTestId("item-banana")).toHaveAttribute("aria-checked", "true");
  });

  it("disabled item cannot be selected", async () => {
    const user = userEvent.setup();

    render(
      <RadioGroup.Root>
        <RadioGroup.Item value="a" data-testid="item-a">
          <RadioGroup.ItemText>A</RadioGroup.ItemText>
        </RadioGroup.Item>
        <RadioGroup.Item value="b" disabled data-testid="item-b">
          <RadioGroup.ItemText>B</RadioGroup.ItemText>
        </RadioGroup.Item>
      </RadioGroup.Root>,
    );

    const itemB = screen.getByTestId("item-b");
    expect(itemB).toHaveAttribute("aria-disabled", "true");

    await user.click(itemB);
    expect(itemB).toHaveAttribute("aria-checked", "false");
  });
});
