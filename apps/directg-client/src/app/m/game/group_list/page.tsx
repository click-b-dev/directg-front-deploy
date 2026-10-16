import type { Metadata, Viewport } from "next";

import { getGameGroupList } from "@entities/game-group/api/get-game-group-list";
import { MobileGroupListScreen } from "@screens/mobile-group-list";

/** legacy mobile group_list.html: width=device-width, initial/minimum/maximum-scale=1, viewport-fit=cover, theme-color #000. */
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

/** page/idx 제외 필터 파라미터 수집 (백엔드 필터). idx는 별도 전달. */
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

/** legacy mobile group_list.html head: title=group subject 동적, description 빈값, apple-web-app 메타. */
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
    appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
  };
}

export default async function MobileGroupListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const idx = firstParam(sp.idx);
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const filters = collectFilters(sp);

  const data = await getGameGroupList(idx, page, filters);

  return <MobileGroupListScreen data={data} idx={idx} filters={filters} />;
}
