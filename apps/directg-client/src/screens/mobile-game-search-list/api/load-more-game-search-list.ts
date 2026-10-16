"use server";

import { getGameList } from "@entities/game-list/api/get-game-list";
import type { ProductThumb } from "@entities/product-thumb";
import type { ProductFilterParams } from "@entities/promotion-ing";

/**
 * "더보기" 증분 로드 — legacy `mobile/game/game_search_list_ajax.php`(page N 조회) 대응.
 * search_thumb/game_list과 동일 데이터(getGameList). q는 filters에 포함. 호출부가 nextPage를 직접 전달한다.
 * (legacy ajax 구형 인라인 카드 divergence는 game_list 게이트 승인대로 list_inc 카드로 통일 —
 *  docs/migration/storefront/mobile/game-list.md 참조)
 */
export async function loadMoreGameSearchList(
  nextPage: number,
  filters: ProductFilterParams,
): Promise<ProductThumb[]> {
  const { list } = await getGameList(nextPage, filters);
  return list;
}
