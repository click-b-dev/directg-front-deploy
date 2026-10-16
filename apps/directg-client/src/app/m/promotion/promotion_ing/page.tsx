import type { Metadata, Viewport } from "next";

import { getPromotionIngList } from "@entities/promotion-ing/api/get-promotion-ing-list";
import { MobilePromotionIngLandingScreen } from "@screens/mobile-promotion-ing-landing";

/** legacy mobile promotion_ing.html: width=device-width, initial/minimum/maximum-scale=1, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile promotion_ing.html head: title="진행중인 프로모션", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "진행중인 프로모션",
  description: "",
  keywords: "",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** page 제외 필터 수집(sort 포함 — 백엔드 정렬/필터). */
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

export default async function MobilePromotionIngLandingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sort = firstParam(sp.sort);
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  const data = await getPromotionIngList(page, collectFilters(sp));

  return <MobilePromotionIngLandingScreen data={data} sort={sort} />;
}
