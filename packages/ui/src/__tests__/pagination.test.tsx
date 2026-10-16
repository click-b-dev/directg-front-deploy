import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Root, PrevTrigger, NextTrigger, Item, Ellipsis } from "@/components/pagination";
import { useState } from "react";

/* ─── Helpers ─── */

function renderPagination(props: Record<string, unknown> = {}) {
  const count = (props.count as number) ?? 100;
  const pageSize = (props.pageSize as number) ?? 10;
  const totalPages = Math.ceil(count / pageSize);

  // Generate page items for basic rendering
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1);

  return render(
    <Root count={count} pageSize={pageSize} {...props}>
      <PrevTrigger>Previous</PrevTrigger>
      {pages.map((page) => (
        <Item key={page} value={page}>
          {page}
        </Item>
      ))}
      <NextTrigger>Next</NextTrigger>
    </Root>,
  );
}

/* ─── Tests ─── */

describe("Pagination", () => {
  it("renders page numbers", () => {
    renderPagination({ count: 50, pageSize: 10 });
    // 5 pages + prev + next = 7 buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(7); // prev + 5 pages + next
  });

  it("click page selects it", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderPagination({ count: 50, pageSize: 10, onPageChange });

    const page3 = screen.getByRole("button", { name: "Page 3" });
    await user.click(page3);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("aria-current='page' on current page", () => {
    renderPagination({ count: 50, pageSize: 10, defaultPage: 3 });
    const page3 = screen.getByRole("button", { name: "Page 3" });
    expect(page3).toHaveAttribute("aria-current", "page");

    const page1 = screen.getByRole("button", { name: "Page 1" });
    expect(page1).not.toHaveAttribute("aria-current");
  });

  it("Prev/Next buttons work", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderPagination({ count: 50, pageSize: 10, defaultPage: 3, onPageChange });

    const nextButton = screen.getByRole("button", { name: /next page/i });
    await user.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(4);

    const prevButton = screen.getByRole("button", { name: /previous page/i });
    await user.click(prevButton);
    // Now the machine internally moved to page 4, then prev goes to 3
    // But since we're uncontrolled with defaultPage=3, after next it's 4, after prev it's 3
    expect(onPageChange).toHaveBeenCalledTimes(2);
  });

  it("Prev disabled on first page", () => {
    renderPagination({ count: 50, pageSize: 10, defaultPage: 1 });
    const prevButton = screen.getByRole("button", { name: /previous page/i });
    expect(prevButton).toBeDisabled();
  });

  it("Next disabled on last page", () => {
    renderPagination({ count: 50, pageSize: 10, defaultPage: 5 });
    const nextButton = screen.getByRole("button", { name: /next page/i });
    expect(nextButton).toBeDisabled();
  });

  it("controlled mode: page + onPageChange", async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [page, setPage] = useState(2);
      return (
        <Root count={50} pageSize={10} page={page} onPageChange={setPage}>
          <PrevTrigger>Previous</PrevTrigger>
          {[1, 2, 3, 4, 5].map((p) => (
            <Item key={p} value={p}>
              {p}
            </Item>
          ))}
          <NextTrigger>Next</NextTrigger>
        </Root>
      );
    }

    render(<Controlled />);

    // Page 2 should be current
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");

    // Click Next
    await user.click(screen.getByRole("button", { name: /next page/i }));
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
  });

  it("ellipsis renders for large page counts", () => {
    // Render with many pages and use the Ellipsis component
    const totalPages = 20;
    render(
      <Root count={200} pageSize={10} defaultPage={10}>
        <PrevTrigger>Previous</PrevTrigger>
        <Item value={1}>1</Item>
        <Ellipsis index={0}>...</Ellipsis>
        <Item value={9}>9</Item>
        <Item value={10}>10</Item>
        <Item value={11}>11</Item>
        <Ellipsis index={1}>...</Ellipsis>
        <Item value={totalPages}>{totalPages}</Item>
        <NextTrigger>Next</NextTrigger>
      </Root>,
    );

    // Ellipsis elements should be present
    const ellipses = screen.getAllByText("...");
    expect(ellipses).toHaveLength(2);
  });

  it("nav element has aria-label='Pagination'", () => {
    renderPagination({ count: 50, pageSize: 10 });
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(nav).toBeInTheDocument();
  });
});
