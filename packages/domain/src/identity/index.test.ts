import { describe, expect, it } from "vitest";

import {
  birthDateFromDomesticRrn,
  birthDateFromRrn,
  formatDuration,
  formatKoreanPhoneNumber,
  isPasswordPolicyMatched,
  onlyDigits,
} from "./index";

describe("identity", () => {
  it("숫자만 최대 길이만큼 남긴다", () => {
    expect(onlyDigits("010-1234-5678", 11)).toBe("01012345678");
    expect(onlyDigits("abc123456", 4)).toBe("1234");
  });

  it("한국 휴대폰 번호를 하이픈 포함 형식으로 변환한다", () => {
    expect(formatKoreanPhoneNumber("010")).toBe("010");
    expect(formatKoreanPhoneNumber("0101234")).toBe("010-1234");
    expect(formatKoreanPhoneNumber("01012345678")).toBe("010-1234-5678");
    expect(formatKoreanPhoneNumber("010-1234-567899")).toBe("010-1234-5678");
  });

  it("초 단위를 mm:ss로 포맷한다", () => {
    expect(formatDuration(119)).toBe("01:59");
    expect(formatDuration(-1)).toBe("00:00");
  });

  it("주민등록번호 첫 자리 기준으로 생년월일 세기를 계산한다", () => {
    expect(birthDateFromRrn("990101", "1")).toBe("1999-01-01");
    expect(birthDateFromRrn("000101", "3")).toBe("2000-01-01");
    expect(birthDateFromRrn("990101", "7")).toBe("2099-01-01");
    expect(birthDateFromRrn("990101", "9")).toBeNull();
  });

  it("내국인 본인확인 생년월일은 주민등록번호 첫 자리 1-4만 허용한다", () => {
    expect(birthDateFromDomesticRrn("990101", "2")).toBe("1999-01-01");
    expect(birthDateFromDomesticRrn("990101", "5")).toBeNull();
  });

  it("비밀번호 정책은 영문, 숫자, 특수문자 조합 8-16자를 요구한다", () => {
    expect(isPasswordPolicyMatched("abc123!!")).toBe(true);
    expect(isPasswordPolicyMatched("abcdefghi")).toBe(false);
    expect(isPasswordPolicyMatched("abc123")).toBe(false);
  });
});
