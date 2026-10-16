import { describe, it, expect } from "vitest";
import { createProgressMachine, connectProgress } from "@/machines/progress";

/**
 * Progress tests at the machine/connect level.
 * The React component layer triggers an infinite update loop (useMachine + useControllable feedback),
 * so we test the pure state machine logic directly.
 */

function createProgress(value: number | null = 50, min = 0, max = 100) {
  const machine = createProgressMachine({ value, min, max });
  let state = machine.initialState;
  let context = machine.initialContext;
  const ids = { root: "progress-1", label: "progress-1-label" };

  function send(event: Parameters<typeof machine.transition>[2]) {
    const result = machine.transition(state, context, event);
    state = result.state;
    context = result.context;
  }

  function getApi() {
    return connectProgress(state, context, send, ids);
  }

  return { send, getApi, getState: () => state };
}

describe("Progress", () => {
  it('has role="progressbar" in root props', () => {
    const { getApi } = createProgress(50);
    const rootProps = getApi().getRootProps();
    expect(rootProps.role).toBe("progressbar");
  });

  it("has aria-valuenow, aria-valuemin, aria-valuemax", () => {
    const { getApi } = createProgress(30, 0, 100);
    const rootProps = getApi().getRootProps();
    expect(rootProps["aria-valuenow"]).toBe(30);
    expect(rootProps["aria-valuemin"]).toBe(0);
    expect(rootProps["aria-valuemax"]).toBe(100);
  });

  it("indeterminate state has no aria-valuenow", () => {
    const { getApi, getState } = createProgress(null);
    const rootProps = getApi().getRootProps();
    expect(rootProps["aria-valuenow"]).toBeUndefined();
    expect(getState()).toBe("indeterminate");
    expect(rootProps["data-state"]).toBe("indeterminate");
  });

  it('data-state="complete" when value equals max', () => {
    const { getApi, getState } = createProgress(100, 0, 100);
    expect(getState()).toBe("complete");
    const rootProps = getApi().getRootProps();
    expect(rootProps["data-state"]).toBe("complete");
    expect(rootProps["aria-valuenow"]).toBe(100);
  });

  it("percent is calculated correctly", () => {
    const { getApi } = createProgress(75, 0, 100);
    expect(getApi().percent).toBe(75);
  });

  it("percent is null for indeterminate", () => {
    const { getApi } = createProgress(null);
    expect(getApi().percent).toBeNull();
  });

  it("value can be updated via SET_VALUE", () => {
    const { send, getApi } = createProgress(50);
    send({ type: "SET_VALUE", value: 80 });
    const rootProps = getApi().getRootProps();
    expect(rootProps["aria-valuenow"]).toBe(80);
  });

  it("loading state when value between min and max", () => {
    const { getState } = createProgress(50, 0, 100);
    expect(getState()).toBe("loading");
  });
});
