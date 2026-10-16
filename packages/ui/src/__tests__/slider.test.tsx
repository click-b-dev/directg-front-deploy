import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Root, Control, Track, Range, Thumb, Label, ValueText } from "@/components/slider";

function renderSlider(props: Partial<Parameters<typeof Root>[0]> = {}) {
  return render(
    <Root {...props}>
      <Label>Volume</Label>
      <Control>
        <Track>
          <Range />
        </Track>
        <Thumb index={0} data-testid="thumb" />
      </Control>
      <ValueText data-testid="value-text" />
    </Root>,
  );
}

describe("Slider", () => {
  it('renders with role="slider" on thumb', () => {
    renderSlider({ defaultValue: [50] });
    const thumb = screen.getByTestId("thumb");
    expect(thumb).toHaveAttribute("role", "slider");
  });

  it("aria-valuenow/min/max attributes are set", () => {
    renderSlider({ defaultValue: [30], min: 0, max: 100 });
    const thumb = screen.getByTestId("thumb");

    expect(thumb).toHaveAttribute("aria-valuenow", "30");
    expect(thumb).toHaveAttribute("aria-valuemin", "0");
    expect(thumb).toHaveAttribute("aria-valuemax", "100");
  });

  it("ArrowRight increments value", async () => {
    const user = userEvent.setup();
    renderSlider({ defaultValue: [50], min: 0, max: 100, step: 1 });
    const thumb = screen.getByTestId("thumb");

    thumb.focus();
    await user.keyboard("{ArrowRight}");

    expect(thumb).toHaveAttribute("aria-valuenow", "51");
  });

  it("ArrowLeft decrements value", async () => {
    const user = userEvent.setup();
    renderSlider({ defaultValue: [50], min: 0, max: 100, step: 1 });
    const thumb = screen.getByTestId("thumb");

    thumb.focus();
    await user.keyboard("{ArrowLeft}");

    expect(thumb).toHaveAttribute("aria-valuenow", "49");
  });

  it("Home goes to min", async () => {
    const user = userEvent.setup();
    renderSlider({ defaultValue: [50], min: 0, max: 100 });
    const thumb = screen.getByTestId("thumb");

    thumb.focus();
    await user.keyboard("{Home}");

    expect(thumb).toHaveAttribute("aria-valuenow", "0");
  });

  it("End goes to max", async () => {
    const user = userEvent.setup();
    renderSlider({ defaultValue: [50], min: 0, max: 100 });
    const thumb = screen.getByTestId("thumb");

    thumb.focus();
    await user.keyboard("{End}");

    expect(thumb).toHaveAttribute("aria-valuenow", "100");
  });

  it("controlled value", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Root value={[25]} onValueChange={onValueChange} min={0} max={100}>
        <Control>
          <Track>
            <Range />
          </Track>
          <Thumb index={0} data-testid="thumb" />
        </Control>
      </Root>,
    );

    expect(screen.getByTestId("thumb")).toHaveAttribute("aria-valuenow", "25");

    rerender(
      <Root value={[75]} onValueChange={onValueChange} min={0} max={100}>
        <Control>
          <Track>
            <Range />
          </Track>
          <Thumb index={0} data-testid="thumb" />
        </Control>
      </Root>,
    );

    expect(screen.getByTestId("thumb")).toHaveAttribute("aria-valuenow", "75");
  });

  it("disabled state: thumb has tabindex=-1 and aria-disabled", () => {
    renderSlider({ defaultValue: [50], disabled: true });
    const thumb = screen.getByTestId("thumb");

    expect(thumb).toHaveAttribute("aria-disabled", "true");
    expect(thumb).toHaveAttribute("tabindex", "-1");
  });

  it("disabled state: keyboard does not change value", async () => {
    const user = userEvent.setup();
    renderSlider({ defaultValue: [50], disabled: true });
    const thumb = screen.getByTestId("thumb");

    thumb.focus();
    await user.keyboard("{ArrowRight}");

    expect(thumb).toHaveAttribute("aria-valuenow", "50");
  });

  it("value text displays the value", () => {
    renderSlider({ defaultValue: [42] });
    const valueText = screen.getByTestId("value-text");
    expect(valueText).toHaveTextContent("42");
  });
});
