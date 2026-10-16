"use server";

import { getPublisherLanding } from "@entities/game-publisher-landing/api/get-publisher-landing";
import type { ProductThumb } from "@entities/product-thumb";

/**
 * "더보기" 증분 로드 — legacy `game_publisher_ajax.php`(POST {page,publisher_code,sort}) 대응.
 * **legacy ajax는 publisher_code·sort만 전달**(초기 SSR의 다른 필터 드롭 quirk) — 그대로 재현.
 */
export async function loadMorePublisherLanding(
  publisherCode: string,
  nextPage: number,
  sort: string,
): Promise<ProductThumb[]> {
  const { list } = await getPublisherLanding(publisherCode, nextPage, {}, sort);
  return list;
}
