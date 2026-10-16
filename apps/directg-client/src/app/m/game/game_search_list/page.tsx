import type { Metadata, Viewport } from "next";

import { getGameList } from "@entities/game-list/api/get-game-list";
import { MobileGameSearchListScreen } from "@screens/mobile-game-search-list";

/** legacy mobile game_search_list.html: width=device-width, initial/minimum/maximum-scale=1, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** legacy mobile game_search_list.html head: title="통합검색 - {q}", description 빈값, apple-web-app 메타. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: `통합검색 - ${firstParam(sp.q)}`,
    description: "",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
  };
}

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

export default async function MobileGameSearchListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q);
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const filters = collectFilters(sp);

  const data = await getGameList(page, filters);

  return <MobileGameSearchListScreen data={data} filters={filters} pageTitle={`통합검색 - ${q}`} />;
}
