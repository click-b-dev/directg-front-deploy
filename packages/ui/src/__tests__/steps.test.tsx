import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Root,
  List,
  Item,
  Trigger,
  Content,
  Separator,
  NextTrigger,
  PrevTrigger,
  Progress,
} from "@/components/steps";
import { useState } from "react";

/* ─── Helpers ─── */

function renderSteps(props: Record<string, unknown> = {}) {
  const count = (props.count as number) ?? 3;
  return render(
    <Root count={count} {...props}>
      <List>
        {Array.from({ length: count }, (_, i) => (
          <Item key={i} index={i}>
            <Trigger index={i}>Step {i + 1}</Trigger>
            {i < count - 1 && <Separator index={i} />}
          </Item>
        ))}
      </List>
      {Array.from({ length: count }, (_, i) => (
        <Content key={i} index={i}>
          Content for step {i + 1}
        </Content>
      ))}
      <PrevTrigger>Previous</PrevTrigger>
      <NextTrigger>Next</NextTrigger>
      <Progress />
    </Root>,
  );
}

/* ─── Tests ─── */

describe("Steps", () => {
  it("renders step list", () => {
    renderSteps();
    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("current step content visible", () => {
    renderSteps({ defaultStep: 0, count: 3 });
    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    const visiblePanel = panels.find((p) => !p.hidden);
    expect(visiblePanel).toHaveTextContent("Content for step 1");
  });

  it("Next/Prev triggers navigate", async () => {
    const user = userEvent.setup();
    renderSteps({ defaultStep: 0, count: 3 });

    // Initially step 0
    let panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels.find((p) => !p.hidden)).toHaveTextContent("Content for step 1");

    // Click Next
    await user.click(screen.getByRole("button", { name: /next step/i }));
    panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels.find((p) => !p.hidden)).toHaveTextContent("Content for step 2");

    // Click Previous
    await user.click(screen.getByRole("button", { name: /previous step/i }));
    panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels.find((p) => !p.hidden)).toHaveTextContent("Content for step 1");
  });

  it("linear mode: cannot jump ahead by clicking", async () => {
    const user = userEvent.setup();
    renderSteps({ defaultStep: 0, count: 3, linear: true });

    const tabs = screen.getAllByRole("tab");
    // Step 3 (index 2) trigger should be disabled in linear mode
    expect(tabs[2]).toBeDisabled();

    // Click step 3 should not change step
    await user.click(tabs[2]!);
    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels.find((p) => !p.hidden)).toHaveTextContent("Content for step 1");
  });

  it("linear mode: can go back by clicking completed steps", async () => {
    const user = userEvent.setup();
    renderSteps({ defaultStep: 2, count: 3, linear: true });

    const tabs = screen.getAllByRole("tab");
    // Step 1 (index 0) should be clickable since it's completed
    await user.click(tabs[0]!);
    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels.find((p) => !p.hidden)).toHaveTextContent("Content for step 1");
  });

  it("data-state reflects complete/current/incomplete", () => {
    renderSteps({ defaultStep: 1, count: 3 });

    const items = screen.getAllByRole("tab");

    // Check the triggers themselves for data-state
    expect(items[0]).toHaveAttribute("data-state", "complete");
    expect(items[1]).toHaveAttribute("data-state", "current");
    expect(items[2]).toHaveAttribute("data-state", "incomplete");
  });

  it("controlled mode", async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [step, setStep] = useState(0);
      return (
        <Root count={3} step={step} onStepChange={setStep}>
          <List>
            <Item index={0}>
              <Trigger index={0}>Step 1</Trigger>
            </Item>
            <Item index={1}>
              <Trigger index={1}>Step 2</Trigger>
            </Item>
            <Item index={2}>
              <Trigger index={2}>Step 3</Trigger>
            </Item>
          </List>
          <Content index={0}>Content 1</Content>
          <Content index={1}>Content 2</Content>
          <Content index={2}>Content 3</Content>
          <NextTrigger>Next</NextTrigger>
          <PrevTrigger>Previous</PrevTrigger>
        </Root>
      );
    }

    render(<Controlled />);

    let panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels.find((p) => !p.hidden)).toHaveTextContent("Content 1");

    await user.click(screen.getByRole("button", { name: /next step/i }));
    panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels.find((p) => !p.hidden)).toHaveTextContent("Content 2");
  });

  it("Prev disabled on first step, Next disabled on last step", () => {
    renderSteps({ defaultStep: 0, count: 3 });
    const prevButton = screen.getByRole("button", { name: /previous step/i });
    const nextButton = screen.getByRole("button", { name: /next step/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it("Next disabled on last step", () => {
    renderSteps({ defaultStep: 2, count: 3 });
    const nextButton = screen.getByRole("button", { name: /next step/i });
    expect(nextButton).toBeDisabled();
  });

  it("Progress bar has correct aria attributes", () => {
    renderSteps({ defaultStep: 1, count: 3 });
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clicking step trigger navigates to that step", async () => {
    const user = userEvent.setup();
    renderSteps({ defaultStep: 0, count: 3 });

    const tabs = screen.getAllByRole("tab");
    await user.click(tabs[2]!);

    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels.find((p) => !p.hidden)).toHaveTextContent("Content for step 3");
  });
});
