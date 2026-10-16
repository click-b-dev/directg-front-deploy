"use server";

import { getGameGroupList } from "@entities/game-group/api/get-game-group-list";
import type { ProductThumb } from "@entities/product-thumb";
import type { ProductFilterParams } from "@entities/promotion-ing";

/**
 * "더보기" 증분 로드 — legacy `mobile/game/group_thumb_ajax.php`(page N 조회) 대응.
 * getGameGroupList(idx, page, filters) 재사용. 호출부가 nextPage를 직접 전달한다.
 */
export async function loadMoreGroupThumb(
  idx: string,
  nextPage: number,
  filters: ProductFilterParams,
): Promise<ProductThumb[]> {
  const { list } = await getGameGroupList(idx, nextPage, filters);
  return list;
}
