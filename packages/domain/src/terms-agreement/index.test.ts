import { describe, expect, it } from "vitest";

import {
  areAllTermsAccepted,
  areRequiredTermsAccepted,
  createTermsAgreementValues,
  getAcceptedTermKeys,
  getOptionalTerms,
  getRequiredTerms,
  setAllTermsAgreementValues,
  setTermAgreementValue,
  type TermDefinition,
} from "./index";

const terms = [
  { key: "age", label: "만 14세 이상", required: true },
  { key: "service", label: "서비스 이용약관", required: true },
  { key: "marketing", label: "마케팅 수신", required: false },
] as const satisfies readonly TermDefinition<string>[];

describe("terms-agreement", () => {
  it("정의된 약관 key만 boolean 값으로 초기화한다", () => {
    expect(createTermsAgreementValues(terms, { age: true })).toEqual({
      age: true,
      service: false,
      marketing: false,
    });
  });

  it("필수/선택 약관을 분리한다", () => {
    expect(getRequiredTerms(terms).map((term) => term.key)).toEqual(["age", "service"]);
    expect(getOptionalTerms(terms).map((term) => term.key)).toEqual(["marketing"]);
  });

  it("전체동의와 필수동의를 각각 계산한다", () => {
    const requiredOnly = createTermsAgreementValues(terms, { age: true, service: true });
    const all = setAllTermsAgreementValues(terms, true);

    expect(areRequiredTermsAccepted(terms, requiredOnly)).toBe(true);
    expect(areAllTermsAccepted(terms, requiredOnly)).toBe(false);
    expect(areAllTermsAccepted(terms, all)).toBe(true);
  });

  it("단일 약관과 전체 약관 값을 갱신한다", () => {
    const initial = createTermsAgreementValues(terms);

    expect(setTermAgreementValue(terms, initial, "age", true)).toEqual({
      age: true,
      service: false,
      marketing: false,
    });
    expect(setAllTermsAgreementValues(terms, true)).toEqual({
      age: true,
      service: true,
      marketing: true,
    });
  });

  it("동의된 약관 key를 정의 순서대로 반환한다", () => {
    expect(getAcceptedTermKeys(terms, { marketing: true, age: true })).toEqual([
      "age",
      "marketing",
    ]);
  });
});
