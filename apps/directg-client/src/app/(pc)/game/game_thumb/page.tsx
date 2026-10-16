import type { Metadata, Viewport } from "next";

import { getGameList } from "@entities/game-list/api/get-game-list";
import { GameListScreen } from "@screens/game-list";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** page 제외 필터 파라미터 수집 (category_code/q 없음 — 백엔드 필터). */
const collectFilters = (sp: Record<string, string | string[] | undefined>) => {
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page") continue;
    const v = firstParam(value);
    if (v) {
      filters[key] = v;
    }
  }
  return filters;
};

/** legacy `pc/game/game_thumb.html` head. title="게임"(정적), description·author 빈, amazonbot noarchive. */
export const metadata: Metadata = {
  title: "게임",
  description: "",
  authors: [{ name: "" }],
  other: { amazonbot: "noarchive" },
};

export default async function GameThumbPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  const data = await getGameList(page, collectFilters(sp));

  return <GameListScreen data={data} viewType="thumb" />;
}
