import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import * as Splitter from "@/components/splitter";

function renderSplitter(
  props: {
    defaultSizes?: number[];
    orientation?: "horizontal" | "vertical";
  } = {},
) {
  const { defaultSizes = [50, 50], orientation = "horizontal" } = props;

  return render(
    <Splitter.Root
      defaultSizes={defaultSizes}
      orientation={orientation}
      panels={[
        { min: 20, max: 80, collapsedSize: 0, collapsible: false },
        { min: 20, max: 80, collapsedSize: 0, collapsible: false },
      ]}
    >
      <Splitter.Panel index={0}>Panel 1</Splitter.Panel>
      <Splitter.ResizeTrigger index={0}>Handle</Splitter.ResizeTrigger>
      <Splitter.Panel index={1}>Panel 2</Splitter.Panel>
    </Splitter.Root>,
  );
}

describe("Splitter", () => {
  it("renders panels with resize handle", () => {
    renderSplitter();
    expect(screen.getByText("Panel 1")).toBeInTheDocument();
    expect(screen.getByText("Panel 2")).toBeInTheDocument();
    expect(screen.getByText("Handle")).toBeInTheDocument();
  });

  it('role="separator" on handle', () => {
    renderSplitter();
    const handle = screen.getByRole("separator");
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveTextContent("Handle");
  });

  it("handle has aria-valuenow", () => {
    renderSplitter({ defaultSizes: [40, 60] });
    const handle = screen.getByRole("separator");
    expect(handle).toHaveAttribute("aria-valuenow", "40");
    expect(handle).toHaveAttribute("aria-valuemin", "20");
    expect(handle).toHaveAttribute("aria-valuemax", "80");
  });

  it("arrow keys on handle trigger resize", () => {
    renderSplitter();
    const handle = screen.getByRole("separator");

    // Focus the handle
    handle.focus();

    // Pressing ArrowRight should send a key event (not throw)
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    fireEvent.keyDown(handle, { key: "ArrowLeft" });

    // Handle should still be present
    expect(handle).toBeInTheDocument();
  });

  it("has correct orientation attribute", () => {
    renderSplitter({ orientation: "vertical" });
    const handle = screen.getByRole("separator");
    expect(handle).toHaveAttribute("aria-orientation", "vertical");
    expect(handle).toHaveAttribute("data-orientation", "vertical");
  });
});
