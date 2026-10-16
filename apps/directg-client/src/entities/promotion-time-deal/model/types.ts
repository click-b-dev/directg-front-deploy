/**
 * 타임딜 랜딩 (legacy `pc/promotion/time_deal.html`) 응답 타입.
 * 백엔드가 getGoodsItemDetail + getGoodsOptionDescription + getTimedealSchedule 를 조립.
 * 계약: `GET /api/promotion/time-deal?product_code={code}`
 * 문서: docs/migration/storefront/promotion/time-deal.md
 */

export interface TimeDealSchedule {
  /** tbl_timedeal.timedeal_price — 할인가. */
  timedeal_price: number;
  /** tbl_timedeal.timedeal_srp — 할인율 계산 기준 정가. */
  timedeal_srp: number;
  /** tbl_timedeal.timedeal_end — 타임딜 종료(unix seconds). 카운트다운 대상. */
  timedeal_end: number;
}

export interface PromotionTimeDealResponse {
  /** tbl_goods_item.is_view — 'N'이면 "타임딜 진행기간이 아닙니다." 분기. */
  is_view: string;
  goods_sku: string;
  product_code: string;
  product_name: string;
  /** '1' steam | '34' epic (그 외 로고 없음). */
  product_platform: string;
  /** 정상가. */
  consumer_price: number;
  /** getGoodsOptionDescription.region_msg — 지역제한 안내(없으면 ""). */
  region_msg: string;
  /** getTimedealSchedule — 활성 타임딜 없으면 null. */
  timedeal: TimeDealSchedule | null;
}
