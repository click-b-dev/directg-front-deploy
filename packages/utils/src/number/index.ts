// ─── formatMoney ───

export type CurrencyCode = "KRW" | "USD";

export interface FormatMoneyOptions {
  /** 통화 코드 (기본값: "KRW") */
  currency?: CurrencyCode;
  /** 소수점 자릿수. KRW 기본값 0, USD 기본값 2 */
  decimals?: number;
  /** 통화 기호 표시 여부 (기본값: true) */
  showSymbol?: boolean;
}

const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; defaultDecimals: number }> = {
  KRW: { symbol: "₩", defaultDecimals: 0 },
  USD: { symbol: "$", defaultDecimals: 2 },
};

/** 숫자를 화폐 단위로 포맷 */
export const formatMoney = (value: number, options?: FormatMoneyOptions): string => {
  const { currency = "KRW", decimals, showSymbol = true } = options ?? {};
  const config = CURRENCY_CONFIG[currency];
  const fractionDigits = decimals ?? config.defaultDecimals;

  const formatted = Math.abs(value)
    .toFixed(fractionDigits)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const sign = value < 0 ? "-" : "";
  const symbol = showSymbol ? config.symbol : "";

  return `${sign}${symbol}${formatted}`;
};

// ─── formatPercent ───

export type RoundingMode = "round" | "ceil" | "floor";

export interface FormatPercentOptions {
  /** 소수점 자릿수 (기본값: 0) */
  decimals?: number;
  /** 올림/반올림/버림 (기본값: "round") */
  rounding?: RoundingMode;
}

/** 숫자를 백분율 문자열로 변환. 입력값은 비율(0.5 → "50%"). */
export const formatPercent = (value: number, options?: FormatPercentOptions): string => {
  const { decimals = 0, rounding = "round" } = options ?? {};

  const percent = value * 100;
  const factor = 10 ** decimals;

  let rounded: number;
  switch (rounding) {
    case "ceil":
      rounded = Math.ceil(percent * factor) / factor;
      break;
    case "floor":
      rounded = Math.floor(percent * factor) / factor;
      break;
    default:
      rounded = Math.round(percent * factor) / factor;
  }

  return `${rounded.toFixed(decimals)}%`;
};
