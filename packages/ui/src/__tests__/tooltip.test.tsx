import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Tooltip } from "@/components/tooltip";

function renderTooltip(props: Record<string, unknown> = {}) {
  return render(
    <Tooltip.Root openDelay={700} closeDelay={300} {...props}>
      <Tooltip.Trigger>Hover me</Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>Tooltip text</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>,
  );
}

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("not visible by default", () => {
    renderTooltip();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("hover shows tooltip after delay", async () => {
    renderTooltip();

    const trigger = screen.getByText("Hover me");

    await act(async () => {
      fireEvent.pointerEnter(trigger);
    });

    // Not shown yet
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    // Advance past the open delay
    await act(async () => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("focus shows tooltip immediately", async () => {
    renderTooltip();

    const trigger = screen.getByText("Hover me");

    await act(async () => {
      fireEvent.focus(trigger);
    });

    // Focus triggers immediate open
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("role='tooltip' on content", async () => {
    renderTooltip();

    const trigger = screen.getByText("Hover me");
    await act(async () => {
      fireEvent.focus(trigger);
    });

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveAttribute("role", "tooltip");
  });

  it("aria-describedby on trigger when open", async () => {
    renderTooltip({ id: "test-tip" });

    const trigger = screen.getByText("Hover me");

    // Not set when closed
    expect(trigger).not.toHaveAttribute("aria-describedby");

    await act(async () => {
      fireEvent.focus(trigger);
    });

    expect(trigger).toHaveAttribute("aria-describedby", "test-tip-content");
  });

  it("Escape dismisses", async () => {
    renderTooltip();

    const trigger = screen.getByText("Hover me");
    await act(async () => {
      fireEvent.focus(trigger);
    });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(trigger, { key: "Escape" });
    });

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("mouse leave hides after delay", async () => {
    renderTooltip();

    const trigger = screen.getByText("Hover me");

    await act(async () => {
      fireEvent.pointerEnter(trigger);
    });

    await act(async () => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    await act(async () => {
      fireEvent.pointerLeave(trigger);
    });

    // Tooltip still visible during close delay (state = "closing" is considered open)
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    // Advance past the close delay
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });
});
