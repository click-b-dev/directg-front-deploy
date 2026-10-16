import type { Metadata, Viewport } from "next";

import { getPromotionIngList } from "@entities/promotion-ing/api/get-promotion-ing-list";
import { PromotionIngScreen } from "@screens/promotion-ing";

/** legacy `pc/promotion/promotion_ing_thumb.html` head. title="할인진행중", description·author 빈값, amazonbot noarchive. */
export const metadata: Metadata = {
  title: "할인진행중",
  description: "",
  authors: [{ name: "" }],
  other: { amazonbot: "noarchive" },
};

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function PromotionIngThumbPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  // legacy filter_include.php GET 파라미터 → 백엔드 계약(page 제외 전부 전달, 백엔드가 필터링).
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page") continue;
    const v = firstParam(value);
    if (v) {
      filters[key] = v;
    }
  }

  const data = await getPromotionIngList(page, filters);

  return <PromotionIngScreen data={data} viewType="thumb" />;
}
