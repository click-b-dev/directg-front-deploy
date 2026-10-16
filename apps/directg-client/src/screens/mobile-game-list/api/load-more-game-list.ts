"use server";

import { getGameList } from "@entities/game-list/api/get-game-list";
import type { ProductThumb } from "@entities/product-thumb";
import type { ProductFilterParams } from "@entities/promotion-ing";

/**
 * "더보기" 증분 로드 — legacy `mobile/game/game_list_ajax.php`(page N 조회) 대응.
 * thumb 파일럿과 동일 데이터(getGameList) — 카드만 list_inc 형태. 호출부가 nextPage를 직접 전달한다.
 * (legacy ajax는 구형 인라인 카드를 렌더하나, 백엔드 단일 계약 + 선례에 따라 list_inc 카드로 통일 —
 *  docs/migration/storefront/mobile/game-list.md의 divergence 노트 참조)
 */
export async function loadMoreGameList(
  nextPage: number,
  filters: ProductFilterParams,
): Promise<ProductThumb[]> {
  const { list } = await getGameList(nextPage, filters);
  return list;
}
