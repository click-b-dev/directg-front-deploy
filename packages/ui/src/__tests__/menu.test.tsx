import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Menu } from "@/components/menu";

function renderMenu(props: Record<string, unknown> = {}) {
  return render(
    <Menu.Root {...props}>
      <Menu.Trigger>Open Menu</Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.Item id="item-1" onSelect={vi.fn()}>
            Item 1
          </Menu.Item>
          <Menu.Item id="item-2" onSelect={vi.fn()}>
            Item 2
          </Menu.Item>
          <Menu.Item id="item-3" onSelect={vi.fn()}>
            Item 3
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>,
  );
}

describe("Menu", () => {
  it("trigger click opens menu", async () => {
    const user = userEvent.setup();
    renderMenu();

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open Menu" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("role='menu' on content, role='menuitem' on items", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: "Open Menu" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();

    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Item 1");
  });

  it("Arrow Down/Up navigates items", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: "Open Menu" }));
    screen.getByRole("menu");

    // Arrow Down should highlight first, then second item
    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(screen.getByText("Item 1").closest("[role='menuitem']")).toHaveAttribute(
        "data-highlighted",
        "",
      );
    });

    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(screen.getByText("Item 2").closest("[role='menuitem']")).toHaveAttribute(
        "data-highlighted",
        "",
      );
    });

    // Arrow Up should go back
    await user.keyboard("{ArrowUp}");

    await waitFor(() => {
      expect(screen.getByText("Item 1").closest("[role='menuitem']")).toHaveAttribute(
        "data-highlighted",
        "",
      );
    });
  });

  it("Enter activates highlighted item and closes menu", async () => {
    const user = userEvent.setup();

    render(
      <Menu.Root>
        <Menu.Trigger>Open Menu</Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item id="item-a">Item A</Menu.Item>
            <Menu.Item id="item-b">Item B</Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>,
    );

    await user.click(screen.getByRole("button", { name: "Open Menu" }));

    // Navigate to first item
    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(screen.getByText("Item A").closest("[role='menuitem']")).toHaveAttribute(
        "data-highlighted",
        "",
      );
    });

    // Press Enter to select — should close menu
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("Escape closes", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: "Open Menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("aria-haspopup='menu' on trigger", () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Open Menu" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  });
});
