import type { ProductThumb } from "@entities/product-thumb";

/** ProductThumb fixture 빌더 (기본값 = 정가/게임/스팀/비로그인). */
export const makeProductThumb = (overrides: Partial<ProductThumb> = {}): ProductThumb => ({
  view_url: "/game/game_view?product_id=1&sku=1&platform=1",
  // 개발 fixture: 상대 domain → next.config rewrite로 placeholder 이미지 로드
  domain: "",
  product_code: 1,
  product_name: "샘플 게임",
  goods_sku: "SKU-1",
  is_promotion: "N",
  promotion_end: "",
  promotion_label: "bg-primary",
  discount: 0,
  consumer_price: 0,
  price: 0,
  delivery_type: "1",
  spoken_korean: "N",
  interface_korean: "N",
  exclusive_korean: "N",
  is_preorder: "N",
  is_bonus: "N",
  is_naverpay_coupon: "N",
  is_add_repay: "N",
  soldout: "N",
  game_type: "game",
  display_type: "basic",
  product_platform: "1",
  wishlist_chk: "N",
  ...overrides,
});
