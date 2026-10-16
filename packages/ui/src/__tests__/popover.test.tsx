import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Popover } from "@/components/popover";

function renderPopover(props: Record<string, unknown> = {}) {
  return render(
    <Popover.Root {...props}>
      <Popover.Trigger>Open Popover</Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Title>Popover Title</Popover.Title>
          <Popover.Description>Popover Body</Popover.Description>
          <Popover.CloseTrigger>Close</Popover.CloseTrigger>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>,
  );
}

describe("Popover", () => {
  it("not visible by default", () => {
    renderPopover();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clicking trigger opens popover", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button", { name: "Open Popover" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("Escape closes", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button", { name: "Open Popover" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Focus the content so the onKeyDown handler fires
    dialog.focus();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("aria-expanded on trigger", async () => {
    const user = userEvent.setup();
    renderPopover();

    const trigger = screen.getByRole("button", { name: "Open Popover" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("aria-haspopup on trigger", () => {
    renderPopover();
    const trigger = screen.getByRole("button", { name: "Open Popover" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("controlled mode", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <Popover.Root open={false} onOpenChange={onOpenChange}>
        <Popover.Trigger>Open Popover</Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Title>Title</Popover.Title>
            <Popover.Description>Desc</Popover.Description>
            <Popover.CloseTrigger>Close</Popover.CloseTrigger>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open Popover" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <Popover.Root open={true} onOpenChange={onOpenChange}>
        <Popover.Trigger>Open Popover</Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Title>Title</Popover.Title>
            <Popover.Description>Desc</Popover.Description>
            <Popover.CloseTrigger>Close</Popover.CloseTrigger>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("close trigger works", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button", { name: "Open Popover" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // CloseTrigger has aria-label="Close"
    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
