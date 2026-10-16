import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Alert } from "@/components/alert";

describe("Alert", () => {
  it('renders with role="alert" by default', () => {
    render(<Alert.Root>Warning</Alert.Root>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Warning");
  });

  it('renders with role="status" when configured', () => {
    render(<Alert.Root role="status">Info</Alert.Root>);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders title and description", () => {
    render(
      <Alert.Root>
        <Alert.Title>Error title</Alert.Title>
        <Alert.Description>Error description</Alert.Description>
      </Alert.Root>,
    );
    expect(screen.getByText("Error title")).toBeInTheDocument();
    expect(screen.getByText("Error description")).toBeInTheDocument();
    expect(screen.getByText("Error title").tagName).toBe("H5");
  });

  it("has correct data-scope attributes", () => {
    render(
      <Alert.Root>
        <Alert.Icon>!</Alert.Icon>
        <Alert.Title>Title</Alert.Title>
        <Alert.Description>Desc</Alert.Description>
      </Alert.Root>,
    );
    expect(screen.getByRole("alert")).toHaveAttribute("data-scope", "alert");
    expect(screen.getByText("!")).toHaveAttribute("data-part", "icon");
    expect(screen.getByText("Title")).toHaveAttribute("data-part", "title");
    expect(screen.getByText("Desc")).toHaveAttribute("data-part", "description");
  });
});
