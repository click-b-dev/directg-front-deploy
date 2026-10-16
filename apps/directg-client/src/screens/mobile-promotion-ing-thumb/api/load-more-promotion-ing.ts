"use server";

import { getPromotionIngList } from "@entities/promotion-ing/api/get-promotion-ing-list";
import type { ProductFilterParams } from "@entities/promotion-ing";
import type { ProductThumb } from "@entities/product-thumb";

/**
 * "더보기" 증분 로드 — legacy `mobile/promotion/promotion_ing_thumb_ajax.php` 대응.
 * legacy는 현재 data-page를 보내면 PHP가 +1 하지만, 호출부가 nextPage를 직접 계산한다.
 */
export async function loadMorePromotionIng(
  nextPage: number,
  filters: ProductFilterParams,
): Promise<ProductThumb[]> {
  const { list } = await getPromotionIngList(nextPage, filters);
  return list;
}
