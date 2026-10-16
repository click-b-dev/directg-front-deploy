"use server";

import { getPromotionIngList } from "@entities/promotion-ing/api/get-promotion-ing-list";
import type { ProductThumb } from "@entities/product-thumb";

/**
 * "더보기" 증분 로드 — legacy `mobile/promotion/promotion_ajax.php`(POST {page,sort}) 대응.
 * **legacy ajax는 sort만 전달**(초기 SSR의 다른 필터 드롭 quirk) — 그대로 재현.
 */
export async function loadMorePromotionIngLanding(
  nextPage: number,
  sort: string,
): Promise<ProductThumb[]> {
  const { list } = await getPromotionIngList(nextPage, sort ? { sort } : {});
  return list;
}
