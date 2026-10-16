import type { Metadata, Viewport } from "next";

import { getGameList } from "@entities/game-list/api/get-game-list";
import { MobileHolomodelsListScreen } from "@screens/mobile-holomodels-list";

/** legacy mobile holomodels_list.html: width=device-width, initial/minimum/maximum-scale=1, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile holomodels_list.html head: title="홀로 모델"(정적), description 빈값, apple-web-app 메타. */
export const metadata: Metadata = {
  title: "홀로 모델",
  description: "",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** page 제외 필터 수집 + product_type=holomodels 주입(legacy base where holomodels, PC 선례). */
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

export default async function MobileHolomodelsListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const filters = collectFilters(sp);

  const data = await getGameList(page, filters);

  return <MobileHolomodelsListScreen data={data} filters={filters} />;
}
