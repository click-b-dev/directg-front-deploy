import type { Metadata, Viewport } from "next";

import { getGameList } from "@entities/game-list/api/get-game-list";
import { GameHolomodelsScreen } from "@screens/game-holomodels";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** page 제외 필터 + product_type=holomodels 주입(legacy aside → find_in_set). */
const collectFilters = (sp: Record<string, string | string[] | undefined>) => {
  const filters: Record<string, string> = { product_type: "holomodels" };
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page") continue;
    const v = firstParam(value);
    if (v) {
      filters[key] = v;
    }
  }
  return filters;
};

/** legacy `pc/game/holomodels_list.html` head. title="홀로 모델"(정적), description·author 빈, amazonbot noarchive. */
export const metadata: Metadata = {
  title: "홀로 모델",
  description: "",
  authors: [{ name: "" }],
  other: { amazonbot: "noarchive" },
};

export default async function HolomodelsListPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  const data = await getGameList(page, collectFilters(sp));

  return <GameHolomodelsScreen data={data} viewType="list" />;
}
