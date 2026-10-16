/**
 * 모바일 타임딜 (legacy `mobile/promotion/timedeal.html` — DGKR DB 이벤트 구동형).
 * PC `entities/promotion-time-deal`(메인 DB·하드코딩 product)과 **별개 데이터 모델**.
 * 계약: `GET /api/promotion/timedeal`.
 * 문서: docs/migration/storefront/mobile/promotion-timedeal.md
 */

/** 타임딜 상품 (tbl_goods ⋈ tbl_event_goods). */
export interface TimedealGoods {
  goods_code: string;
  goods_name: string;
  /** goods_info1 — legacy raw echo(HTML 가능). 있을 때만 카드 렌더. */
  goods_info: string;
  consumer_price: number;
  sale_price: number;
  discount_rate: number;
  /** tbl_goods.age_limit(raw). 화면에서 age 이미지용 변환(0→10, 18→19, else 그대로). */
  age_limit: number;
  /** open_graph 파일명 → https://directg.net/upload/product/{open_graph}. */
  open_graph: string;
  /** 이벤트 수량 / 백엔드 조정 주문수(max(order_ea, 기간 내 주문 count)). event_ea-order_ea<=50 → 소진임박 배지. */
  event_ea: number;
  order_ea: number;
}

/** 타임딜 이벤트 (tbl_event, timedeal='Y' 최신 1건). */
export interface TimedealEvent {
  idx: number;
  subject: string;
  /** 카운트다운 종료 일시('Y-m-d H:i:s'). */
  end_dt: string;
}

export interface TimedealResponse {
  /** idx(이벤트+상품) 존재 여부. false면 404 이미지만. */
  active: boolean;
  event: TimedealEvent | null;
  goods: TimedealGoods | null;
}
