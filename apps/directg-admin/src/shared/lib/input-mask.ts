// legacy Hyper app.js: `$('[data-toggle="input-mask"]').mask(format)` (jQuery Mask Plugin) 재현.
// CSS-only(테마 JS 미도입)이므로 마스킹은 기능적 동작으로서 React로 재현한다.
// format 규칙: '0' = 숫자 한 자리, 그 외 문자 = 리터럴 구분자(다음 숫자 입력 시 자동 삽입). forward 방향.
// 예: applyMask("20260714", "0000-00-00 00:00:00") → "2026-07-14"
export const applyMask = (value: string, format: string): string => {
  const digits = value.replace(/\D/g, "");
  let result = "";
  let digitIndex = 0;
  for (const ch of format) {
    if (digitIndex >= digits.length) {
      break;
    }
    if (ch === "0") {
      result += digits[digitIndex];
      digitIndex += 1;
    } else {
      result += ch;
    }
  }
  return result;
};

// legacy data-mask-format 상수(admin 폼 공통).
export const DATETIME_MASK = "0000-00-00 00:00:00";
