/** 예약구매 타이틀의 옵션(게임/에디션/DLC 병합, legacy getTitle*List). */
export interface PreorderOption {
  product_code: string;
  product_name: string;
  /** 상시판매가(정가). */
  consumer_price: number;
  /** 판매가(프로모션 시 sale_price). */
  price: number;
  /** 할인율(>0이면 프로모션). */
  discount: number;
  is_promotion: "Y" | "N";
  /** 프로모션 badge 클래스(bg-danger / bg-primary). */
  promotion_label: string;
}

/** 예약구매 타이틀 1건 (legacy getGoodsOptionPreOrderM 결과 + 옵션 병합). */
export interface PreorderTitle {
  title_id: string;
  /** 대표상품 sku — game_view product_id. */
  sku: string;
  title_name: string;
  /** 이미지 도메인(header.jpg prefix). */
  domain: string;
  /** 출시 예정일(타이틀 단위, 옵션 행 header 표시). */
  release_date: string;
  options: PreorderOption[];
}

/**
 * 예약구매 목록 (legacy `mobile/game/game_preorder.html` — `Goods::getGoodsOptionPreOrderM`, release_date>오늘).
 * 계약: `GET /api/game/preorder`. 타이틀 단위 페이지네이션 + 타이틀별 옵션 병합(game/edition/dlc).
 * 문서: docs/migration/storefront/mobile/game-preorder.md
 */
export interface PreorderListResponse {
  list: PreorderTitle[];
  page: number;
  totalPages: number;
  /** 총 결과 수(total_results, "총 N 개"). */
  total: number;
}
