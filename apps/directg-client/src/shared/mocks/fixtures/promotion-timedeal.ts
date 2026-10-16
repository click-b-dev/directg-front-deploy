import type { TimedealGoods, TimedealEvent } from "@entities/promotion-timedeal";

/**
 * 개발용 fixture — 백엔드(`GET /api/promotion/timedeal`) 준비 전 주입.
 * legacy DGKR tbl_event(timedeal='Y') + tbl_event_goods ⋈ tbl_goods 결과 형태.
 * end_dt(카운트다운 종료)는 handler에서 미래 시각으로 주입.
 */
export const mobileTimedealEventFixture: TimedealEvent = {
  idx: 8801,
  subject: "9월 타임딜 - 발더스 게이트 3",
  end_dt: "", // handler에서 now+8h로 설정
};

export const mobileTimedealGoodsFixture: TimedealGoods = {
  goods_code: "50005634",
  goods_name: "발더스 게이트 3 디지털 딜럭스 에디션",
  goods_info: "본편 + 디지털 딜럭스 DLC 포함",
  consumer_price: 88000,
  sale_price: 52800,
  discount_rate: 40,
  age_limit: 18,
  open_graph: "bg3_og.jpg",
  event_ea: 100,
  order_ea: 62,
};
