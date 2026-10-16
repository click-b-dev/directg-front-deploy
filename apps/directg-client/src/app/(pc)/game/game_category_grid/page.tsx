import type { Metadata, Viewport } from "next";

import { getGameCategoryList } from "@entities/game-category/api/get-game-category-list";
import { GameCategoryScreen } from "@screens/game-category";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** legacy 기본 category_code(빈값 → C0001001 싱글플레이어). */
const resolveCategoryCode = (raw: string): string => raw || "C0001001";

/** page 제외 필터 파라미터 수집 (category_code 포함 — 백엔드 필터). */
const collectFilters = (sp: Record<string, string | string[] | undefined>) => {
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page" || key === "category_code") continue;
    const v = firstParam(value);
    if (v) {
      filters[key] = v;
    }
  }
  return filters;
};

/** legacy `pc/game/game_category_grid.html` head. title=getTagName(category_code) 동적, description·author 빈, amazonbot noarchive. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const categoryCode = resolveCategoryCode(firstParam(sp.category_code));
  const data = await getGameCategoryList(categoryCode, 1, collectFilters(sp));
  return {
    title: data.tagName,
    description: "",
    authors: [{ name: "" }],
    other: { amazonbot: "noarchive" },
  };
}

export default async function GameCategoryGridPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const categoryCode = resolveCategoryCode(firstParam(sp.category_code));
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  const data = await getGameCategoryList(categoryCode, page, collectFilters(sp));

  return <GameCategoryScreen data={data} categoryCode={categoryCode} viewType="grid" />;
}
