/**
 * 장바구니 (legacy `tbl_cart` — Order::getCartList + 프로모션/타이틀 enrich).
 * 계약: `GET /api/order/cart`, `POST /api/order/cart`.
 * 문서: docs/migration/storefront/order/cart.md
 */
export interface CartPromotion {
  discount_rate: number;
  sale_price: number;
}

export interface CartItem {
  product_code: string;
  goods_sku: string;
  product_name: string;
  /** "retail" 등 — view_url 분기. */
  product_type: string;
  game_type: string;
  display_type: string;
  /** "1" steam | "34" epic | "35" rockstar | "51" holomodels | ... */
  product_platform: string;
  /** "1" 코드 | "2" 택배 | "3" 코드+택배 */
  delivery_type: string;
  /** "Y" | "N" */
  is_preorder: string;
  is_bonus: string;
  consumer_price: number;
  /** 상시할인 반영 판매가(백엔드 계산). */
  price: number;
  /** 상시 할인률(백엔드 계산). */
  discount: number;
  /** 프로모션 적용 시 객체, 없으면 null (legacy `is_array($value['promotion'])` 판정). */
  promotion: CartPromotion | null;
  /** "1"=선택됨(주문 대상). 서버 영속 선택상태. */
  selected: string;
  /** getGoodsOptionTitleInfo['sku'] — game/retail/holomodels view_url용. */
  title_sku: string;
}

export interface CartListResponse {
  list: CartItem[];
}

/** 장바구니 액션 (legacy cart_proc.php mode). add_cart는 상품페이지 트리거로 본 단위 밖. */
export interface CartActionRequest {
  mode: "cart_item_select" | "cart_item_deselect" | "del_cart" | "select_del_cart";
  goods_sku?: string;
  goods_sku_arr?: string[];
}

export interface CartActionResponse {
  error_code?: string;
  error_msg?: string;
}
