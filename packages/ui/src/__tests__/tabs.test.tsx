import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "@/components/tabs";
const { Root, List, Trigger, Content } = Tabs;

/* ─── Helpers ─── */

function renderTabs(props: Record<string, unknown> = {}) {
  return render(
    <Root defaultValue="tab1" {...props}>
      <List>
        <Trigger value="tab1">Tab 1</Trigger>
        <Trigger value="tab2">Tab 2</Trigger>
        <Trigger value="tab3">Tab 3</Trigger>
      </List>
      <Content value="tab1">Content 1</Content>
      <Content value="tab2">Content 2</Content>
      <Content value="tab3">Content 3</Content>
    </Root>,
  );
}

/* ─── Tests ─── */

describe("Tabs", () => {
  it("renders with first tab active by default (defaultValue)", () => {
    renderTabs();
    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    const visiblePanel = panels.find((p) => !p.hidden);
    expect(visiblePanel).toHaveTextContent("Content 1");
  });

  it("clicking tab activates it and shows content", async () => {
    const user = userEvent.setup();
    renderTabs();

    const tab2 = screen.getByRole("tab", { name: "Tab 2" });
    await user.click(tab2);

    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    const visiblePanel = panels.find((p) => !p.hidden);
    expect(visiblePanel).toHaveTextContent("Content 2");
  });

  it("ArrowRight/ArrowLeft navigates between tabs (horizontal)", async () => {
    const user = userEvent.setup();
    renderTabs();

    // Focus the first tab
    const tab1 = screen.getByRole("tab", { name: "Tab 1" });
    tab1.focus();

    // ArrowRight moves to tab2 (automatic mode activates it)
    await user.keyboard("{ArrowRight}");
    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    const visiblePanel = panels.find((p) => !p.hidden);
    expect(visiblePanel).toHaveTextContent("Content 2");
  });

  it("role='tablist' on list, role='tab' on triggers, role='tabpanel' on content", () => {
    renderTabs();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    // All tabpanels exist (some hidden)
    expect(screen.getAllByRole("tabpanel", { hidden: true })).toHaveLength(3);
  });

  it("aria-selected on active tab", async () => {
    const user = userEvent.setup();
    renderTabs();

    const tab1 = screen.getByRole("tab", { name: "Tab 1" });
    const tab2 = screen.getByRole("tab", { name: "Tab 2" });

    expect(tab1).toHaveAttribute("aria-selected", "true");
    expect(tab2).toHaveAttribute("aria-selected", "false");

    await user.click(tab2);
    expect(tab1).toHaveAttribute("aria-selected", "false");
    expect(tab2).toHaveAttribute("aria-selected", "true");
  });

  it("only active panel visible", () => {
    renderTabs();
    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    const visiblePanels = panels.filter((p) => !p.hidden);
    expect(visiblePanels).toHaveLength(1);
    expect(visiblePanels[0]).toHaveTextContent("Content 1");
  });

  it("controlled mode: value + onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Root value="tab1" onValueChange={onValueChange}>
        <List>
          <Trigger value="tab1">Tab 1</Trigger>
          <Trigger value="tab2">Tab 2</Trigger>
        </List>
        <Content value="tab1">Content 1</Content>
        <Content value="tab2">Content 2</Content>
      </Root>,
    );

    const tab2 = screen.getByRole("tab", { name: "Tab 2" });
    await user.click(tab2);
    expect(onValueChange).toHaveBeenCalledWith("tab2");
  });

  it("Home/End go to first/last tab", async () => {
    const user = userEvent.setup();
    renderTabs();

    const tab1 = screen.getByRole("tab", { name: "Tab 1" });
    tab1.focus();

    // End goes to last tab
    await user.keyboard("{End}");
    // In automatic mode, last tab should be active
    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    const visiblePanel = panels.find((p) => !p.hidden);
    expect(visiblePanel).toHaveTextContent("Content 3");

    // Home goes to first tab
    await user.keyboard("{Home}");
    const panels2 = screen.getAllByRole("tabpanel", { hidden: true });
    const visiblePanel2 = panels2.find((p) => !p.hidden);
    expect(visiblePanel2).toHaveTextContent("Content 1");
  });
});
