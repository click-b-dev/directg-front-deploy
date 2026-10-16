import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Table } from "@/components/table";

describe("Table", () => {
  function renderBasicTable() {
    return render(
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Age</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Alice</Table.Cell>
            <Table.Cell>30</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    );
  }

  it("renders semantic table elements", () => {
    renderBasicTable();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("rowgroup")).toHaveLength(2); // thead + tbody
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getAllByRole("cell")).toHaveLength(2);
  });

  it('has data-scope="table" on all elements', () => {
    renderBasicTable();
    const table = screen.getByRole("table");
    expect(table).toHaveAttribute("data-scope", "table");
    expect(table).toHaveAttribute("data-part", "root");

    const headers = screen.getAllByRole("columnheader");
    headers.forEach((h) => {
      expect(h).toHaveAttribute("data-scope", "table");
      expect(h).toHaveAttribute("data-part", "head");
    });

    const cells = screen.getAllByRole("cell");
    cells.forEach((c) => {
      expect(c).toHaveAttribute("data-scope", "table");
      expect(c).toHaveAttribute("data-part", "cell");
    });
  });

  it("renders caption", () => {
    render(
      <Table.Root>
        <Table.Caption>People</Table.Caption>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Data</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    );
    expect(screen.getByText("People")).toBeInTheDocument();
    expect(screen.getByText("People").tagName).toBe("CAPTION");
  });

  it("renders footer", () => {
    render(
      <Table.Root>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Data</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell>Total</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table.Root>,
    );
    expect(screen.getAllByRole("rowgroup")).toHaveLength(2); // tbody + tfoot
    expect(screen.getByText("Total")).toBeInTheDocument();
  });
});
