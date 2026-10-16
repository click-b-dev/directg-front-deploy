// ─── Case Helpers ───

const splitWords = (str: string): string[] => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_./\\]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
};

/** 첫 글자를 대문자로 변환 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/** PascalCase로 변환 */
export const toPascalCase = (str: string): string => {
  return splitWords(str)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
};

/** camelCase로 변환 */
export const toCamelCase = (str: string): string => {
  const pascal = toPascalCase(str);
  if (!pascal) return pascal;
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

/** kebab-case로 변환 */
export const toKebabCase = (str: string): string => {
  return splitWords(str)
    .map((w) => w.toLowerCase())
    .join("-");
};

/** snake_case로 변환 */
export const toSnakeCase = (str: string): string => {
  return splitWords(str)
    .map((w) => w.toLowerCase())
    .join("_");
};

// ─── String Manipulation ───

export interface TruncateOptions {
  /** 최대 길이 (suffix 포함) */
  length: number;
  /** 말줄임 문자 (기본값: "...") */
  suffix?: string;
}

/** 문자열을 자르고 suffix 처리 */
export const truncate = (str: string, options: TruncateOptions): string => {
  const { length, suffix = "..." } = options;
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
};

export interface MaskOptions {
  /** 앞에서 보여줄 글자 수 (기본값: 0) */
  start?: number;
  /** 뒤에서 보여줄 글자 수 (기본값: 0) */
  end?: number;
  /** 마스킹 문자 (기본값: "*") */
  char?: string;
}

/** 민감 정보를 마스킹 */
export const mask = (str: string, options?: MaskOptions): string => {
  const { start = 0, end = 0, char = "*" } = options ?? {};

  if (str.length <= start + end) return str;

  const head = str.slice(0, start);
  const tail = end > 0 ? str.slice(-end) : "";
  const masked = char.repeat(str.length - start - end);

  return head + masked + tail;
};

// ─── Sanitization ───

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** 위험한 HTML 문자를 이스케이프 */
export const sanitize = (str: string): string => {
  return str.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
};

// ─── UUID ───

/** 랜덤 UUID v4를 생성 */
export const createUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // crypto.randomUUID 미지원 환경 폴백
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
