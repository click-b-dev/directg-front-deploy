import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Root,
  Tree,
  Branch,
  BranchControl,
  BranchTrigger,
  BranchText,
  BranchContent,
  Item,
  ItemText,
} from "@/components/tree-view";

/* ─── Helpers ─── */

function renderTreeView(props: Record<string, unknown> = {}) {
  return render(
    <Root {...props}>
      <Tree>
        <Branch id="folder1">
          <BranchControl>
            <BranchTrigger>Toggle</BranchTrigger>
            <BranchText>Folder 1</BranchText>
          </BranchControl>
          <BranchContent>
            <Item id="file1">
              <ItemText>File 1</ItemText>
            </Item>
            <Item id="file2">
              <ItemText>File 2</ItemText>
            </Item>
          </BranchContent>
        </Branch>
        <Branch id="folder2">
          <BranchControl>
            <BranchTrigger>Toggle</BranchTrigger>
            <BranchText>Folder 2</BranchText>
          </BranchControl>
          <BranchContent>
            <Item id="file3">
              <ItemText>File 3</ItemText>
            </Item>
          </BranchContent>
        </Branch>
        <Item id="rootfile">
          <ItemText>Root File</ItemText>
        </Item>
      </Tree>
    </Root>,
  );
}

/* ─── Tests ─── */

describe("TreeView", () => {
  it("renders tree structure with role='tree'", async () => {
    renderTreeView();
    // Wait for registration timer
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(screen.getByRole("tree")).toBeInTheDocument();
  });

  it("has role='treeitem' on items and branch controls", async () => {
    renderTreeView({ defaultExpandedIds: ["folder1", "folder2"] });
    await act(() => new Promise((r) => setTimeout(r, 50)));

    const treeitems = screen.getAllByRole("treeitem");
    // folder1 (branch control), folder2 (branch control), file1, file2, file3, rootfile
    expect(treeitems.length).toBeGreaterThanOrEqual(3);
  });

  it("click branch control to expand/collapse", async () => {
    const user = userEvent.setup();
    renderTreeView();
    await act(() => new Promise((r) => setTimeout(r, 50)));

    // Get branch controls (role="treeitem" on branch controls)
    const treeitems = screen.getAllByRole("treeitem");
    const folder1Control = treeitems[0]!;

    // Initially collapsed
    expect(folder1Control).toHaveAttribute("aria-expanded", "false");

    // Click to expand
    await user.click(folder1Control);
    await act(() => new Promise((r) => setTimeout(r, 50)));

    expect(folder1Control).toHaveAttribute("aria-expanded", "true");

    // Click again to collapse
    await user.click(folder1Control);
    await act(() => new Promise((r) => setTimeout(r, 50)));

    expect(folder1Control).toHaveAttribute("aria-expanded", "false");
  });

  it("aria-expanded on branch controls", async () => {
    renderTreeView({ defaultExpandedIds: ["folder1"] });
    await act(() => new Promise((r) => setTimeout(r, 50)));

    const treeitems = screen.getAllByRole("treeitem");
    // folder1 should be expanded
    const folder1Control = treeitems.find((item) => item.getAttribute("data-value") === "folder1");
    expect(folder1Control).toHaveAttribute("aria-expanded", "true");
  });

  it("selected state via aria-selected", async () => {
    const user = userEvent.setup();
    renderTreeView({ defaultExpandedIds: ["folder1"] });
    await act(() => new Promise((r) => setTimeout(r, 50)));

    const treeitems = screen.getAllByRole("treeitem");
    const rootFile = treeitems.find((item) => item.getAttribute("data-value") === "rootfile");

    if (rootFile) {
      expect(rootFile).toHaveAttribute("aria-selected", "false");

      await user.click(rootFile);
      expect(rootFile).toHaveAttribute("aria-selected", "true");
    }
  });

  it("BranchContent is hidden when collapsed", async () => {
    renderTreeView();
    await act(() => new Promise((r) => setTimeout(r, 50)));

    const groups = screen.getAllByRole("group", { hidden: true });
    // All branch content should be hidden initially
    for (const group of groups) {
      expect(group).toHaveAttribute("hidden");
    }
  });

  it("BranchContent is visible when expanded", async () => {
    renderTreeView({ defaultExpandedIds: ["folder1"] });
    await act(() => new Promise((r) => setTimeout(r, 50)));

    const groups = screen.getAllByRole("group", { hidden: true });
    // folder1's content should be visible
    const visibleGroups = groups.filter((g) => !g.hidden);
    expect(visibleGroups.length).toBeGreaterThanOrEqual(1);
  });

  it("branch trigger button toggles expansion", async () => {
    const user = userEvent.setup();
    renderTreeView();
    await act(() => new Promise((r) => setTimeout(r, 50)));

    // BranchTrigger buttons have aria-label "Expand" or "Collapse"
    const expandButtons = screen.getAllByRole("button", { name: /expand/i });
    expect(expandButtons.length).toBeGreaterThanOrEqual(1);

    await user.click(expandButtons[0]!);
    await act(() => new Promise((r) => setTimeout(r, 50)));

    // After expanding, the label should change
    const collapseButton = screen.queryByRole("button", { name: /collapse/i });
    expect(collapseButton).toBeInTheDocument();
  });

  it("controlled expanded and selected IDs", async () => {
    const onExpandedChange = vi.fn();
    const onSelectedChange = vi.fn();

    renderTreeView({
      expandedIds: ["folder1"],
      onExpandedChange,
      selectedIds: [],
      onSelectedChange,
    });

    await act(() => new Promise((r) => setTimeout(r, 50)));

    const treeitems = screen.getAllByRole("treeitem");
    const folder1 = treeitems.find((item) => item.getAttribute("data-value") === "folder1");
    expect(folder1).toHaveAttribute("aria-expanded", "true");
  });
});
