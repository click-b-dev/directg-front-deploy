"use server";

import { getPreorderList } from "@entities/preorder-list/api/get-preorder-list";
import type { PreorderTitle } from "@entities/preorder-list";

/**
 * "더보기" 증분 로드 — legacy `mobile/game/game_preorder_ajax.php`(POST {page}) 대응.
 * getPreorderList(nextPage) 재사용. 호출부가 nextPage를 직접 전달한다.
 */
export async function loadMorePreorder(nextPage: number): Promise<PreorderTitle[]> {
  const { list } = await getPreorderList(nextPage);
  return list;
}
