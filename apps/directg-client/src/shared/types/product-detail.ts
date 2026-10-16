/**
 * 상품 상세(게임/DLC/번들/패키지/액세서리/홀로모델) 공유 구조 타입.
 * 여러 entity 슬라이스가 공유하므로 shared에 둔다(entity 간 교차 import 금지).
 * snake_case verbatim(백엔드 계약).
 */

/** 미디어(유튜브 + 스크린샷) 병합 항목. */
export interface MediaItem {
  /** 'video' | 이미지 file_type | '' */
  media_type: string;
  media_id: string | number;
  media_url: string;
  media_thumb: string;
}

/** 옵션상품(기본게임/에디션/DLC/DLC번들) 공통. */
export interface GameOption {
  product_code: number;
  product_name: string;
  goods_sku: string;
  /** '1' steam | '34' epic | '35' rockstar | '51' holomodels */
  product_platform: string;
  price: number;
  consumer_price: number;
  discount: number;
  /** DLC번들 전용 프로모션 할인율(legacy $dlc_bundle['promotion_discount']) */
  promotion_discount?: number;
  /** '1' 코드 | '2' 택배 | '3' 코드+택배 */
  delivery_type: string;
  /** 'Y' | 'N' */
  is_bonus: string;
  is_preorder: string;
  soldout: string;
  /** 'Y' | 'N' — getPromotionGoodsPrice sale_price>0 */
  is_promotion: string;
  /** 'bg-danger'(프로모션) | 'bg-primary' */
  promotion_label: string;
  promotion_end: string;
  /** 'Y' | 'N' — 세션 위시 여부(비로그인 N) */
  wishlist_chk: string;
}

/** 추천상품(유사 타이틀) 카드. */
export interface RecommandItem {
  sku: string;
  title_id: string;
  domain: string;
  product_code: number;
  product_name: string;
  consumer_price: number;
  price: number;
  discount: number;
  delivery_type: string;
  is_preorder: string;
  is_bonus: string;
  is_promotion: string;
  promotion_label: string;
}
