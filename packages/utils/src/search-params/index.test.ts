import { describe, expect, it } from "vitest";
import {
  parseSearchParams,
  buildSearchParams,
  mergeSearchParams,
  type SearchParamSchema,
} from "./index";

const createStringParser = (defaultValue = "") => ({
  parse: (raw: string | string[] | null) => (typeof raw === "string" ? raw : defaultValue),
  serialize: (value: string) => (value === "" ? null : value),
  defaultValue,
});

const createNumberParser = (defaultValue = 0) => ({
  parse: (raw: string | string[] | null) => {
    if (raw === null || Array.isArray(raw)) return defaultValue;
    const n = Number(raw);
    return Number.isNaN(n) ? defaultValue : n;
  },
  serialize: (value: number) => String(value),
  defaultValue,
});

type TestSchema = { keyword: string; page: number; size: number };

const testSchema: SearchParamSchema<TestSchema> = {
  keyword: createStringParser(""),
  page: createNumberParser(0),
  size: createNumberParser(10),
};

describe("parseSearchParams", () => {
  it("query string에서 schema 기준으로 값을 파싱한다", () => {
    const result = parseSearchParams("?keyword=hello&page=2&size=20", testSchema);
    expect(result).toEqual({ keyword: "hello", page: 2, size: 20 });
  });

  it("누락된 key에 대해 defaultValue를 적용한다", () => {
    const result = parseSearchParams("?keyword=test", testSchema);
    expect(result).toEqual({ keyword: "test", page: 0, size: 10 });
  });

  it("빈 query string이면 모든 key에 defaultValue를 적용한다", () => {
    const result = parseSearchParams("", testSchema);
    expect(result).toEqual({ keyword: "", page: 0, size: 10 });
  });

  it("URLSearchParams 객체를 입력으로 받을 수 있다", () => {
    const params = new URLSearchParams("keyword=world&page=5");
    const result = parseSearchParams(params, testSchema);
    expect(result).toEqual({ keyword: "world", page: 5, size: 10 });
  });

  it("유효하지 않은 값에 대해 defaultValue로 fallback한다", () => {
    const result = parseSearchParams("?page=abc", testSchema);
    expect(result.page).toBe(0);
  });
});

describe("buildSearchParams", () => {
  it("객체를 query string으로 직렬화한다", () => {
    const result = buildSearchParams({ keyword: "hello", page: 1 });
    expect(result).toContain("keyword=hello");
    expect(result).toContain("page=1");
  });

  it("key를 알파벳 순으로 정렬한다", () => {
    const result = buildSearchParams({ z: "last", a: "first" });
    expect(result).toBe("a=first&z=last");
  });

  it("null 값은 기본적으로 건너뛴다 (skipNull: true)", () => {
    const result = buildSearchParams({ a: "keep", b: null });
    expect(result).toBe("a=keep");
  });

  it("빈 문자열은 기본적으로 건너뛴다 (skipEmptyString: true)", () => {
    const result = buildSearchParams({ a: "keep", b: "" });
    expect(result).toBe("a=keep");
  });

  it("skipNull: false이면 null을 빈 문자열로 직렬화한다", () => {
    const result = buildSearchParams({ a: null }, { skipNull: false });
    expect(result).toBe("a=");
  });

  it("배열을 repeat 형식으로 직렬화한다", () => {
    const result = buildSearchParams({ tags: ["a", "b", "c"] });
    expect(result).toBe("tags=a&tags=b&tags=c");
  });

  it("배열을 comma 형식으로 직렬화한다", () => {
    const result = buildSearchParams({ tags: ["a", "b"] }, { arrayFormat: "comma" });
    expect(result).toBe("tags=a%2Cb");
  });

  it("undefined 값은 건너뛴다", () => {
    const result = buildSearchParams({ a: "keep", b: undefined });
    expect(result).toBe("a=keep");
  });

  it("boolean과 number를 문자열로 변환한다", () => {
    const result = buildSearchParams({ active: true, count: 42 });
    expect(result).toContain("active=true");
    expect(result).toContain("count=42");
  });
});

describe("mergeSearchParams", () => {
  it("기존 query string에 patch를 적용한다", () => {
    const result = mergeSearchParams("keyword=old&page=1", { keyword: "new" });
    expect(result).toContain("keyword=new");
    expect(result).toContain("page=1");
  });

  it("patch에 없는 key는 유지한다", () => {
    const result = mergeSearchParams("a=1&b=2&c=3", { b: "updated" });
    expect(result).toContain("a=1");
    expect(result).toContain("b=updated");
    expect(result).toContain("c=3");
  });

  it("patch의 undefined는 변경 없음으로 취급한다", () => {
    const result = mergeSearchParams("a=1&b=2", { a: undefined, b: "new" });
    expect(result).toContain("a=1");
    expect(result).toContain("b=new");
  });

  it("patch의 null은 해당 key를 삭제한다", () => {
    const result = mergeSearchParams("a=1&b=2&c=3", { b: null });
    expect(result).not.toContain("b=");
    expect(result).toContain("a=1");
    expect(result).toContain("c=3");
  });

  it("배열 patch는 기존 값을 전부 지우고 새 값으로 쓴다", () => {
    const result = mergeSearchParams("tags=old1&tags=old2", { tags: ["new1", "new2"] });
    expect(result).not.toContain("old");
    expect(result).toContain("tags=new1");
    expect(result).toContain("tags=new2");
  });

  it("URLSearchParams 객체를 base로 받을 수 있다", () => {
    const base = new URLSearchParams("x=1");
    const result = mergeSearchParams(base, { y: "2" });
    expect(result).toContain("x=1");
    expect(result).toContain("y=2");
  });
});
