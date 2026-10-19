import type { MemberLevelHistoryItem } from "@entities/member";

export const LEVEL_PAGE_SIZE = 20;

export type LevelChange = "up" | "down" | "same";

export type LevelHistoryRow = {
  key: string;
  /** 산정일 */
  calculatedAt: string;
  /** 산정 기간(시작 ~ 종료) */
  period: string;
  /** 최근 구매 총액 */
  orderPrice: number;
  /** 이전 등급(가장 오래된 이력은 알 수 없다) */
  previousLevel: number | undefined;
  level: number;
  change: LevelChange | undefined;
};

const pad = (value: number) => String(value).padStart(2, "0");
const format = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// history_date는 "YYYY-MM"(월 단위) 또는 "YYYY-MM-DD"로 온다. 월 단위는 1일로 본다.
const toDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

// 기획: 산정 기간 = 산정일 기준 직전 6개월 (예: 산정일 2026-07-01 → 2026-01-01 ~ 2026-06-30)
export const getCalculationPeriod = (calculatedAt: string) => {
  const base = toDate(calculatedAt);
  const start = new Date(base.getFullYear(), base.getMonth() - 6, base.getDate());
  const end = new Date(base.getFullYear(), base.getMonth(), base.getDate() - 1);
  return `${format(start)} ~ ${format(end)}`;
};

// 기획: 정렬 = 산정일 기준 내림차순. 이전 등급은 바로 앞(더 오래된) 이력의 등급이다.
export const toLevelRows = (history: MemberLevelHistoryItem[]): LevelHistoryRow[] => {
  const sorted = [...history].sort((a, b) => b.history_date.localeCompare(a.history_date));
  return sorted.map((item, index) => {
    const previous = sorted[index + 1];
    const previousLevel = previous?.mem_level;
    const change: LevelChange | undefined =
      previousLevel === undefined
        ? undefined
        : item.mem_level > previousLevel
          ? "up"
          : item.mem_level < previousLevel
            ? "down"
            : "same";
    return {
      key: item.history_date,
      calculatedAt: format(toDate(item.history_date)),
      period: getCalculationPeriod(item.history_date),
      orderPrice: item.order_price,
      previousLevel,
      level: item.mem_level,
      change,
    };
  });
};

export const CHANGE_LABEL: Record<LevelChange, string> = { up: "승급", down: "강등", same: "유지" };
export const CHANGE_TONE = { up: "info", down: "error", same: "neutral" } as const;
