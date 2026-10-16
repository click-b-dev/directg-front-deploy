"use server";

import { getGameSearch } from "@entities/game-search/api/get-game-search";
import type { ProductThumb } from "@entities/product-thumb";

/**
 * "더보기" 증분 로드 — legacy `mobile/game/game_search_ajax.php`(POST {page,q,sort}) 대응.
 * **legacy ajax는 q·sort만 전달**(초기 SSR의 다른 필터는 드롭) — quirk 그대로 재현.
 * 호출부가 nextPage를 직접 전달한다.
 */
export async function loadMoreGameSearch(
  nextPage: number,
  q: string,
  sort: string,
): Promise<ProductThumb[]> {
  const { list } = await getGameSearch(nextPage, { q }, sort);
  return list;
}
