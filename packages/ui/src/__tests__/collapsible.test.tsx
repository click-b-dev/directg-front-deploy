import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Collapsible } from "@/components/collapsible";

function renderCollapsible(props: Record<string, unknown> = {}) {
  return render(
    <Collapsible.Root {...props}>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger>
      <Collapsible.Content>Hidden content</Collapsible.Content>
    </Collapsible.Root>,
  );
}

describe("Collapsible", () => {
  it("renders with content hidden by default", () => {
    renderCollapsible();
    const content = screen.getByText("Hidden content");
    expect(content).toHaveAttribute("hidden");
  });

  it("clicking trigger shows content", async () => {
    const user = userEvent.setup();
    renderCollapsible();

    const trigger = screen.getByRole("button", { name: "Toggle" });
    await user.click(trigger);

    const content = screen.getByText("Hidden content");
    expect(content).not.toHaveAttribute("hidden");
  });

  it("aria-expanded toggles on trigger", async () => {
    const user = userEvent.setup();
    renderCollapsible();

    const trigger = screen.getByRole("button", { name: "Toggle" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("content has aria-controls/id linkage", () => {
    renderCollapsible({ id: "test-col" });

    const trigger = screen.getByRole("button", { name: "Toggle" });
    const content = screen.getByText("Hidden content");

    const contentId = content.getAttribute("id");
    expect(contentId).toBe("test-col-content");
    expect(trigger).toHaveAttribute("aria-controls", contentId);
    expect(content).toHaveAttribute("aria-labelledby", "test-col-trigger");
  });

  it("controlled mode: open + onOpenChange", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <Collapsible.Root open={false} onOpenChange={onOpenChange}>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Content>Hidden content</Collapsible.Content>
      </Collapsible.Root>,
    );

    expect(screen.getByText("Hidden content")).toHaveAttribute("hidden");

    // Click trigger fires onOpenChange
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    // Rerender with open=true
    rerender(
      <Collapsible.Root open={true} onOpenChange={onOpenChange}>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Content>Hidden content</Collapsible.Content>
      </Collapsible.Root>,
    );

    expect(screen.getByText("Hidden content")).not.toHaveAttribute("hidden");
  });

  it("disabled prevents toggling", async () => {
    const user = userEvent.setup();
    renderCollapsible({ disabled: true });

    const trigger = screen.getByRole("button", { name: "Toggle" });
    expect(trigger).toBeDisabled();

    await user.click(trigger);
    expect(screen.getByText("Hidden content")).toHaveAttribute("hidden");
  });

  it("Enter key on trigger toggles", async () => {
    const user = userEvent.setup();
    renderCollapsible();

    const trigger = screen.getByRole("button", { name: "Toggle" });
    trigger.focus();

    await user.keyboard("{Enter}");
    expect(screen.getByText("Hidden content")).not.toHaveAttribute("hidden");

    await user.keyboard("{Enter}");
    expect(screen.getByText("Hidden content")).toHaveAttribute("hidden");
  });

  it("Space key on trigger toggles", async () => {
    const user = userEvent.setup();
    renderCollapsible();

    const trigger = screen.getByRole("button", { name: "Toggle" });
    trigger.focus();

    await user.keyboard(" ");
    expect(screen.getByText("Hidden content")).not.toHaveAttribute("hidden");
  });
});
