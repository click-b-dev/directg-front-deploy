import { describe, it, expect } from "vitest";
import { createAvatarMachine, connectAvatar } from "@/machines/avatar";

/**
 * Avatar tests at the machine/connect level.
 * The React component layer triggers an infinite update loop (useMachine + useSyncExternalStore bug),
 * so we test the pure state machine logic directly.
 */

function createAvatar(src?: string) {
  const machine = createAvatarMachine(src ? { src } : {});
  let state = machine.initialState;
  let context = machine.initialContext;
  const ids = { root: "avatar-1" };

  function send(event: Parameters<typeof machine.transition>[2]) {
    const result = machine.transition(state, context, event);
    state = result.state;
    context = result.context;
  }

  function getApi() {
    return connectAvatar(state, context, send, ids);
  }

  return { send, getApi, getState: () => state };
}

describe("Avatar", () => {
  it("starts in loading state when src is provided", () => {
    const { getApi, getState } = createAvatar("https://example.com/avatar.png");
    const api = getApi();
    expect(getState()).toBe("loading");
    expect(api.isLoaded).toBe(false);
  });

  it("starts in error state when no src is provided", () => {
    const { getState } = createAvatar();
    expect(getState()).toBe("error");
  });

  it("shows image when loaded (transition to loaded state)", () => {
    const { send, getApi, getState } = createAvatar("https://example.com/avatar.png");

    send({ type: "IMAGE_LOAD" });

    expect(getState()).toBe("loaded");
    const api = getApi();
    expect(api.isLoaded).toBe(true);

    // Image props: hidden should be false when loaded
    const imageProps = api.getImageProps();
    expect(imageProps.hidden).toBe(false);
    expect(imageProps["data-state"]).toBe("loaded");
  });

  it("shows fallback when image fails (transition to error state)", () => {
    const { send, getApi, getState } = createAvatar("https://example.com/bad.png");

    send({ type: "IMAGE_ERROR" });

    expect(getState()).toBe("error");
    const api = getApi();
    expect(api.isLoaded).toBe(false);

    // Fallback props: hidden should be false when NOT loaded
    const fallbackProps = api.getFallbackProps();
    expect(fallbackProps.hidden).toBe(false);
    expect(fallbackProps["data-state"]).toBe("error");

    // Image should be hidden
    const imageProps = api.getImageProps();
    expect(imageProps.hidden).toBe(true);
  });

  it("data-state reflects loading state on root", () => {
    const { getApi } = createAvatar("https://example.com/avatar.png");
    const api = getApi();
    const rootProps = api.getRootProps();
    expect(rootProps["data-state"]).toBe("loading");
    expect(rootProps["data-scope"]).toBe("avatar");
    expect(rootProps["data-part"]).toBe("root");
  });

  it("root shows loaded data-state after image loads", () => {
    const { send, getApi } = createAvatar("https://example.com/avatar.png");
    send({ type: "IMAGE_LOAD" });
    const rootProps = getApi().getRootProps();
    expect(rootProps["data-state"]).toBe("loaded");
  });
});
