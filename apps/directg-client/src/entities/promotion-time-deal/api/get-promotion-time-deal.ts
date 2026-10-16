import { apiClient } from "@shared/api/client";
import type { PromotionTimeDealResponse } from "../model/types";

/**
 * 타임딜 랜딩 조회 (server-only). `GET /api/promotion/time-deal?product_code={code}` —
 * legacy `pc/promotion/time_deal.html`. product_code 는 legacy 페이지 하드코딩 상수를 그대로 전달.
 * (장바구니 로그인 게이트는 client이므로 쿠키 전달 불필요.)
 */
export async function getPromotionTimeDeal(
  productCode: string,
): Promise<PromotionTimeDealResponse> {
  return apiClient.get<PromotionTimeDealResponse>(
    `promotion/time-deal?product_code=${encodeURIComponent(productCode)}`,
  );
}
