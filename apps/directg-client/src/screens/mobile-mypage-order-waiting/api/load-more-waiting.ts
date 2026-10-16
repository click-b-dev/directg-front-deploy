"use server";

import { getMypageOrdersWaiting } from "@entities/mypage-order/api/get-mypage-orders-waiting";

import { flattenWaitingOrders, type MobileWaitingCard } from "../lib/flatten-waiting";

/**
 * "더보기" 증분 로드 — legacy `mobile/mypage/mypage_order_wating_ajax.php`(page N 조회 + 카드 append) 대응.
 * grouped 응답을 평면 카드로 변환해 이어 붙인다.
 */
export async function loadMoreWaiting(nextPage: number): Promise<MobileWaitingCard[]> {
  const { list } = await getMypageOrdersWaiting(nextPage);
  return flattenWaitingOrders(list);
}
