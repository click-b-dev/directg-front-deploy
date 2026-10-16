// ─── Format Constants ───

export const DATE_FORMAT = {
  "YYYY-MM-DD": "YYYY-MM-DD",
  "YYYY.MM.DD": "YYYY.MM.DD",
  "YYYY/MM/DD": "YYYY/MM/DD",
  "MM-DD": "MM-DD",
  "YYYY-MM-DD HH:mm": "YYYY-MM-DD HH:mm",
  "YYYY-MM-DD HH:mm:ss": "YYYY-MM-DD HH:mm:ss",
  "HH:mm": "HH:mm",
  "HH:mm:ss": "HH:mm:ss",
} as const;

export type DateFormat = (typeof DATE_FORMAT)[keyof typeof DATE_FORMAT];

const pad = (n: number): string => {
  return n < 10 ? `0${n}` : `${n}`;
};

/** Date를 지정 포맷 문자열로 변환 */
export const formatDate = (date: Date, format: DateFormat = DATE_FORMAT["YYYY-MM-DD"]): string => {
  const y = date.getFullYear();
  const M = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());

  return format
    .replace("YYYY", `${y}`)
    .replace("MM", M)
    .replace("DD", d)
    .replace("HH", h)
    .replace("mm", m)
    .replace("ss", s);
};

// ─── Relative Time (실시간 Date 표기) ───

export type RelativeTimeLocale = "ko" | "en";

interface TimeUnit {
  max: number;
  divisor: number;
  ko: string;
  en: { one: string; other: string };
}

const TIME_UNITS: TimeUnit[] = [
  { max: 60, divisor: 1, ko: "방금 전", en: { one: "just now", other: "just now" } },
  { max: 3600, divisor: 60, ko: "분 전", en: { one: "minute ago", other: "minutes ago" } },
  { max: 86400, divisor: 3600, ko: "시간 전", en: { one: "hour ago", other: "hours ago" } },
  { max: 604800, divisor: 86400, ko: "일 전", en: { one: "day ago", other: "days ago" } },
  {
    max: 2592000,
    divisor: 604800,
    ko: "주 전",
    en: { one: "week ago", other: "weeks ago" },
  },
  {
    max: 31536000,
    divisor: 2592000,
    ko: "개월 전",
    en: { one: "month ago", other: "months ago" },
  },
  {
    max: Infinity,
    divisor: 31536000,
    ko: "년 전",
    en: { one: "year ago", other: "years ago" },
  },
];

/**
 * 과거 시각을 상대적 표현으로 변환.
 * 미래 시각이 들어오면 빈 문자열 대신 해당 로케일의 "방금 전"/"just now"를 반환한다.
 */
export const formatRelativeTime = (
  date: Date,
  locale: RelativeTimeLocale = "ko",
  now: Date = new Date(),
): string => {
  const diffSec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  for (const unit of TIME_UNITS) {
    if (diffSec < unit.max) {
      // "방금 전" / "just now"
      if (unit.divisor === 1) {
        return locale === "ko" ? unit.ko : unit.en.one;
      }

      const value = Math.floor(diffSec / unit.divisor);

      if (locale === "ko") {
        return `${value}${unit.ko}`;
      }

      const label = value === 1 ? unit.en.one : unit.en.other;
      return `${value} ${label}`;
    }
  }

  return locale === "ko" ? "방금 전" : "just now";
};

// ─── D-Day ───

/**
 * 목표 날짜까지 남은 일수를 D-Day 문자열로 반환.
 *
 * - 미래: "D-3"
 * - 당일: "D-DAY"
 * - 과거: "D+2"
 *
 * 시/분/초를 무시하고 날짜 단위로만 계산한다.
 */
export const formatDDay = (targetDate: Date, today: Date = new Date()): string => {
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffMs = target.getTime() - current.getTime();
  const diffDays = Math.round(diffMs / 86400000);

  if (diffDays === 0) return "D-DAY";
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
};

/**
 * 목표 날짜까지 남은 일수를 숫자로 반환.
 * 미래면 양수, 과거면 음수, 당일이면 0.
 */
export const getDDayNumber = (targetDate: Date, today: Date = new Date()): number => {
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.round((target.getTime() - current.getTime()) / 86400000);
};
