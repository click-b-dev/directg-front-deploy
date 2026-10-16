import type { Metadata, Viewport } from "next";

import { getPromotionIngList } from "@entities/promotion-ing/api/get-promotion-ing-list";
import { MobilePromotionIngListScreen } from "@screens/mobile-promotion-ing-list";

/** legacy mobile promotion_ing_list.html head. */
export const metadata: Metadata = {
  title: "진행중인 프로모션",
  description: "",
  keywords: "",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
};

/** legacy mobile viewport/theme-color. */
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

export default async function MobilePromotionIngListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;
  const filters = collectFilters(sp);
  const data = await getPromotionIngList(page, filters);

  return <MobilePromotionIngListScreen data={data} filters={filters} />;
}
