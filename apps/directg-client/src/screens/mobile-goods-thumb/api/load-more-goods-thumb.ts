"use server";

import { getGameList } from "@entities/game-list/api/get-game-list";
import type { ProductThumb } from "@entities/product-thumb";
import type { ProductFilterParams } from "@entities/promotion-ing";

/**
 * "더보기" 증분 로드 — legacy `mobile/game/goods_thumb_ajax.php`(page N 조회) 대응.
 * getGameList 재사용. filters에 `product_type=accessories`가 포함되어 전달된다(page-level 주입 유지).
 */
export async function loadMoreGoodsThumb(
  nextPage: number,
  filters: ProductFilterParams,
): Promise<ProductThumb[]> {
  const { list } = await getGameList(nextPage, filters);
  return list;
}
