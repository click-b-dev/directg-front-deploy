import type { Metadata, Viewport } from "next";

import { getGameSearch } from "@entities/game-search/api/get-game-search";
import { MobileGameSearchScreen } from "@screens/mobile-game-search";

/** legacy mobile game_search.html: width=device-width, initial/minimum/maximum-scale=1, viewport-fit=cover, theme-color #000. */
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

/** legacy page_title 분기(L33~45): 통합검색 → interface → spoken → exclusive(순서상 최종 우선). */
const resolveTitle = (sp: Record<string, string | string[] | undefined>): string => {
  let title = "통합검색";
  if (firstParam(sp.interface_korean) === "Y") title = "자막 한국어지원";
  if (firstParam(sp.spoken_korean) === "Y") title = "음성 한국어지원";
  if (firstParam(sp.exclusive_korean) === "Y") title = "독점 한국어지원";
  return title;
};

/** page 제외 필터 파라미터 수집(q 포함 — 백엔드 검색). sort는 별도. */
const collectFilters = (sp: Record<string, string | string[] | undefined>) => {
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page" || key === "sort") continue;
    const v = firstParam(value);
    if (v) {
      filters[key] = v;
    }
  }
  return filters;
};

/** legacy mobile game_search.html head: title 동적, description/keywords 빈값, apple-web-app 메타. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: resolveTitle(sp),
    description: "",
    keywords: "",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
  };
}

export default async function MobileGameSearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q);
  const sort = firstParam(sp.sort);
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const filters = collectFilters(sp);

  const data = await getGameSearch(page, filters, sort);

  return <MobileGameSearchScreen data={data} pageTitle={resolveTitle(sp)} q={q} sort={sort} />;
}
