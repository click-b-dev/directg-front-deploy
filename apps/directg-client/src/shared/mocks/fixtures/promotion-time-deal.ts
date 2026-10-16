import type { PromotionTimeDealResponse } from "@entities/promotion-time-deal";

/**
 * 타임딜 랜딩 mock (legacy time_deal.html, product_code=50005634).
 * timedeal_end 는 핸들러에서 now 기준 동적 주입(카운트다운 표시용) — 여기선 goods/가격만 고정.
 */
export const promotionTimeDealFixture: Omit<PromotionTimeDealResponse, "timedeal"> = {
  is_view: "Y",
  goods_sku: "timedeal-sku-50005634",
  product_code: "50005634",
  product_name: "샘플 타임딜 게임",
  product_platform: "1",
  consumer_price: 66000,
  region_msg: "본 상품은 대한민국 지역에서만 활성화 가능합니다.",
};

/** tbl_timedeal 고정 가격(할인가/정가). timedeal_end 는 핸들러가 채움. */
export const promotionTimeDealSchedule = {
  timedeal_price: 39600,
  timedeal_srp: 66000,
};
