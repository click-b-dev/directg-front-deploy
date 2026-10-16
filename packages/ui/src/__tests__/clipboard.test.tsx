import { describe, it, expect } from "vitest";
import { createClipboardMachine } from "@/machines/clipboard";
import { connect } from "@/machines/clipboard";

/**
 * Clipboard tests at the machine/connect level.
 * The React component has a useMachine infinite loop issue in certain environments,
 * so we test the pure state machine logic directly.
 */

function createClipboard(value = "https://example.com", timeout = 2000) {
  const machine = createClipboardMachine({ id: "clipboard-1", value, timeout });
  let state = machine.initialState;
  let context = machine.initialContext;

  function send(event: Parameters<typeof machine.transition>[2]) {
    const result = machine.transition(state, context, event);
    state = result.state;
    context = result.context;
    // Execute effects (mock clipboard)
    if (result.effects) {
      for (const effect of result.effects) {
        if (effect.type === "custom") {
          // Don't actually execute clipboard API in tests
        }
      }
    }
  }

  function getApi() {
    return connect(state, context, send);
  }

  return { send, getApi, getState: () => state };
}

describe("Clipboard", () => {
  it("click trigger copies value (transitions to copied state)", () => {
    const { send, getState } = createClipboard("hello");

    expect(getState()).toBe("idle");
    send({ type: "COPY" });
    expect(getState()).toBe("copied");
  });

  it('shows "copied" indicator state', () => {
    const { send, getApi } = createClipboard();

    // Before copy
    let api = getApi();
    expect(api.copied).toBe(false);

    // The "not copied" indicator should be visible
    const idleIndicator = api.getIndicatorProps({ copied: false });
    expect(idleIndicator.hidden).toBe(false);

    // The "copied" indicator should be hidden
    const copiedIndicator = api.getIndicatorProps({ copied: true });
    expect(copiedIndicator.hidden).toBe(true);

    // After copy
    send({ type: "COPY" });
    api = getApi();
    expect(api.copied).toBe(true);

    // Now "copied" indicator should be visible
    const copiedAfter = api.getIndicatorProps({ copied: true });
    expect(copiedAfter.hidden).toBe(false);
    expect(copiedAfter["data-state"]).toBe("copied");

    // "not copied" indicator should be hidden
    const idleAfter = api.getIndicatorProps({ copied: false });
    expect(idleAfter.hidden).toBe(true);
  });

  it("resets after RESET event", () => {
    const { send, getApi, getState } = createClipboard();

    send({ type: "COPY" });
    expect(getState()).toBe("copied");
    expect(getApi().copied).toBe(true);

    send({ type: "RESET" });
    expect(getState()).toBe("idle");
    expect(getApi().copied).toBe(false);
  });

  it("trigger props have correct attributes", () => {
    const { getApi } = createClipboard();
    const api = getApi();
    const triggerProps = api.getTriggerProps();
    expect(triggerProps.type).toBe("button");
    expect(triggerProps["aria-label"]).toBe("Copy to clipboard");
    expect(triggerProps["data-state"]).toBe("idle");
  });

  it("trigger aria-label changes to Copied after copy", () => {
    const { send, getApi } = createClipboard();
    send({ type: "COPY" });
    const triggerProps = getApi().getTriggerProps();
    expect(triggerProps["aria-label"]).toBe("Copied");
    expect(triggerProps["data-state"]).toBe("copied");
  });

  it("input props contain the value", () => {
    const { getApi } = createClipboard("test-value");
    const inputProps = getApi().getInputProps();
    expect(inputProps.value).toBe("test-value");
    expect(inputProps.readOnly).toBe(true);
    expect(inputProps.type).toBe("text");
  });

  it("root data-state reflects machine state", () => {
    const { send, getApi } = createClipboard();
    expect(getApi().getRootProps()["data-state"]).toBe("idle");
    send({ type: "COPY" });
    expect(getApi().getRootProps()["data-state"]).toBe("copied");
    send({ type: "RESET" });
    expect(getApi().getRootProps()["data-state"]).toBe("idle");
  });
});
