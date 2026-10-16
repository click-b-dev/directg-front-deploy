import type { Metadata, Viewport } from "next";

import { getGameCategoryList } from "@entities/game-category/api/get-game-category-list";
import { GoodsCategoryScreen } from "@screens/goods-category";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** legacy 기본 category_code(빈값 → P0003001). */
const resolveCategoryCode = (raw: string): string => raw || "P0003001";

/** page/category_code 제외 필터 + product_type=accessories 주입(legacy aside → find_in_set). */
const collectFilters = (sp: Record<string, string | string[] | undefined>) => {
  const filters: Record<string, string> = { product_type: "accessories" };
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page" || key === "category_code") continue;
    const v = firstParam(value);
    if (v) {
      filters[key] = v;
    }
  }
  return filters;
};

/** legacy `pc/game/goods_category_list.html` head. title=getTagName(category_code) 동적, description·author 빈, amazonbot noarchive. */
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

export default async function GoodsCategoryListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const categoryCode = resolveCategoryCode(firstParam(sp.category_code));
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  const data = await getGameCategoryList(categoryCode, page, collectFilters(sp));

  return <GoodsCategoryScreen data={data} categoryCode={categoryCode} viewType="list" />;
}
