import { describe, expect, it } from "vitest";
import { formatNumber, formatCurrency, formatDateTime, formatIntlRelativeTime } from "./index";

describe("formatNumber", () => {
  it("locale 규칙에 따라 숫자를 포맷한다", () => {
    expect(formatNumber(1234567, "ko-KR")).toBe("1,234,567");
  });

  it("옵션으로 소수점 자릿수를 지정할 수 있다", () => {
    const result = formatNumber(0.1234, "en-US", { maximumFractionDigits: 2 });
    expect(result).toBe("0.12");
  });

  it("locale을 생략하면 기본 locale을 사용한다", () => {
    expect(() => formatNumber(42)).not.toThrow();
  });
});

describe("formatCurrency", () => {
  it("한국 원화를 포맷한다", () => {
    const result = formatCurrency(50000, "ko-KR", "KRW");
    expect(result).toContain("50,000");
    expect(result).toContain("₩");
  });

  it("미국 달러를 포맷한다", () => {
    const result = formatCurrency(1234.56, "en-US", "USD");
    expect(result).toContain("$");
    expect(result).toContain("1,234.56");
  });
});

describe("formatDateTime", () => {
  it("Date 객체를 포맷한다", () => {
    const date = new Date("2026-01-15T09:30:00Z");
    const result = formatDateTime(date, "ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    });
    expect(result).toContain("2026");
    expect(result).toContain("01");
    expect(result).toContain("15");
  });

  it("ISO 문자열을 입력으로 받을 수 있다", () => {
    const result = formatDateTime("2026-03-20T00:00:00Z", "en-US", { timeZone: "UTC" });
    expect(result).toContain("2026");
  });

  it("타임스탬프 숫자를 입력으로 받을 수 있다", () => {
    const timestamp = new Date("2026-06-01T00:00:00Z").getTime();
    expect(() => formatDateTime(timestamp, "ko-KR", { timeZone: "UTC" })).not.toThrow();
  });

  it("유효하지 않은 날짜 입력이면 TypeError를 던진다", () => {
    expect(() => formatDateTime("invalid-date")).toThrow(TypeError);
  });
});

describe("formatIntlRelativeTime", () => {
  it("한국어 상대 시간을 포맷한다", () => {
    const result = formatIntlRelativeTime(-3, "day", "ko-KR");
    expect(result).toBe("3일 전");
  });

  it("영어 상대 시간을 포맷한다", () => {
    const result = formatIntlRelativeTime(2, "hour", "en-US");
    expect(result).toBe("in 2 hours");
  });

  it("양수는 미래, 음수는 과거를 나타낸다", () => {
    const future = formatIntlRelativeTime(1, "month", "ko-KR");
    const past = formatIntlRelativeTime(-1, "month", "ko-KR");
    expect(future).toContain("후");
    expect(past).toContain("전");
  });
});
