// getPromotionWeekendConfig/Best(server-only, next/headers)는 배럴 제외 — deep import.
export type { PromotionWeekendConfig } from "./model/types";
export type { WeekendBestResponse } from "./model/best-types";
export type { WeekendGamesResponse } from "./model/games-types";
export type { WeekendRecommandGame, WeekendRecommandResponse } from "./model/recommand-types";
export { getPromotionWeekendRecommand } from "./api/get-promotion-weekend-recommand";
