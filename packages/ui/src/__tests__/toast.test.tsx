import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as Toast from "@/components/toast";

function renderToastGroup(props: Record<string, unknown> = {}) {
  return render(<Toast.Group defaultDuration={5000} {...props} />);
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("toast renders with title and description", () => {
    renderToastGroup();

    act(() => {
      Toast.Toaster.create({
        title: "Success",
        description: "Operation completed",
        type: "info",
      });
    });

    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Operation completed")).toBeInTheDocument();
  });

  it("auto-dismiss after duration", () => {
    renderToastGroup({ defaultDuration: 3000 });

    act(() => {
      Toast.Toaster.create({
        title: "Temporary",
        type: "info",
      });
    });

    expect(screen.getByText("Temporary")).toBeInTheDocument();

    // Advance past duration to trigger DISMISS_TOAST
    act(() => {
      vi.advanceTimersByTime(3100);
    });

    // After dismiss, remaining=0, then 300ms for exit animation, then REMOVE_TOAST
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.queryByText("Temporary")).not.toBeInTheDocument();
  });

  it("close trigger dismisses", () => {
    renderToastGroup();

    act(() => {
      Toast.Toaster.create({
        title: "Closable",
        type: "info",
      });
    });

    expect(screen.getByText("Closable")).toBeInTheDocument();

    // Click the close button
    const closeBtn = screen.getByRole("button", { name: "Close notification" });
    act(() => {
      closeBtn.click();
    });

    // After clicking close, toast goes to exiting (remaining=0) then removed after 300ms
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.queryByText("Closable")).not.toBeInTheDocument();
  });

  it("role='status' for info type", () => {
    renderToastGroup();

    act(() => {
      Toast.Toaster.create({
        title: "Info Toast",
        type: "info",
        id: "info-toast",
      });
    });

    const toastEl = document.getElementById("info-toast");
    expect(toastEl).toHaveAttribute("role", "status");
  });

  it("multiple toasts stack", () => {
    renderToastGroup();

    act(() => {
      Toast.Toaster.create({
        title: "First",
        type: "info",
      });
    });

    act(() => {
      Toast.Toaster.create({
        title: "Second",
        type: "success",
      });
    });

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();

    const items = document.querySelectorAll("[data-part='root'][data-scope='toast']");
    expect(items.length).toBeGreaterThanOrEqual(2);
  });
});
