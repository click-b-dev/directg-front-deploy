import type { PnMode, PnResponse } from "./types";

// _inc.php pn_default_mode / pn_normalize_mode — 'prod'|'test'만 유지, 그 외 → 'prod'.
export const PN_DEFAULT_MODE: PnMode = "prod";

export const normalizePnMode = (mode: unknown): PnMode =>
  mode === "prod" || mode === "test" ? mode : PN_DEFAULT_MODE;

// _inc.php pn_extract_error — errors[0].message 또는 기본 메시지.
export const pnExtractError = (
  result: PnResponse<unknown> | null | undefined,
  fallback = "API 오류가 발생했습니다.",
): string => result?.errors?.[0]?.message || fallback;

// runTest data: 배열이면 첫 원소, 아니면 그대로.
export const pnFirstData = <T>(data: T | T[] | undefined): T | undefined => {
  if (Array.isArray(data)) {
    return data[0];
  }
  return data;
};

// data를 배열로 정규화(단일 객체면 [obj], 없으면 []).
export const pnAsArray = <T>(data: T | T[] | undefined): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  return data ? [data] : [];
};

// _inc.php pn_fmt_price — 통화 기호를 금액 앞으로 이동("58,000₩" → "₩ 58,000").
export const pnFmtPrice = (formatted: unknown, symbol: string | null = null): string => {
  if (formatted === null || formatted === undefined || formatted === "") {
    return "";
  }
  const s = String(formatted).trim();
  // 끝에 통화 기호가 있는 경우 분리
  const tail = s.match(/^([0-9][0-9,.]*)\s*(.+)$/u);
  if (tail) {
    const amount = tail[1];
    const sym = tail[2].trim();
    if (sym !== "") {
      return `${sym} ${amount}`;
    }
  }
  // 앞에 이미 기호가 있는 경우 그대로
  const head = s.match(/^(\D+?)\s*([0-9][0-9,.]*)$/u);
  if (head) {
    return `${head[1].trim()} ${head[2]}`;
  }
  if (symbol) {
    return `${symbol} ${s}`;
  }
  return s;
};

// _inc.php pn_get_lang — 다국어 객체에서 우선순위 텍스트(strip_tags 후 비지 않은 것).
const PN_LANGS = ["ko-KR", "en-GB", "en-US", "ja-JP", "zh-CN", "zh-TW"];
const stripTags = (s: string) => s.replace(/<[^>]*>/g, "");
export const pnGetLang = (obj: unknown, langs: string[] = PN_LANGS): string => {
  if (!obj || typeof obj !== "object") {
    return "";
  }
  const arr = obj as Record<string, unknown>;
  for (const lang of langs) {
    const v = arr[lang];
    if (typeof v === "string" && stripTags(v).trim() !== "") {
      return v;
    }
  }
  for (const v of Object.values(arr)) {
    if (typeof v === "string" && stripTags(v).trim() !== "") {
      return v;
    }
  }
  return "";
};

// _inc.php pn_relevant_countries / pn_filter_countries — KR/JP/WW/ROW만 표시.
export const PN_RELEVANT_COUNTRIES = ["KR", "JP", "WW", "ROW"];
export const pnIsRelevantCountry = (code: unknown): boolean =>
  PN_RELEVANT_COUNTRIES.includes(String(code));

export const pnFilterCountries = (
  countries: unknown[] | undefined,
): { shown: string[]; hidden: number } => {
  const shown: string[] = [];
  let hidden = 0;
  for (const c of countries ?? []) {
    if (pnIsRelevantCountry(c)) {
      const code = String(c);
      if (!shown.includes(code)) {
        shown.push(code);
      }
    } else {
      hidden++;
    }
  }
  return { shown, hidden };
};

// _inc.php pn_relevant_currencies / pn_filter_currencies — KRW/JPY/USD만 표시.
export const PN_RELEVANT_CURRENCIES = ["KRW", "JPY", "USD"];
export const pnIsRelevantCurrency = (code: unknown): boolean =>
  PN_RELEVANT_CURRENCIES.includes(String(code));

export const pnFilterCurrencies = (
  currencies: unknown[] | undefined,
): { shown: string[]; hidden: number } => {
  const shown: string[] = [];
  let hidden = 0;
  for (const c of currencies ?? []) {
    if (pnIsRelevantCurrency(c)) {
      const code = String(c);
      if (!shown.includes(code)) {
        shown.push(code);
      }
    } else {
      hidden++;
    }
  }
  return { shown, hidden };
};

// pointnexus_operation.php pn_currency_amount — 통화 기호 + 금액 포맷.
// KRW/JPY(zero-decimal)는 정수, 그 외는 최소단위(×100 가정) → /100 소수 2자리.
export const pnCurrencyAmount = (amount: unknown, currencyCode: string): string => {
  const symbols: Record<string, string> = {
    KRW: "₩",
    JPY: "¥",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  const sym = symbols[currencyCode] ?? "";
  if (amount === null || amount === undefined || amount === "") {
    return "";
  }
  const zeroDecimal = ["KRW", "JPY"];
  let val: string;
  if (zeroDecimal.includes(currencyCode)) {
    val = Math.trunc(Number(amount)).toLocaleString();
  } else {
    val = (Number(amount) / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return (sym ? `${sym} ` : "") + val;
};

// _inc.php pn_fmt_date — T→공백 치환, 앞 len자만(기본 19). 빈값이면 '—'.
export const pnFmtDate = (s: unknown, len = 19): string => {
  if (!s) {
    return "—";
  }
  return String(s).slice(0, len).replace("T", " ");
};

// legacy 동적 컬럼 수집: 모든 원소 키의 합집합(등장 순서 유지).
export const collectPnColumns = (rows: Record<string, unknown>[]): string[] => {
  const columns: string[] = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!columns.includes(key)) {
        columns.push(key);
      }
    }
  }
  return columns;
};
