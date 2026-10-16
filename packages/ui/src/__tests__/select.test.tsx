import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Root, Trigger, ValueText, Positioner, Content, Item, ItemText } from "@/components/select";

/* ─── Helpers ─── */

function renderSelect(props: Record<string, unknown> = {}) {
  const items = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
  ];
  return render(
    <Root items={items} {...props}>
      <Trigger>
        <ValueText placeholder="Pick a fruit" />
      </Trigger>
      <Positioner>
        <Content>
          <Item value="apple">
            <ItemText>Apple</ItemText>
          </Item>
          <Item value="banana">
            <ItemText>Banana</ItemText>
          </Item>
          <Item value="cherry">
            <ItemText>Cherry</ItemText>
          </Item>
        </Content>
      </Positioner>
    </Root>,
  );
}

function getListbox() {
  return screen.getByRole("listbox", { hidden: true });
}

/* ─── Tests ─── */

describe("Select", () => {
  it("renders closed by default", () => {
    renderSelect();
    const content = getListbox();
    expect(content).toHaveAttribute("hidden");
  });

  it("click trigger opens listbox", async () => {
    const user = userEvent.setup();
    renderSelect();
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    const content = getListbox();
    expect(content).not.toHaveAttribute("hidden");
  });

  it("has role='listbox' on content and role='option' on items", async () => {
    const user = userEvent.setup();
    renderSelect();
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
  });

  it("ArrowDown/ArrowUp navigates items when open", async () => {
    const user = userEvent.setup();
    renderSelect();
    const trigger = screen.getByRole("combobox");

    // Open via click
    await user.click(trigger);
    const listbox = getListbox();

    // After open, first item is highlighted (index 0). ArrowDown moves to index 1.
    await user.keyboard("{ArrowDown}");
    const options = within(listbox).getAllByRole("option");
    expect(options[1]).toHaveAttribute("data-highlighted", "");

    // ArrowUp goes back to first
    await user.keyboard("{ArrowUp}");
    expect(options[0]).toHaveAttribute("data-highlighted", "");
  });

  it("Enter selects highlighted item and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderSelect({ onValueChange });
    const trigger = screen.getByRole("combobox");

    await user.click(trigger);
    // After opening, first item (apple) is highlighted
    // ArrowDown to move to banana
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    // Should close
    expect(getListbox()).toHaveAttribute("hidden");
    // onValueChange should have been called
    expect(onValueChange).toHaveBeenCalledWith("banana");
  });

  it("Escape closes without selecting", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderSelect({ onValueChange });

    await user.click(screen.getByRole("combobox"));
    expect(getListbox()).not.toHaveAttribute("hidden");

    await user.keyboard("{Escape}");
    expect(getListbox()).toHaveAttribute("hidden");
    // No value change from Escape
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("aria-expanded on trigger reflects open state", async () => {
    const user = userEvent.setup();
    renderSelect();
    const trigger = screen.getByRole("combobox");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("selected value appears in ValueText", () => {
    renderSelect({ defaultValue: "banana" });
    // ValueText is inside the trigger button (span with data-part="value-text")
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Banana");
  });

  it("placeholder shows when no value selected", () => {
    renderSelect();
    expect(screen.getByText("Pick a fruit")).toBeInTheDocument();
  });

  it("controlled mode: value + onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    function Controlled() {
      const items = [
        { value: "a", label: "A" },
        { value: "b", label: "B" },
      ];
      return (
        <Root items={items} value="a" onValueChange={onValueChange}>
          <Trigger>
            <ValueText placeholder="Select" />
          </Trigger>
          <Positioner>
            <Content>
              <Item value="a">
                <ItemText>A</ItemText>
              </Item>
              <Item value="b">
                <ItemText>B</ItemText>
              </Item>
            </Content>
          </Positioner>
        </Root>
      );
    }

    render(<Controlled />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    const options = screen.getAllByRole("option");
    await user.click(options[1]!);

    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("Home/End navigate to first/last item when open", async () => {
    const user = userEvent.setup();
    renderSelect();
    await user.click(screen.getByRole("combobox"));

    const listbox = getListbox();

    // Press End to go to last
    await user.keyboard("{End}");
    const options = within(listbox).getAllByRole("option");
    expect(options[2]).toHaveAttribute("data-highlighted", "");

    // Press Home to go to first
    await user.keyboard("{Home}");
    expect(options[0]).toHaveAttribute("data-highlighted", "");
  });
});
