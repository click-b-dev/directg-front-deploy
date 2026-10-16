"use server";

import { getGameList } from "@entities/game-list/api/get-game-list";
import type { ProductThumb } from "@entities/product-thumb";
import type { ProductFilterParams } from "@entities/promotion-ing";

/**
 * "더보기" 증분 로드 — legacy `mobile/game/game_platform_thumb_ajax.php`(page N 조회 + thumb_inc 렌더) 대응.
 * legacy는 클릭 시 현재 data-page를 보내고 서버가 +1 하지만, 여기서는 호출부가 nextPage(=data-page+1)를
 * 직접 전달한다(동작 동일). platform은 filters에 포함되어 getGameList로 전달된다.
 */
export async function loadMoreGames(
  nextPage: number,
  filters: ProductFilterParams,
): Promise<ProductThumb[]> {
  const { list } = await getGameList(nextPage, filters);
  return list;
}
