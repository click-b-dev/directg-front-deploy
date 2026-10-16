import type { Metadata, Viewport } from "next";

import { getGameGenreList } from "@entities/game-genre/api/get-game-genre-list";
import { GameGenreScreen } from "@screens/game-genre";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** legacy 기본 genre_code(빈값 → G0001 액션). */
const resolveGenreCode = (raw: string): string => raw || "G0001";

/** page 제외 필터 파라미터 수집 (genre_code 포함 — 백엔드 필터). */
const collectFilters = (sp: Record<string, string | string[] | undefined>) => {
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page" || key === "genre_code") continue;
    const v = firstParam(value);
    if (v) {
      filters[key] = v;
    }
  }
  return filters;
};

/** legacy `pc/game/game_genre_grid.html` head. title=getPrimaryGenreName(genre_code) 동적, description·author 빈, amazonbot noarchive. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const genreCode = resolveGenreCode(firstParam(sp.genre_code));
  const data = await getGameGenreList(genreCode, 1, collectFilters(sp));
  return {
    title: data.genreName,
    description: "",
    authors: [{ name: "" }],
    other: { amazonbot: "noarchive" },
  };
}

export default async function GameGenreGridPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const genreCode = resolveGenreCode(firstParam(sp.genre_code));
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  const data = await getGameGenreList(genreCode, page, collectFilters(sp));

  return <GameGenreScreen data={data} genreCode={genreCode} viewType="grid" />;
}
