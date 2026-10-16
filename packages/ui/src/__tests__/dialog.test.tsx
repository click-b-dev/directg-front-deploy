import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { Dialog } from "@/components/dialog";

function renderDialog(props: Record<string, unknown> = {}) {
  return render(
    <Dialog.Root {...props}>
      <Dialog.Trigger>Open Dialog</Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Description>Dialog Description</Dialog.Description>
          <Dialog.CloseTrigger>Close</Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>,
  );
}

describe("Dialog", () => {
  it("not visible by default", () => {
    renderDialog();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opening shows backdrop + content", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open Dialog" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(document.querySelector("[data-part='backdrop']")).toBeInTheDocument();
  });

  it("role='dialog' present on content", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open Dialog" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("role", "dialog");
  });

  it("aria-modal='true'", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open Dialog" }));

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("Escape key closes", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open Dialog" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("focus moves into dialog on open", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open Dialog" }));

    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it("focus returns to trigger on close", async () => {
    const user = userEvent.setup();
    renderDialog();

    const trigger = screen.getByRole("button", { name: "Open Dialog" });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Close via Escape while dialog content is focused
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("aria-labelledby links to title", async () => {
    const user = userEvent.setup();
    renderDialog({ id: "test-dlg" });

    await user.click(screen.getByRole("button", { name: "Open Dialog" }));

    const dialog = screen.getByRole("dialog");
    const titleId = screen.getByText("Dialog Title").getAttribute("id");

    expect(dialog).toHaveAttribute("aria-labelledby", titleId);
  });

  it("controlled mode", async () => {
    const onOpenChange = vi.fn();

    function ControlledDialog() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button onClick={() => setIsOpen(true)}>External Open</button>
          <Dialog.Root
            open={isOpen}
            onOpenChange={(v) => {
              setIsOpen(v);
              onOpenChange(v);
            }}
          >
            <Dialog.Trigger>Open Dialog</Dialog.Trigger>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Title>Title</Dialog.Title>
                <Dialog.Description>Desc</Dialog.Description>
                <Dialog.CloseTrigger>Close</Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        </>
      );
    }

    const user = userEvent.setup();
    render(<ControlledDialog />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "External Open" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
