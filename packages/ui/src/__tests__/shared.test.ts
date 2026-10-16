import { describe, it, expect, vi } from "vitest";
import { isKey, Keys, getNextIndex, isPrintableKey, isArrowKey } from "@/machines/shared/keyboard";
import { setRovingTabindex } from "@/machines/shared/focus";
import { dataAttr, ariaAttr, composeEventHandlers, mergeProps } from "@/machines/shared/dom";

/* ─── keyboard.ts ─── */

describe("isKey", () => {
  it("returns true when key matches a single target", () => {
    expect(isKey("Enter", Keys.Enter)).toBe(true);
  });

  it("returns true when key matches any of multiple targets", () => {
    expect(isKey(" ", Keys.Enter, Keys.Space)).toBe(true);
  });

  it("returns false when key does not match", () => {
    expect(isKey("a", Keys.Enter, Keys.Space)).toBe(false);
  });
});

describe("isPrintableKey", () => {
  it("returns true for a single printable character", () => {
    expect(isPrintableKey("a")).toBe(true);
    expect(isPrintableKey("5")).toBe(true);
  });

  it("returns false for Space", () => {
    expect(isPrintableKey(" ")).toBe(false);
  });

  it("returns false for multi-character strings", () => {
    expect(isPrintableKey("Enter")).toBe(false);
  });
});

describe("isArrowKey", () => {
  it("returns true for all arrow keys", () => {
    expect(isArrowKey("ArrowUp")).toBe(true);
    expect(isArrowKey("ArrowDown")).toBe(true);
    expect(isArrowKey("ArrowLeft")).toBe(true);
    expect(isArrowKey("ArrowRight")).toBe(true);
  });

  it("returns false for non-arrow keys", () => {
    expect(isArrowKey("Enter")).toBe(false);
  });
});

describe("getNextIndex", () => {
  it("moves to next index on ArrowDown (vertical, default)", () => {
    expect(getNextIndex("ArrowDown", 0, 5)).toBe(1);
  });

  it("moves to previous index on ArrowUp (vertical)", () => {
    expect(getNextIndex("ArrowUp", 2, 5)).toBe(1);
  });

  it("loops from last to first when loop=true (default)", () => {
    expect(getNextIndex("ArrowDown", 4, 5, { loop: true })).toBe(0);
  });

  it("loops from first to last when loop=true", () => {
    expect(getNextIndex("ArrowUp", 0, 5, { loop: true })).toBe(4);
  });

  it("stays at boundary when loop=false", () => {
    expect(getNextIndex("ArrowDown", 4, 5, { loop: false })).toBe(4);
    expect(getNextIndex("ArrowUp", 0, 5, { loop: false })).toBe(0);
  });

  it("Home returns 0", () => {
    expect(getNextIndex("Home", 3, 5)).toBe(0);
  });

  it("End returns last index", () => {
    expect(getNextIndex("End", 1, 5)).toBe(4);
  });

  it("horizontal orientation: ArrowRight=next, ArrowLeft=prev", () => {
    expect(getNextIndex("ArrowRight", 1, 5, { orientation: "horizontal" })).toBe(2);
    expect(getNextIndex("ArrowLeft", 1, 5, { orientation: "horizontal" })).toBe(0);
  });

  it("returns current index for unhandled keys", () => {
    expect(getNextIndex("Enter", 2, 5)).toBe(2);
  });
});

/* ─── focus.ts ─── */

describe("setRovingTabindex", () => {
  it("sets tabindex=0 on active item and -1 on others", () => {
    const items = [
      document.createElement("button"),
      document.createElement("button"),
      document.createElement("button"),
    ];

    setRovingTabindex(items, 1);

    expect(items[0].getAttribute("tabindex")).toBe("-1");
    expect(items[1].getAttribute("tabindex")).toBe("0");
    expect(items[2].getAttribute("tabindex")).toBe("-1");
  });

  it("handles activeIndex=0", () => {
    const items = [document.createElement("button"), document.createElement("button")];

    setRovingTabindex(items, 0);

    expect(items[0].getAttribute("tabindex")).toBe("0");
    expect(items[1].getAttribute("tabindex")).toBe("-1");
  });
});

/* ─── dom.ts ─── */

describe("dataAttr", () => {
  it("returns empty string for true (attribute present)", () => {
    expect(dataAttr(true)).toBe("");
  });

  it("returns undefined for false (attribute absent)", () => {
    expect(dataAttr(false)).toBeUndefined();
  });
});

describe("ariaAttr", () => {
  it('returns "true" for true', () => {
    expect(ariaAttr(true)).toBe("true");
  });

  it('returns "false" for false', () => {
    expect(ariaAttr(false)).toBe("false");
  });
});

describe("composeEventHandlers", () => {
  it("calls all handlers in order", () => {
    const order: number[] = [];
    const h1 = () => order.push(1);
    const h2 = () => order.push(2);

    const composed = composeEventHandlers(h1, h2);
    composed({} as Event);

    expect(order).toEqual([1, 2]);
  });

  it("skips undefined handlers", () => {
    const fn = vi.fn();
    const composed = composeEventHandlers(undefined, fn, undefined);
    composed({} as Event);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("stops calling handlers after preventDefault", () => {
    const event = new Event("click", { cancelable: true });
    const h1 = (e: Event) => e.preventDefault();
    const h2 = vi.fn();

    const composed = composeEventHandlers(h1, h2);
    composed(event);

    expect(h2).not.toHaveBeenCalled();
  });
});

describe("mergeProps", () => {
  it("returns machine props when no user props", () => {
    const machine = { id: "test", role: "button" };
    expect(mergeProps(machine)).toEqual(machine);
  });

  it("overrides machine props with user props", () => {
    const machine = { id: "machine-id", role: "button" };
    const user = { id: "user-id" };
    expect(mergeProps(machine, user)).toEqual({ id: "user-id", role: "button" });
  });

  it("composes event handler functions", () => {
    const order: string[] = [];
    const machine = { onClick: () => order.push("machine") };
    const user = { onClick: () => order.push("user") };

    const merged = mergeProps(machine, user);
    (merged.onClick as (e: unknown) => void)({});

    expect(order).toEqual(["machine", "user"]);
  });

  it("concatenates className values", () => {
    const machine = { className: "base" };
    const user = { className: "extra" };
    expect(mergeProps(machine, user)).toEqual({ className: "base extra" });
  });

  it("merges style objects", () => {
    const machine = { style: { color: "red", fontSize: "12px" } };
    const user = { style: { color: "blue" } };
    const result = mergeProps<{ style: { color: string; fontSize?: string } }>(machine, user);
    expect(result.style).toEqual({ color: "blue", fontSize: "12px" });
  });

  it("does not override with undefined user values", () => {
    const machine = { id: "test" };
    const user = { id: undefined };
    expect(mergeProps(machine, user)).toEqual({ id: "test" });
  });
});
