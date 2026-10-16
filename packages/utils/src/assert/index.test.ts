import { describe, expect, it } from "vitest";
import { assert, assertNever } from "./index";

describe("assert", () => {
  it("조건이 truthy이면 예외를 던지지 않는다", () => {
    expect(() => assert(true, "should not throw")).not.toThrow();
    expect(() => assert(1, "should not throw")).not.toThrow();
    expect(() => assert("non-empty", "should not throw")).not.toThrow();
    expect(() => assert({}, "should not throw")).not.toThrow();
  });

  it("조건이 falsy이면 메시지와 함께 Error를 던진다", () => {
    expect(() => assert(false, "condition failed")).toThrow("condition failed");
    expect(() => assert(null, "is null")).toThrow("is null");
    expect(() => assert(undefined, "is undefined")).toThrow("is undefined");
    expect(() => assert(0, "is zero")).toThrow("is zero");
    expect(() => assert("", "is empty")).toThrow("is empty");
  });

  it("Error 객체를 전달하면 해당 Error를 그대로 던진다", () => {
    const customError = new TypeError("custom type error");
    expect(() => assert(false, customError)).toThrow(customError);
  });

  it("통과 후 TypeScript narrowing이 동작한다", () => {
    const value: string | null = "hello";
    assert(value, "value must exist");
    // assert 이후 value는 string으로 좁혀짐
    expect(value.toUpperCase()).toBe("HELLO");
  });
});

describe("assertNever", () => {
  it("호출되면 항상 Error를 던진다", () => {
    expect(() => assertNever("unexpected" as never)).toThrow(
      "Unexpected value reached: unexpected",
    );
  });

  it("커스텀 메시지를 사용할 수 있다", () => {
    expect(() => assertNever("bad" as never, "Unhandled case")).toThrow("Unhandled case: bad");
  });
});
