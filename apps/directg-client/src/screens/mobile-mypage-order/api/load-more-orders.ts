"use server";

import { getMypageOrders } from "@entities/mypage-order/api/get-mypage-orders";
import type { MypageOrderItem } from "@entities/mypage-order";

/**
 * "더보기" 증분 로드 — legacy `mobile/mypage/mypage_order_ajax.php`(page N 조회 + 카드 append) 대응.
 * 검색어(search_product_name)를 유지해 필터된 목록을 이어 로드한다.
 */
export async function loadMoreOrders(
  nextPage: number,
  searchProductName: string,
): Promise<MypageOrderItem[]> {
  const { list } = await getMypageOrders(nextPage, searchProductName || undefined);
  return list;
}
