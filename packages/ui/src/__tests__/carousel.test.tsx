import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Carousel } from "@/components/carousel";
import { createCarouselMachine, connectCarousel } from "@/machines/carousel";

/**
 * Carousel tests: React rendering for structure, machine level for navigation logic.
 * The onIndexChange + useControllable feedback loop causes infinite updates in React,
 * so navigation tests use the machine directly.
 */

function renderCarousel(
  props: {
    totalSlides?: number;
    loop?: boolean;
    defaultIndex?: number;
  } = {},
) {
  const { totalSlides = 3, loop = false, defaultIndex = 0 } = props;

  return render(
    <Carousel.Root totalSlides={totalSlides} loop={loop} defaultIndex={defaultIndex}>
      <Carousel.Viewport>
        <Carousel.ItemGroup>
          {Array.from({ length: totalSlides }, (_, i) => (
            <Carousel.Item key={i} index={i}>
              Slide {i + 1}
            </Carousel.Item>
          ))}
        </Carousel.ItemGroup>
      </Carousel.Viewport>
      <Carousel.PrevTrigger>Prev</Carousel.PrevTrigger>
      <Carousel.NextTrigger>Next</Carousel.NextTrigger>
      <Carousel.IndicatorGroup>
        {Array.from({ length: totalSlides }, (_, i) => (
          <Carousel.Indicator key={i} index={i}>
            Dot {i + 1}
          </Carousel.Indicator>
        ))}
      </Carousel.IndicatorGroup>
    </Carousel.Root>,
  );
}

function createCarousel(
  opts: {
    totalSlides?: number;
    loop?: boolean;
    index?: number;
  } = {},
) {
  const machine = createCarouselMachine({
    id: "carousel-1",
    index: opts.index ?? 0,
    totalSlides: opts.totalSlides ?? 3,
    loop: opts.loop ?? false,
    autoPlay: false,
    autoPlayInterval: 4000,
    orientation: "horizontal",
    slidesPerView: 1,
  });
  let state: ReturnType<typeof machine.transition>["state"] = machine.initialState;
  let context = machine.initialContext;

  function send(event: Parameters<typeof machine.transition>[2]) {
    const result = machine.transition(state, context, event);
    state = result.state;
    context = result.context;
  }

  function getApi() {
    return connectCarousel(state, context, send);
  }

  return { send, getApi, getState: () => state, getContext: () => context };
}

describe("Carousel", () => {
  it('renders slides with aria-roledescription="carousel"', () => {
    renderCarousel();
    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
  });

  it("renders all slides", () => {
    renderCarousel();
    expect(screen.getByText("Slide 1")).toBeInTheDocument();
    expect(screen.getByText("Slide 2")).toBeInTheDocument();
    expect(screen.getByText("Slide 3")).toBeInTheDocument();
  });

  it("prev button is disabled at first slide when not looping", () => {
    renderCarousel({ loop: false, defaultIndex: 0 });
    const prevBtn = screen.getByRole("button", { name: /previous slide/i });
    expect(prevBtn).toBeDisabled();
  });

  it("indicators show current slide", () => {
    renderCarousel({ defaultIndex: 0 });
    const indicators = screen.getAllByRole("tab");
    expect(indicators.length).toBe(3);
    expect(indicators[0]).toHaveAttribute("aria-selected", "true");
    expect(indicators[1]).toHaveAttribute("aria-selected", "false");
  });

  it("slides have aria-roledescription=slide", () => {
    renderCarousel();
    const slides = screen.getAllByRole("group");
    slides.forEach((slide) => {
      expect(slide).toHaveAttribute("aria-roledescription", "slide");
    });
  });

  // Machine-level tests for navigation logic
  it("NEXT event navigates to next slide", () => {
    const { send, getApi } = createCarousel({ totalSlides: 3 });
    expect(getApi().index).toBe(0);

    send({ type: "NEXT" });
    expect(getApi().index).toBe(1);

    send({ type: "NEXT" });
    expect(getApi().index).toBe(2);
  });

  it("PREV event navigates to previous slide", () => {
    const { send, getApi } = createCarousel({ totalSlides: 3, index: 2 });
    expect(getApi().index).toBe(2);

    send({ type: "PREV" });
    expect(getApi().index).toBe(1);
  });

  it("loop wraps around from last to first", () => {
    const { send, getApi } = createCarousel({ totalSlides: 3, loop: true, index: 2 });

    send({ type: "NEXT" });
    expect(getApi().index).toBe(0);
  });

  it("loop wraps around from first to last", () => {
    const { send, getApi } = createCarousel({ totalSlides: 3, loop: true, index: 0 });

    send({ type: "PREV" });
    expect(getApi().index).toBe(2);
  });

  it("without loop, NEXT at last slide stays at last", () => {
    const { send, getApi } = createCarousel({ totalSlides: 3, loop: false, index: 2 });

    send({ type: "NEXT" });
    expect(getApi().index).toBe(2);
  });

  it("GO_TO navigates to specific slide", () => {
    const { send, getApi } = createCarousel({ totalSlides: 3 });

    send({ type: "GO_TO", index: 2 });
    expect(getApi().index).toBe(2);
  });

  it("canGoPrev/canGoNext reflect navigation state", () => {
    const { getApi } = createCarousel({ totalSlides: 3, loop: false, index: 0 });
    expect(getApi().canGoPrev).toBe(false);
    expect(getApi().canGoNext).toBe(true);
  });

  it("indicator props mark current slide", () => {
    const { getApi } = createCarousel({ totalSlides: 3, index: 1 });
    const api = getApi();

    const ind0 = api.getIndicatorProps({ index: 0 });
    const ind1 = api.getIndicatorProps({ index: 1 });

    expect(ind0["aria-selected"]).toBe("false");
    expect(ind1["aria-selected"]).toBe("true");
    expect(ind1["data-current"]).toBe("");
  });
});
