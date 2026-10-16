"use server";

import { getGamePublisherList } from "@entities/game-publisher/api/get-game-publisher-list";
import type { ProductThumb } from "@entities/product-thumb";
import type { ProductFilterParams } from "@entities/promotion-ing";

/**
 * "더보기" 증분 로드 — legacy `mobile/game/publisher_<brand>_{thumb,list}_ajax.php`(page N 조회) 대응.
 * getGamePublisherList(publisherCode, page, filters) 재사용. 호출부가 nextPage를 직접 전달한다.
 */
export async function loadMorePublisher(
  publisherCode: string,
  nextPage: number,
  filters: ProductFilterParams,
): Promise<ProductThumb[]> {
  const { list } = await getGamePublisherList(publisherCode, nextPage, filters);
  return list;
}
