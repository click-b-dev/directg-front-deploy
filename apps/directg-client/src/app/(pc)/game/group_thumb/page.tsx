import type { Metadata, Viewport } from "next";

import { getGameGroupList } from "@entities/game-group/api/get-game-group-list";
import { GameGroupScreen } from "@screens/game-group";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** page/idx 제외 필터 파라미터 수집 (백엔드 필터). */
const collectFilters = (sp: Record<string, string | string[] | undefined>) => {
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page" || key === "idx") continue;
    const v = firstParam(value);
    if (v) {
      filters[key] = v;
    }
  }
  return filters;
};

/** legacy `pc/game/group_thumb.html` head. title=group subject 동적, description·author 빈. **amazonbot meta 없음**(legacy 미설정). */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const data = await getGameGroupList(firstParam(sp.idx), 1, collectFilters(sp));
  return {
    title: data.subject,
    description: "",
    authors: [{ name: "" }],
  };
}

export default async function GroupThumbPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const idx = firstParam(sp.idx);
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  const data = await getGameGroupList(idx, page, collectFilters(sp));

  return <GameGroupScreen data={data} idx={idx} viewType="thumb" />;
}
