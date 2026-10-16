import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { AlertDialog } from "@/components/alert-dialog";

function renderAlertDialog(props: Record<string, unknown> = {}) {
  return render(
    <AlertDialog.Root {...props}>
      <AlertDialog.Trigger>Open Alert</AlertDialog.Trigger>
      <AlertDialog.Backdrop />
      <AlertDialog.Positioner>
        <AlertDialog.Content>
          <AlertDialog.Title>Confirm Action</AlertDialog.Title>
          <AlertDialog.Description>Are you sure?</AlertDialog.Description>
          <button>Confirm</button>
          <AlertDialog.CloseTrigger>Cancel</AlertDialog.CloseTrigger>
        </AlertDialog.Content>
      </AlertDialog.Positioner>
    </AlertDialog.Root>,
  );
}

describe("AlertDialog", () => {
  it("role='alertdialog' on content", async () => {
    const user = userEvent.setup();
    renderAlertDialog();

    await user.click(screen.getByRole("button", { name: "Open Alert" }));

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("role", "alertdialog");
  });

  it("Escape closes", async () => {
    const user = userEvent.setup();
    renderAlertDialog();

    await user.click(screen.getByRole("button", { name: "Open Alert" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("backdrop click does NOT close", async () => {
    const user = userEvent.setup();
    renderAlertDialog();

    await user.click(screen.getByRole("button", { name: "Open Alert" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // Click backdrop -- it has onClick=undefined, so clicking it should not close
    const backdrop = document.querySelector("[data-part='backdrop'][data-scope='alert-dialog']");
    expect(backdrop).toBeInTheDocument();

    if (backdrop) {
      await user.click(backdrop as HTMLElement);
    }

    // Alert dialog should still be open
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("focus trap works", async () => {
    const user = userEvent.setup();
    renderAlertDialog();

    await user.click(screen.getByRole("button", { name: "Open Alert" }));

    await waitFor(() => {
      const dialog = screen.getByRole("alertdialog");
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it("close trigger works", async () => {
    const user = userEvent.setup();
    renderAlertDialog();

    await user.click(screen.getByRole("button", { name: "Open Alert" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // CloseTrigger has aria-label="Close" from the dialog connect
    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });
});
