/**
 * 공통 상품 카드 데이터 (legacy `game/thumb_inc.php` + `Draw::getProductInfo`).
 * 추천·특집/신규/예약 등 여러 섹션에서 재사용.
 * 백엔드 계약: docs/migration/storefront/main/game-lists.md — snake_case 유지.
 */
export interface ProductThumb {
  view_url: string;
  domain: string;
  product_code: number;
  product_name: string;
  goods_sku: string;
  /** 'Y' | 'N' */
  is_promotion: string;
  promotion_end: string;
  /** 'bg-danger'(프로모션) | 'bg-primary' */
  promotion_label: string;
  discount: number;
  consumer_price: number;
  price: number;
  /** '1' 코드 | '2' 택배 | '3' 코드+택배 */
  delivery_type: string;
  /** 'Y' | 'N' */
  spoken_korean: string;
  interface_korean: string;
  exclusive_korean: string;
  is_preorder: string;
  is_bonus: string;
  is_naverpay_coupon: string;
  is_add_repay: string;
  soldout: string;
  /** 'game' | 'dlc' | 'music' | 'bundle' | 'holomodels' | 'accessories' */
  game_type: string;
  /** 'basic' | 'edition' | 'multi' | 'holomodels' | 'holomodelsdlc' | 'holomodelsedition' | ... */
  display_type: string;
  /** '1' steam | '34' epic | '35' rockstar | '51' holomodels | ... */
  product_platform: string;
  /** 'Y' | 'N' — 세션 위시 여부(비로그인 N) */
  wishlist_chk: string;
  /** 추가적립 표기(예: "1,000P") */
  repay_point?: string;
  /** 타이틀 id — 모바일 `#main_new` 카드 title 헤더 이미지(`/upload/title/{title_id}/header/{title_id}.jpg`)용(모바일 이관 증분). */
  title_id?: string;
  /** 타이틀 sku — 모바일 `#main_new` 카드 상세 url(`product_id={title_sku}`)용. goods_sku와 구분(모바일 이관 증분). */
  title_sku?: string;
}
