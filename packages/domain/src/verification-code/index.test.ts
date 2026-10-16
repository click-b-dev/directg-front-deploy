import { describe, expect, it } from "vitest";

import {
  getVerificationCodeSecondsLeft,
  isVerificationCodeVerified,
  parseVerificationCodeExpiresAt,
  resolveVerificationCodeExpiresAt,
} from "./index";

describe("verification-code", () => {
  it("offset 없는 ISO 값을 UTC로 정규화해 파싱한다", () => {
    expect(parseVerificationCodeExpiresAt("2026-01-01T00:00:30")).toBe(
      Date.parse("2026-01-01T00:00:30Z"),
    );
  });

  it("서버 만료시각이 fallback 범위 밖이면 fallback을 사용한다", () => {
    const now = Date.parse("2026-01-01T00:00:00Z");

    expect(resolveVerificationCodeExpiresAt("2026-01-01T00:01:00Z", 180, now)).toBe(
      Date.parse("2026-01-01T00:01:00Z"),
    );
    expect(resolveVerificationCodeExpiresAt("2026-01-01T00:10:00Z", 180, now)).toBe(now + 180_000);
    expect(resolveVerificationCodeExpiresAt("bad", 180, now)).toBe(now + 180_000);
  });

  it("남은 인증 시간을 초 단위로 올림 계산한다", () => {
    expect(getVerificationCodeSecondsLeft(10_001, 10_000)).toBe(1);
    expect(getVerificationCodeSecondsLeft(10_000, 10_001)).toBe(0);
  });

  it("boolean 또는 { verified } 응답을 검증 결과로 해석한다", () => {
    expect(isVerificationCodeVerified(true)).toBe(true);
    expect(isVerificationCodeVerified({ verified: false })).toBe(false);
  });
});
