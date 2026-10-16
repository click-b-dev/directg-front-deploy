import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Breadcrumb } from "@/components/breadcrumb";

describe("Breadcrumb", () => {
  function renderBreadcrumb() {
    return render(
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/products">Products</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Current Page</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    );
  }

  it('renders nav with aria-label="Breadcrumb"', () => {
    renderBreadcrumb();
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute("data-scope", "breadcrumb");
  });

  it('aria-current="page" on last item', () => {
    renderBreadcrumb();
    const currentPage = screen.getByText("Current Page");
    expect(currentPage).toHaveAttribute("aria-current", "page");
    expect(currentPage).toHaveAttribute("aria-disabled", "true");
  });

  it("separator between items", () => {
    renderBreadcrumb();
    // Default separator is "/"
    const separators = screen.getAllByText("/");
    expect(separators.length).toBe(2);

    // Separators have role="presentation" and aria-hidden
    separators.forEach((sep) => {
      expect(sep).toHaveAttribute("role", "presentation");
      expect(sep).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("supports custom separator", () => {
    render(
      <Breadcrumb.Root separator=">">
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Page</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    );
    expect(screen.getByText(">")).toBeInTheDocument();
  });

  it("renders links correctly", () => {
    renderBreadcrumb();
    const links = screen.getAllByRole("link");
    // 2 anchor links + 1 Page with role="link"
    expect(links.length).toBe(3);
    expect(links[0]).toHaveAttribute("href", "/");
    expect(links[1]).toHaveAttribute("href", "/products");
  });
});
