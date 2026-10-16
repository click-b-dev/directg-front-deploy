import type { Metadata, Viewport } from "next";

import { getGameList } from "@entities/game-list/api/get-game-list";
import { GameSearchScreen } from "@screens/game-search";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** page 제외 필터 파라미터 수집 (q 포함 — 백엔드 검색). */
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

/** legacy `pc/game/game_search_grid.html` head. title="통합검색 - {q}", description·author 빈, amazonbot noarchive. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: `통합검색 - ${firstParam(sp.q)}`,
    description: "",
    authors: [{ name: "" }],
    other: { amazonbot: "noarchive" },
  };
}

export default async function GameSearchGridPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = firstParam(sp.q);
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  const data = await getGameList(page, collectFilters(sp));

  return <GameSearchScreen data={data} q={q} viewType="grid" />;
}
