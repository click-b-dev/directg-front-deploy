import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Root,
  Control,
  Input,
  Trigger,
  Positioner,
  Content,
  Item,
  ItemText,
} from "@/components/combobox";

/* ─── Helpers ─── */

const items = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

function renderCombobox(props: Record<string, unknown> = {}) {
  return render(
    <Root items={items} {...props}>
      <Control>
        <Input placeholder="Search fruit" />
        <Trigger>Open</Trigger>
      </Control>
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

describe("Combobox", () => {
  it("input renders with role='combobox'", () => {
    renderCombobox();
    const input = screen.getByRole("combobox");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("typing opens list with filtered items", async () => {
    const user = userEvent.setup();
    renderCombobox();

    const input = screen.getByRole("combobox");
    const listbox = getListbox();

    expect(listbox).toHaveAttribute("hidden");

    await user.type(input, "a");
    expect(listbox).not.toHaveAttribute("hidden");
  });

  it("ArrowDown opens and navigates", async () => {
    const user = userEvent.setup();
    renderCombobox();

    const input = screen.getByRole("combobox");
    input.focus();

    // ArrowDown opens the combobox
    await user.keyboard("{ArrowDown}");
    const listbox = getListbox();
    expect(listbox).not.toHaveAttribute("hidden");

    // First item should be highlighted
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("data-highlighted", "");
  });

  it("Enter selects highlighted item and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCombobox({ onValueChange });

    const input = screen.getByRole("combobox");
    input.focus();

    await user.keyboard("{ArrowDown}");
    // First item highlighted
    await user.keyboard("{Enter}");

    // Should close
    const listbox = getListbox();
    expect(listbox).toHaveAttribute("hidden");

    // onValueChange called with selected value
    expect(onValueChange).toHaveBeenCalledWith(["apple"]);
  });

  it("Escape closes", async () => {
    const user = userEvent.setup();
    renderCombobox();

    const input = screen.getByRole("combobox");
    input.focus();

    await user.keyboard("{ArrowDown}");
    expect(getListbox()).not.toHaveAttribute("hidden");

    await user.keyboard("{Escape}");
    expect(getListbox()).toHaveAttribute("hidden");
  });

  it("selected value shown in input (single mode)", async () => {
    const user = userEvent.setup();
    renderCombobox();

    const input = screen.getByRole("combobox") as HTMLInputElement;
    input.focus();

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    // Input should show the label of the selected item
    expect(input.value).toBe("Apple");
  });

  it("aria-expanded on input reflects open state", async () => {
    const user = userEvent.setup();
    renderCombobox();

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "false");

    input.focus();
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("aria-activedescendant updates when navigating", async () => {
    const user = userEvent.setup();
    renderCombobox();

    const input = screen.getByRole("combobox");
    input.focus();

    await user.keyboard("{ArrowDown}");
    // When a value is highlighted, aria-activedescendant should be set
    const firstDescendant = input.getAttribute("aria-activedescendant");
    expect(firstDescendant).toBeTruthy();

    await user.keyboard("{ArrowDown}");
    // Should now point to different item
    const secondDescendant = input.getAttribute("aria-activedescendant");
    expect(secondDescendant).toBeTruthy();
    expect(secondDescendant).not.toBe(firstDescendant);
  });

  it("controlled mode: value + onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Root items={items} value={["banana"]} onValueChange={onValueChange}>
        <Control>
          <Input placeholder="Search" />
          <Trigger>Open</Trigger>
        </Control>
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

    const input = screen.getByRole("combobox");
    input.focus();

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onValueChange).toHaveBeenCalled();
  });

  it("trigger button toggles open/close", async () => {
    const user = userEvent.setup();
    renderCombobox();

    const triggerButton = screen.getByRole("button", { name: /toggle suggestions/i });
    const listbox = getListbox();

    expect(listbox).toHaveAttribute("hidden");
    await user.click(triggerButton);
    expect(listbox).not.toHaveAttribute("hidden");
    await user.click(triggerButton);
    expect(listbox).toHaveAttribute("hidden");
  });
});
